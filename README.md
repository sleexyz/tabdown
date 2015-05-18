# tabdown

Express trees naturally with indentation.



### examples
#### todo list
```
Today:
    finish documentation
    sleep

Tomorrow:
    publish to github

Later:
    Look up
        coltrane changes
        MUSIC-N
```
#### prime factorization
```
24
    6
        2
        3
    4
        2
        2
```

### usage
```
npm install tabdown
```
```es6
import tabdown from "tabdown"
...
```

### use cases
You can work directly with trees generated by tabdown.
This method may be more useful for expressing trees with homogenous node types.

You can also use tokens from `tabdown.lexer` as a base context-free grammar for more complex indentation-sensitive grammars.
This method may be more useful for trees with heterogenous node types.

