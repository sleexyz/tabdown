// # tabdown/lexer

import assert from "assert"
import Tokens from "./tokens"


// ## Lexer
//
// A lexer for tabdown.
function Lexer() {

    //#### lexer.lex
    //
    //Takes a source String.
    //
    //Returns an array of Tokens
    this.lex = function(source) {
        let iteratedLexer = new _IteratedLexer();
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
function _IteratedLexer() {
    let buf = "",
        indentation_type = null,
        indent = [0],
        tabs = 0;

    const isFormattingLine = (x) => x.length === 0 || x[0] === " " || x[0] == "\t";

    const detectIndentationType = function(input) {
        let search = /(^[\t ])+\S+/m.exec(input);
        if (search !== null) {
            console.log(JSON.stringify(search[1]));
            return search[1];
        }
        console.warn("Warning: could not detect indentation type, defaulting to ' '");
        return ' ';
    }

    // #### iteratedlexer.lex
    //
    // Takes a string for input.
    //
    // Returns an array of tokens.
    this.lex = function (input) {
        let tokens = [];

        if (indentation_type === null) {
            indentation_type = detectIndentationType(input);
        }

        for (let c of input) {
            if (c === "\n") {
                assert(!/^\s\S+/.test(buf), "Lexer: Indentation Error!");
                if (isFormattingLine(buf)) {
                    buf = ""; //If the line is just whitespace, we ignore it.
                } else {
                    if (tabs > indent[0]) {
                        indent.unshift(tabs);
                        tokens.push(Tokens.INDENT);
                    } else while (tabs < indent[0]) {
                        tokens.push(Tokens.DEDENT);
                        indent.shift();
                    }
                    tokens.push(Tokens.EXPR(buf));
                    tabs = 0;
                    buf = "";
                }
            } else {
                buf += c;
                if (buf === indentation_type) {
                    tabs += 1;
                    buf = "";
                }
            }
            //this.debug();
        }
        return tokens;
    }

    // #### iteratedlexer.finish
    //
    // 
    //Returns tokens from leftovers in buffer.
    this.finish = function() {
        let tokens = [];
        if (!isFormattingLine(buf)) tokens.push(Tokens.EXPR(buf));
        while (indent.length > 1) {
            tokens.push(Tokens.DEDENT);
            indent.shift();
        }
        this.finished = true;
        return tokens;
    }

    this.debug = function() {
        console.log("buf: " + JSON.stringify(buf));
        console.log("indent: " + JSON.stringify(indent));
        console.log("tabs: " + tabs);
        console.log("");
    }
}

export default Lexer;

//##TODO
//- fix indentation type detection for multiindented files
//- make it streaming both in and out
