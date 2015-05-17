import Tokens from "../lib/tokens.js";
import assert from "assert";
import fs from "fs";

const list1 = fs.readFileSync(__dirname + "/list1.td");
const list2 = fs.readFileSync(__dirname + "/list2.td");
const list3 = fs.readFileSync(__dirname + "/list3.td");
const list4 = fs.readFileSync(__dirname + "/list4.td");

const list1_tokens = JSON.parse(fs.readFileSync(__dirname + "/list1-tokens.json").toString());

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
        it("lexes list1.td (basic)", function() {
            let lexer = new Lexer();
            assert.deepEqual(lexer.lex(list1.toString()),
                list1_tokens);
        });
        it("gives same tokens for list2.td and list3.td", function() {
            let lexer = new Lexer();
            assert.deepEqual(lexer.lex(list2.toString()),
                lexer.lex(list3.toString()));
        });
        it("lexes list4.td (two-tabs)", function() {
            let lexer = new Lexer();
            assert.deepEqual(lexer.lex(list4.toString()),
                list1_tokens);
        });
    });
});
