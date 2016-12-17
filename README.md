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