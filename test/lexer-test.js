import Tokens from "../lib/tokens.js";
import assert from "assert";
import fs from "fs";
import Lexer from "../lib/lexer.js"

const list = fs.readFileSync(__dirname + "/data/list.td");
const biglist = fs.readFileSync(__dirname + "/data/biglist.td");

const list_tokens = JSON.parse(fs.readFileSync(__dirname + "/data/list-tokens.json").toString());


describe('Lexer', function() {
    it("should lex simple edge cases", function() {
        let lexer = new Lexer();
        assert.deepEqual(lexer.lex(""), []);
        assert.deepEqual(lexer.lex("hello"),
            [Tokens.EXPR("hello")]);
        assert.deepEqual(lexer.lex("hello\nworld"),
            [Tokens.EXPR("hello"), Tokens.EXPR("world")]);
    });
    it("should ignore linebreaks by default", function() {
        let lexer1 = new Lexer(),
            lexer2 = new Lexer({linebreaks: false});
        assert.deepEqual(lexer1.lex("hello\n\nworld"),
            [Tokens.EXPR("hello"), Tokens.EXPR("world")]);
        assert.deepEqual(lexer2.lex("hello\n\nworld"),
            [Tokens.EXPR("hello"), Tokens.EXPR("world")]);
        assert.deepEqual(lexer1.lex("\n"), []);
    });
    it("should fail on bad indentation", function() {
        let lexer = new Lexer();
        // orphan
        assert.throws(() => (lexer.lex("hello\n  world\n !"))
            , /Inconsistent/);
        // mixed tabs and spaces
        assert.throws(() => (lexer.lex("hello\n  world\n\t!"))
            , /mix/);
    });
    it("lexes list.td", function() {
        let lexer = new Lexer();
        assert.deepEqual(lexer.lex(list.toString()),
            list_tokens);
    });
    describe("(linebreaks = true)", function() {
        let lexer = new Lexer({linebreaks: true});
        it("lexes initial edge cases", function() {
            assert.deepEqual(lexer.lex("\nA"),
                [Tokens.EXPR(""), Tokens.EXPR("A")]);
            assert.deepEqual(lexer.lex("\nA\n \nB"),
                [Tokens.EXPR(""), Tokens.EXPR("A"), Tokens.EXPR(""), Tokens.EXPR("B")]);
        });
        it("should ignore trailing newlines", function() {
            assert.deepEqual(lexer.lex("\nA\n"),
                [Tokens.EXPR(""), Tokens.EXPR("A")]);
        });
        it("should properly assigns newlines", function() {
            assert.deepEqual(lexer.lex("A\n B\n\n C"),
                [Tokens.EXPR("A"), Tokens.INDENT(1), Tokens.EXPR("B"),  Tokens.EXPR(""), Tokens.EXPR("C"), Tokens.DEDENT(1)]);
            assert.deepEqual(lexer.lex("A\n B\n\nC"),
                [Tokens.EXPR("A"), Tokens.INDENT(1), Tokens.EXPR("B"),  Tokens.DEDENT(1), Tokens.EXPR(""), Tokens.EXPR("C")]);
        });
    });
    describe("(specified indent)", function() {
        it("works with 4 spaces", function() {
            let lexer = new Lexer({indent: "    "});
            assert.deepEqual(lexer.lex("A\n    B\n            C\nD"),
                [Tokens.EXPR("A"), Tokens.INDENT(1), Tokens.EXPR("B"), Tokens.INDENT(2), Tokens.EXPR("C"), Tokens.DEDENT(2), Tokens.DEDENT(1), Tokens.EXPR("D")]);
        });
        it("works with tab", function() {
            let lexer = new Lexer({indent: "\t"});
			assert.deepEqual(lexer.lex("A\n\tB\n\t\t\tC\nD"),
                [Tokens.EXPR("A"), Tokens.INDENT(1), Tokens.EXPR("B"), Tokens.INDENT(2), Tokens.EXPR("C"), Tokens.DEDENT(2), Tokens.DEDENT(1), Tokens.EXPR("D")]);
        });
        it("works with tabtab", function() {
            let lexer = new Lexer({indent: "\t\t"});
			assert.deepEqual(lexer.lex("A\n\t\tB\n\t\t\t\t\t\tC\nD"),
                [Tokens.EXPR("A"), Tokens.INDENT(1), Tokens.EXPR("B"), Tokens.INDENT(2), Tokens.EXPR("C"), Tokens.DEDENT(2), Tokens.DEDENT(1), Tokens.EXPR("D")]);
        });
        it("should fail to initialize Lexer with mixed indent", function() {
            assert.throws(() => new Lexer({indent: "\t "}), /Invalid/);
        });
    });
});
