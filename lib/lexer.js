// # tabdown/lexer

import assert from "assert"
import Tokens from "./tokens"


// ## Lexer
//
// A lexer for tabdown.
class Lexer {
    constructor(options) {
        this.options = options || {};
        this.options.linebreaks = this.options.linebreaks || false;
    }

    //#### lexer.lex
    //
    //Takes a source String.
    //
    //Returns an array of Tokens
    lex (source) {
        let options = Object.assign({}, this.options);
        options.indent = options.indent ||
            _detectIndentUnit(source) || 
            ' ';

        let iteratedLexer = new IteratedLexer(options);
        let tokens = iteratedLexer.lex(source)
            .concat(iteratedLexer.finish());
        return tokens;
    }
}

function _detectIndentUnit (source) {
    let search = /(^[\t ])+\S+/m.exec(source);
    if (search !== null) {
        return search[1];
    }
}

// ## ArrayWithSum
//
// Array with memoized sum
class ArrayWithSum {
    constructor(array) {
        this._array = array;
        this._sum = 0;
        for (let i = 0; i< this._array.length; i++) {
            this._sum += this._array[i];
        }
    }
    push(val) {
        this._array.push(val);
        this._sum += val;
    }
    pop() {
        let val = this._array.pop();
        this._sum -= val;
        return val;
    }
    unshift(val) {
        this._array.unshift(val);
        this._sum += val;
    }
    shift() {
        let val = this._array.shift();
        this._sum -= val;
        return val;
    }
    get(i) {
        return this._array[i];
    }
    set(i, val) {
        let orig = this._array[i];
        this._array[i] = val;
        this._sum += val - orig;
    }
    length() {
        return this._array.length;
    }
    sum() {
        return this._sum;
    }
    head() {
        return this._array[0];
    }
    tail() {
        return this._array[this._array.length - 1];
    }
}


// ## IteratedLexer
//
// Under-the-hood, asynchronous implementation of a Lexer. Meant to be used once.
//
// Lexes via multiple `.lex(str)` calls, and finishes with `.finish()`
//
// Automatically detects indentation type.
class IteratedLexer {
    constructor (options) {
        this.buf = "";
        this.indent = new ArrayWithSum([0]);
        this.tabs = 0;
        this.options = options;
        assert(typeof this.options.indent === "string", "Indentation unit not specified!");
    }

    static isFormattingLine (x) {
        return x.length === 0 || x[0] === " " || x[0] == "\t";
    }

    // #### iteratedlexer.lex
    //
    // Takes a string for input.
    //
    // Returns an array of tokens.
    lex(input) {
        let tokens = [];

        for (let c of input) {
            if (c === "\n") {
                assert(!/^\s+\S+/.test(this.buf), "Lexer: Indentation Error! Something went wrong...");
                if (IteratedLexer.isFormattingLine(this.buf)) {
                    if (this.options.linebreaks) tokens.push(Tokens.EXPR(""));
                    this.buf = ""; //If the line is just whitespace, we ignore it.
                    this.tabs = 0;
                } else {
                    if (this.tabs > this.indent.sum()) {
                        let val = this.tabs - this.indent.sum();
                        this.indent.push(val);
                        tokens.push(Tokens.INDENT(val));
                    } else while (this.tabs < this.indent.sum()) {
                        tokens.push(Tokens.DEDENT(this.indent.pop()));
                    }
                    assert(this.tabs === this.indent.sum(), "Lexer: Indentation Error! Inconsistent indentation levels...");
                    tokens.push(Tokens.EXPR(this.buf));
                    this.tabs = 0;
                    this.buf = "";
                }
            } else {
                this.buf += c;
                if (this.buf === this.options.indent) {
                    this.tabs += 1;
                    this.buf = "";
                }
            }
            // this.debug();
            // console.log(tokens);
        }
        return tokens;
    }

    // #### iteratedlexer.finish
    //
    //Returns tokens from leftovers in buffer.
    finish() {
        this.options.linebreaks = false;
        let tokens = this.lex('\n');

        while (this.indent.sum() > 0) {
            tokens.push(Tokens.DEDENT(this.indent.pop()));
        }
        this.finished = true;
        return tokens;
    }

    debug () {
        console.log("");
        console.log("buf: " + JSON.stringify(this.buf));
        console.log("indent: " + JSON.stringify(this.indent));
        console.log("tabs: " + this.tabs);
        console.log("");
    }
}

export default Lexer;

//##TODO
//- make detectIndentUnit take GCD of indentations
//- fail on mix tabs and spaces
//- make it streaming both in and out
// - make sure indent autodetection works for 
//- perf testing
