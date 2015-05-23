import Tokens from "../lib/tokens.js";
import assert from "assert";
import fs from "fs";
import Parser from "../lib/parser.js"

const list = fs.readFileSync(__dirname + "/data/list.td");
const biglist = fs.readFileSync(__dirname + "/data/biglist.td");

const list_tokens = JSON.parse(fs.readFileSync(__dirname + "/data/list-tokens.json").toString());


function test(str) {
    return assert(str === this.parser.parse(str).toSource());
}

describe("Parser", function() {
    it("should parse simple edge cases", function() {
        this.parser = new Parser();
        [
            "",
            "hello",
            "hello\n world"
        ].map(test.bind(this));
    });

    it("should parse with linebreaks", function() {
        this.parser = new Parser({linebreaks: true});
        [
            "",
            "hello",
            "hello\n world",
            "hello\n\n world"
        ].map(test.bind(this));
    });
})
