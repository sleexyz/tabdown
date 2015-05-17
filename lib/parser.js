//Tabdown Remake
import assert from "assert"
import Lexer from "./lexer"

class Parser {
    constructor() {
        console.log("Parser constructed!");
    }
    parse(stream) {
        return stream;
    }
    noop(input) {
        return input;
    }
}


export default Parser;

// Use immutablejs ordered maps or something
// Abstract away underlying data type
