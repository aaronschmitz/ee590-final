#Javascript Parser: Aaron Schmitz EE590 Final Project#
##Installation##
NodeJS must be installed. On Ubuntu use:
`sudo apt-get install nodejs`

Clone this repo to your local machine:
`git clone git@github.com:aaronschmitz/ee590-final.git`

Enter the repo:
`cd ee590-final`

Call the parser on your program (note command may be `node` or `nodejs` depending on system):
`nodejs ./run_parser.js FILENAME`

##Testing##
A test file called `test` is provided that excercises all parser functionality including basic and complex arithmatic, string handling, boolean handling, array handling, and hash handling with use of variables and system functions.

###Test Results###
`nodejs ./run_parser.js test`
```
*****Test basic arithmetic*****
  4 + 1:    5
  Expected: 5
  3 * 5:    15
  Expected: 15
  10 / 4:   2.5
  Expected: 2.5
  10 % 4:   2
  Expected: 2
*****Test complex arithmetic*****
  3*(4 + 1):            15
  Expected:             15
  +3 * 2 + 10 / 2:      11
  Expected:             11
  -(1 - 5)*(4 + 1) % 7: 6
  Expected:             6
*****Test string handling*****
  "abc" + "def": abcdef
  Expected:      abcdef
  "abc" + 123:   abc123
  Expected:      abc123
  "\"abc\"":     "abc"
  Expected:      "abc"
  "\\abc\\":     \abc\
  Expected:      \abc\
  'abc' + 'def': abcdef
  Expected:      abcdef
  'a"bc' + 123:  a"bc123
  Expected:      a"bc123
  '\'abc\'':     'abc'
  Expected:      'abc'
  '\\abc\\':     \abc\
  Expected:      \abc\
*****Test boolean handling*****
  true * true:  1
  Expected:     1
  true * false: 0
  Expected:     0
*****Array handling*****
  ********Setup********
       a=[]
       a[0] = 1
       a[1 + 1] = "hi"
       b = [true, 4 + 5, , "test"]
       b[1] = 2 * 2 * 2
  ********Test********
  a:        [1,null,"hi"]
  Expected: [1,null,"hi"]
  b:        [true,8,null,"test"]
  Expected: [true,8,null,"test"]
  b[1]:     8
  Expected: 8
*****Hash handling*****
  *******Setup*******
       c={}
       c.key = 1
       c["test 123"] = "hi"
       d = {a: true, b: 4 + 5, a_b123: "test"}
       d.b = 2 * 2 * 2
       d["hmm" + " mm"] = 2 * 2 * 2
  *******Test*******
  c:           {"key":1,"test 123":"hi"}
  Expected:    {"key":1,"test 123":"hi"}
  d:           {"a":true,"b":8,"a_b123":"test","hmm mm":8}
  Expected:    {"a":true,"b":9,"a_b123":"test","hmm mm":8}
  d["hmm mm"]: 8
  Expected:    8
```

##Architecture##
###File IO###
The first function of the parser is to synchronously read the entire file specified in the first argument into a string.
This synchronous architecture is inefficient and not particularly well-suited to large programs, but is adequate for the purposes of this project.
If no first argument is specified, the parser silently attempts to open `test`.
###Tokenizer###
The tokenizer uses regular expressions to greedily grab the next token out of the string. The tokenizer first tokenizes any punctionation including '+', '-', '*', '/', '%', '(', ')', '[', ']', '.', '=', ';', '{', '}', ':', and ','.
Then all single and double quoted strings are tokenized.
Then identifier (i.e. variable/function) names which may contain only numbers, letters, and underscores and must start with one of the latter two.
Then integers and floating point numbers are tokenized.
Then all whitespace is tokenized in contiquous blocks.
Finally any unidentified tokens are tokenized a character at a time to allow for intelligent error reporting of an unexpected token.

The tokenizers offers a function `next` which advances to the next non-whitespace character
(all whitespace is ignored by the parser except whitespace dividing tokens or within string literals).
The tokenizer also offers several helpful functions to determine the type of token such as `is_num`.
###Recursive Decent Parser###
The terminal tokens are strings, numbers, and variables (note that booleans and null are treated as constant variables).
The terminal tokens can be used on their own or also form hashes, arrays, and function parameters.
The rest of the language is pretty straightforward.
* Factors have strings, numbers, hashes, variables, arrays, functions, or expressions optionally proceeded by one or more unary plus or minus signs where appropriate.
* Terms have one or more factors separated by multiplication, division, or modulus symbols.
* Expressions have one or more terms separated by addition and subtraction symbols.
* Statements have an expression optionally preceeded by an assignment to a variable and followed by a semicolon.
* A program has zero or more statements.

###Variable and Function Management###
Variables are stored in an object hashed by name. Currently all variables are stored directly as `{var_name: value}`.
While this is effective, it would probably be better to store variables as objects `{var_name: {value: value, scope: scope, const: false}}` for further flexibility and functionality.

System functions are stored in a separate object from variables, but could reasonably be merged.
System functions are stored in the form {func_name: function(args) {...}}`

###Array Indices and Hash Keys###
For simplicity, all variables are directly evaluated for array indices and hash keys directly after the variable name is parsed.
This has a couple drawbacks: 2-dimensional arrays such as `A[i][j]` and nested objects such as `X.key1.key2` are not supported.
Also otherwise valid javascript where the indices are applied directly to an object such as `[0,1,2][0]` or `{a:1}.a` or even `(var).key` don't parse.
I plan to correct this shortcoming eventually, but current design seems adequate to meet project requirements.