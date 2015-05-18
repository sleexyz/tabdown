export default {
    INDENT: (num) => ({type: "INDENT", value: num}),
    DEDENT: (num) => ({type: "DEDENT", value: num}),
    EXPR: (str) => ({type: "EXPR", value: str})
}
