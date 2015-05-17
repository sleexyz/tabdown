export default {
    INDENT: {type: "INDENT"},
    DEDENT: {type: "DEDENT"},
    EXPR: (str) => ({type: "EXPR", value: str})
}
