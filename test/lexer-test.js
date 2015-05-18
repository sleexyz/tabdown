import Tokens from "../lib/tokens.js";
import assert from "assert";
import fs from "fs";

const list1 = fs.readFileSync(__dirname + "/data/list1.td");
const list2 = fs.readFileSync(__dirname + "/data/list2.td");

const list1_tokens = JSON.parse(fs.readFileSync(__dirname + "/data/list1-tokens.json").toString());

describe('Lexer', function() {
    let Lexer = require("../lib/lexer.js");
    describe('IteratedLexer', function() {
        it("lexes empty string", function() {
            let lexer = new Lexer();
            assert.deepEqual(lexer.lex(""), []);
        });
        it("lexes hello", function() {
            let lexer = new Lexer();
            assert.deepEqual(lexer.lex("hello"),
                [Tokens.EXPR("hello")]);
        });
        it("lexes hello\\nworld", function() {
            let lexer = new Lexer();
            assert.deepEqual(lexer.lex("hello\nworld"),
                [Tokens.EXPR("hello"), Tokens.EXPR("world")]);
        });
        it("fails to lex bad indentation", function() {
            let lexer = new Lexer();
            assert.throws(
                function() { console.log(lexer.lex("hello\n  world\n !"))}
                , /Indentation/);
        });
        it.skip("fails to lex mixed tabs and spaces", function() {
            let lexer = new Lexer();
            assert.throws(
                function() { console.log(lexer.lex("hello\n  world\n\t!"))}
                , /Indentation/);
        });
        it("ignores newlines by default", function() {
            let lexer1 = new Lexer(),
                lexer2 = new Lexer({lineBreaks: false}),
                str = "hello\n world!\n";
            assert.deepEqual(lexer1.lex(str), lexer2.lex(str));
        });
        it("lexes list1.td", function() {
            let lexer = new Lexer();
            console.log(lexer.lex(list1.toString()));
            assert.deepEqual(lexer.lex(list1.toString()),
                list1_tokens);
        });
    });
});
