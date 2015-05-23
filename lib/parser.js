//Tabdown Remake
import assert from "assert"
import Lexer from "./lexer"
import Tokens from "./tokens"

class Parser {
    constructor(options) {
        this.options = options || {};
        // do we hide some options from lexer?
        this.lexer = new Lexer(options);
    }
    parse(str) {
        let tokens = this.lexer.lex(str);
        let ip = new IteratedParser();
        ip.parse(tokens);
        ip.finish();
        return ip.getTree();
    }
}


// #### Node
class Node {
    constructor(value) {
        this.value = value;
    }
    set indent(indent) {
        this._indent = indent;
        this.children = [];
    }
    get indent(indent) {
        return this._indent;
    }
    add(node) {
        this.children.push(node);
    }
    getLines() {
        const indentation = (function() {
            let _indentation = "";
            for (let i = 0; i< this._indent; i++) {
                _indentation += " ";
            }
            return _indentation;
        }.bind(this))();

        let lines = [this.value];
        if (!this.children) return lines;

        for(let child of this.children) {
            lines = lines.concat(child.getLines().map((_) => indentation + _));
        }
        return lines;
    }
    toSource() {
        return this.getLines().join("\n");
    }
}
class RootNode extends Node {
    constructor() {
        super(null);
        this.children = [];
    }
    getLines() {
        let lines = [];
        for (let child of this.children) {
            lines = lines.concat(child.getLines());
        }
        return lines;
    }
    toSource() {
        return this.getLines().join("\n");
    }
    toString() {
        return JSON.stringify(children);
    }
}


//#### IteratedParser
//
//Piecewise, LL parser. Meant to be used once.
//
//Parse chunk with at least 1 `.parse(tokens)` call, and finish with `.finish()`
class IteratedParser {
    constructor(options) {
        this.root = new RootNode();
        this.lastNode = this.root; //cursor to last node
        this.nodeStack = [this.root]; //via shift/unshift
    }
    //####Tree iteratedparser.getTree
    //
    //Returns Tree
    getTree() {
        return this.root;
    }

    //####void iteratedparser.parse
    //
    //Takes an array of tokens
    parse(tokens) {
        for (let tok of tokens) {
            if (tok.type == "EXPR") {
                this.lastNode = new Node(tok.value);
                this.nodeStack[0].add(this.lastNode);
            }
            else if (tok.type == "INDENT") {
                this.lastNode.indent = tok.value;
                this.nodeStack.unshift(this.lastNode);
            }
            else if (tok.type == "DEDENT") {
                assert(this.nodeStack[0].indent === tok.value);
                this.nodeStack.shift();
            }
        }
    }

    //####void iteratedparser.finish
    //
    //Finalizes parsing job
    finish() {
        //no op
    }
    
}


export default Parser;
