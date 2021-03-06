Tokenizer = require('./tokenizer.js');
fs = require('fs')

if (process.argv.length < 3) {
  file = "./test"
}
else{
  file = process.argv[2]
}

fs.readFile(file, 'ascii', function(err, data) {
  if (err) throw err;
  t = new Tokenizer();

  t.add(/\+/)
   .add(/-/)
   .add(/\*/)
   .add(/\//)
   .add(/%/)
   .add(/\(/)
   .add(/\)/)
   .add(/\[/)
   .add(/\]/)
   .add(/\./)
   .add(/=/)
   .add(/;/)
   .add(/{/)
   .add(/}/)
   .add(/:/)
   .add(/,/)
   // Matches all double-quoted strings with appropriate escaping
   .add(/\"(\\.|[^\"])*\"/)
   // Matches all single-quoted strings with appropriate escaping
   .add(/'(\\.|[^'])*'/)
   // Matches all identifiers starting with letter or underscore
   .add(/[a-zA-Z_][a-zA-Z0-9_]*/)
   // Second half matches numbers starting with .; first half matches all other floats
   .add(/[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?|\.?[0-9]+([eE][-+]?[0-9]+)?/)
   .tokenize(data);

  console.log(t.tokens);
  while (t.eat())
  {
    var token = t.current();
    var pos = t.pos();
    console.log ("Token %s  \tat %d", token, pos);
  }
});
