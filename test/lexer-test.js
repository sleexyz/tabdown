import Tokens from "../lib/tokens.js";
import assert from "assert";
import fs from "fs";
import Lexer from "../lib/lexer.js"

const list = fs.readFileSync(__dirname + "/data/list.td");
const biglist = fs.readFileSync(__dirname + "/data/biglist.td");

const list_tokens = JSON.parse(fs.readFileSync(__dirname + "/data/list-tokens.json").toString());

describe('Lexer', function() {
    it("lexes initial edge cases", function() {
        let lexer = new Lexer();
        assert.deepEqual(lexer.lex(""), []);
        assert.deepEqual(lexer.lex("hello"),
            [Tokens.EXPR("hello")]);
        assert.deepEqual(lexer.lex("hello\nworld"),
            [Tokens.EXPR("hello"), Tokens.EXPR("world")]);
    });
    it("ignores linebreaks by default", function() {
        let lexer1 = new Lexer(),
            lexer2 = new Lexer({linebreaks: false});
        assert.deepEqual(lexer1.lex("hello\n\nworld"),
            [Tokens.EXPR("hello"), Tokens.EXPR("world")]);
        assert.deepEqual(lexer2.lex("hello\n\nworld"),
            [Tokens.EXPR("hello"), Tokens.EXPR("world")]);
    });
    it("fails to lex bad indentation", function() {
        let lexer = new Lexer();
        // orphan
        assert.throws(() => (lexer.lex("hello\n  world\n !"))
            , /inconsistent/);
        // mixed tabs and spaces
        assert.throws(() => (lexer.lex("hello\n  world\n\t!"))
            , /inconsistent/);
    });
    it("lexes list.td", function() {
        let lexer = new Lexer();
        assert.deepEqual(lexer.lex(list.toString()),
            list_tokens);
    });
    describe("(linebreaks = true)", function() {
        it("lexes initial edge cases", function() {
            let lexer = new Lexer({linebreaks: true});
            assert.deepEqual(lexer.lex("\nhello"),
                [Tokens.EXPR(""), Tokens.EXPR("hello")]);
            //ignores trailing newlines
            assert.deepEqual(lexer.lex("\nhello\n"),
                [Tokens.EXPR(""), Tokens.EXPR("hello")]);
            assert.deepEqual(lexer.lex("\nhello\n\nworld!"),
                [Tokens.EXPR(""), Tokens.EXPR("hello"), Tokens.EXPR(""), Tokens.EXPR("world!")]);
            //properly assigns newlines
            assert.deepEqual(lexer.lex("hello\n world\n\n!"),
                [Tokens.EXPR("hello"), Tokens.INDENT(1), Tokens.EXPR("world"),  Tokens.DEDENT(1), Tokens.EXPR(""), Tokens.EXPR("!")]);
        });
    });
});
