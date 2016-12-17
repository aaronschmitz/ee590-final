//
// Usage:
//   node test_parser.js filename
//

Parser = require('./parser.js')
fs = require('fs')

if (process.argv.length < 3) {
  file = "./test"
}
else{
  file = process.argv[2]
}

fs.readFile(file, 'ascii', function(err, data) {
  if (err) throw err;
  p = new Parser(data)
  p.parse();
});