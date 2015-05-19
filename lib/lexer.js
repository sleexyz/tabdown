// # tabdown/lexer

import assert from "assert"
import Tokens from "./tokens"


// ## Lexer
//
// A lexer for tabdown.
class Lexer {
    //##### new Lexer(options)
    //
    //Default options:
    //```
    //{
    //  linebreaks: false,
    //  indent: " "
    //
    //}
    //```
    //
    constructor(options) {
        this.options = options || {};
        this.options.linebreaks = this.options.linebreaks || false;
        this.options.indent = this.options.indent || " ";
        this.options.indent = new Indent(this.options.indent);
    }

    //#### lexer.lex
    //
    //Takes a source String.
    //
    //Returns an array of Tokens
    lex (source) {
        let options = Object.assign({}, this.options);
        let iteratedLexer = new IteratedLexer(options);
        let tokens = iteratedLexer.lex(source)
            .concat(iteratedLexer.finish());
        return tokens;
    }
}

//## Indent
//
//An immutable wrapper class for indents
class Indent {
    //checks if indents are tabs only/spaces only
    constructor(str) {
        this.str = str;
        let search = /(^\t+$|^ +$)/m.exec(str);

        assert(search !== null, "Invalid indentation unit: Must be tabs xor spaces");
        this.basechar = search[1][0];
        this.notbasechar = search[1][0] === ' ' ? '\t' : ' ';
    }
    toString() {
        return String(this.str);
    }
}


// ## Stack with Sum 
//
// Stack with memoized sum
class StackWithSum {
    constructor(array) {
        this._array = array;
        this._sum = 0;
        for (let i = 0; i < this._array.length; i++) {
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
    sum() {
        return this._sum;
    }
}



// ## IteratedLexer
//
// Piecewise, top-down lexer. Meant to be used once.
//
// Lex chunk with at least 1 `.lex(str)` call, and finish with `.finish()`
class IteratedLexer {
    constructor (options) {
        this.buf = "";
        this.indent_buf = "";
        this.indent = new StackWithSum([0]);
        this.tabs = 0;
        this.linebreaks = 0;
        this.options = options;
    }

    static isFormattingLine (x) {
        return x.length === 0 || x[0] === " " || x[0] == "\t";
    }

    // #### iteratedlexer.lex
    //
    // Takes a String chunk.
    //
    // Returns an array of tokens.
    lex(chunk) {
        let tokens = [];

        for (let c of chunk) {
            if (c === "\n") {
                if (IteratedLexer.isFormattingLine(this.buf)) {
                    if (this.options.linebreaks) this.linebreaks += 1;
                    this.buf = "";
                    this.tabs = 0;
                } else {
                    //dedent, then push linebreaks if our current indentation level is lower,
                    if (this.tabs < this.indent.sum()) {
                        while (this.tabs < this.indent.sum()) {
                            tokens.push(Tokens.DEDENT(this.indent.pop()));
                        }
                        for (let i = 0; i < this.linebreaks; i++) {
                            tokens.push(Tokens.EXPR(""));
                        }
                    //push linebreaks, then indent if our current indentation level is higher.
                    } else if (this.tabs > this.indent.sum()) {
                        for (let i = 0; i < this.linebreaks; i++) {
                            tokens.push(Tokens.EXPR(""));
                        }
                        let val = this.tabs - this.indent.sum();
                        this.indent.push(val);
                        tokens.push(Tokens.INDENT(val));
                    //push linebreaks if our current indentation is the same.
                    } else {
                        for (let i = 0; i < this.linebreaks; i++) {
                            tokens.push(Tokens.EXPR(""));
                        }
                    }
                    assert(this.tabs === this.indent.sum(), "Lexer: Indentation Error: Inconsistent indentation levels");

                    tokens.push(Tokens.EXPR(this.buf));
                    this.linebreaks = 0;
                    this.tabs = 0;
                    this.buf = "";
                }
            } else {
                if (this.buf === "" && c === this.options.indent.basechar) {
                    this.indent_buf += c;
                    if (this.indent_buf === this.options.indent.str) {
                        this.tabs += 1;
                        this.indent_buf = "";
                    }
                } else if (this.buf === "" && c === this.options.indent.notbasechar){
                    throw new Error("Lexer: Cannot mix tabs and spaces")
                } else {
                    this.buf += c;
                }
            }
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
        console.log("linebreaks: " + this.linebreaks);
        console.log("");
    }
}

export default Lexer;

//##TODO
//- make it streaming both in and out
// - make sure indent autodetection works. If chunk has no
//- perf testing
