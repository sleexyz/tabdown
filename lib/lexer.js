// # tabdown/lexer

import assert from "assert"
import Tokens from "./tokens"


// ## Lexer
//
// A lexer for tabdown.
class Lexer {
    constructor(options) {
        this.options = options || {};
    }

    //#### lexer.lex
    //
    //Takes a source String.
    //
    //Returns an array of Tokens
    lex (source) {
        let iteratedLexer = new IteratedLexer();
        let tokens = iteratedLexer.lex(source);
        tokens = tokens.concat(iteratedLexer.finish());
        return tokens;
    }
}


// ## IteratedLexer
//
// Under-the-hood, asynchronous implementation of a Lexer.
//
// Lexes via multiple `.lex(str)` calls, and finishes with `.finish()`
//
// Automatically detects indentation type.
class IteratedLexer {
    constructor () {
        this.buf = "";
        this.indentation_type = null;
        this.indent = [0];
        this.tabs = 0;

    }

    static isFormattingLine (x) {
        return x.length === 0 || x[0] === " " || x[0] == "\t";
    }

    static detectIndentationType (input) {
        let search = /(^[\t ])+\S+/m.exec(input);
        if (search !== null) {
            return search[1];
        }
        return ' ';
    }

    // #### iteratedlexer.lex
    //
    // Takes a string for input.
    //
    // Returns an array of tokens.
    lex(input) {
        let tokens = [];

        if (this.indentation_type === null) {
            this.indentation_type = IteratedLexer.detectIndentationType(input);
        }

        for (let c of input) {
            if (c === "\n") {
                assert(!/^\s+\S+/.test(this.buf), "Lexer: Indentation Error!");
                if (IteratedLexer.isFormattingLine(this.buf)) {
                    this.buf = ""; //If the line is just whitespace, we ignore it.
                } else {
                    if (this.tabs > this.indent[0]) {
                        this.indent.unshift(this.tabs);
                        tokens.push(Tokens.INDENT);
                    } else while (this.tabs < this.indent[0]) {
                        tokens.push(Tokens.DEDENT);
                        this.indent.shift();
                    }
                    tokens.push(Tokens.EXPR(this.buf));
                    this.tabs = 0;
                    this.buf = "";
                }
            } else {
                this.buf += c;
                if (this.buf === this.indentation_type) {
                    this.tabs += 1;
                    this.buf = "";
                }
            }
        }
        return tokens;
    }

    // #### iteratedlexer.finish
    //
    //Returns tokens from leftovers in buffer.
    finish() {
        let tokens = [];
        if (!IteratedLexer.isFormattingLine(this.buf)) tokens.push(Tokens.EXPR(this.buf));
        while (this.indent.length > 1) {
            tokens.push(Tokens.DEDENT);
            this.indent.shift();
        }
        this.finished = true;
        return tokens;
    }

    debug () {
        console.log("buf: " + JSON.stringify(this.buf));
        console.log("indent: " + JSON.stringify(this.indent));
        console.log("tabs: " + this.tabs);
        console.log("");
    }
}

export default Lexer;

//##TODO
//- make child indentation  a property of the parent
//- make it streaming both in and out
