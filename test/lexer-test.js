import Tokens from "../lib/tokens.js";
import assert from "assert";
import fs from "fs";

const list1 = fs.readFileSync(__dirname + "/data/list1.td");
const list2 = fs.readFileSync(__dirname + "/data/list2.td");
const list3 = fs.readFileSync(__dirname + "/data/list3.td");
const list4 = fs.readFileSync(__dirname + "/data/list4.td");
const list5 = fs.readFileSync(__dirname + "/data/list5.td");

const list1_tokens = JSON.parse(fs.readFileSync(__dirname + "/data/list1-tokens.json").toString());

describe('Lexer', function() {
    let Lexer = require("../lib/lexer.js");
    describe('IteratedLexer', function() {
        let lexer = new Lexer();
        it("lexes empty string", function() {
            assert.deepEqual(lexer.lex(""), []);
        });
        it("lexes hello", function() {
            assert.deepEqual(lexer.lex("hello"),
                [Tokens.EXPR("hello")]);
        });
        it("lexes hello\\nworld", function() {
            assert.deepEqual(lexer.lex("hello\nworld"),
                [Tokens.EXPR("hello"), Tokens.EXPR("world")]);
        });
        it("lexes list1.td", function() {
            assert.deepEqual(lexer.lex(list1.toString()),
                list1_tokens);
        });
        it("lexes list2.td", function() {
            assert.deepEqual(lexer.lex(list2.toString()),
                list1_tokens);
        });
        it("gives same tokens for list3.td and list4.td", function() {
            assert.deepEqual(lexer.lex(list3.toString()),
                lexer.lex(list4.toString()));
        });
        it("does not lex list5.td", function() {
            //TODO: implement
            console.log(lexer.lex(list5.toString()));
        });
    });
});
