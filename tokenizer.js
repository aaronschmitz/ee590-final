function Tokenizer(regexps) {

  this.re_string = "";
  this.re;
  this.tokens = [];
  this.index;
  this.strpos;

  if ( regexps ) {
    for ( var i=0; i<regexps.length; i++ ) {
      this.add(regexps[i]);
    }
  }

}

Tokenizer.prototype.add = function(regexp) {
  if ( this.re_string == "" ) {
    this.re_string = regexp.source;
  } else {
    this.re_string += "|" + regexp.source;
  }

  // add |\s to make sure whitespace is tokenized
  // add |. to make sure unexpected tokens are tokenized so we can reject for unexpected tokens
  this.re = RegExp(this.re_string + "|\\s+|.","g");
  return this;
}

Tokenizer.prototype.tokenize = function(str) {
  if (!str)
  {
    str = "";
  }
  
  this.tokens = str.match(this.re);
  this.index = -1;
  this.strpos = 0;
  return this;
}

Tokenizer.prototype.current = function() {
  if (this.index < 0)
  {
    this.next();
  }

  return this.tokens[this.index];
}

Tokenizer.prototype.float_val = function() {
  return parseFloat(this.current());
}

Tokenizer.prototype.next = function() {
  if (this.index >= 0)
  {
    this.strpos += this.tokens[this.index].length;
  }

  this.index++;
  this.whitespace();
  if (this.eof())
  {
    return false;
  }
  return this.tokens[this.index];
}

Tokenizer.prototype.peek = function() {
  var peak_index = this.index + 1;

  while (peak_index < this.tokens.length)
  {
    if (this.is_ws(this.tokens[peak_index]))
	{
      return this.tokens[peak_index];
    }
    peak_index++;
  }

  return false;

}

Tokenizer.prototype.eat = function() {
  return this.next();
}

Tokenizer.prototype.eof = function() {
  return (this.index >= this.tokens.length);
}

Tokenizer.prototype.matches = function(value) {
  return (this.current() == value);
}

Tokenizer.prototype.is_ws = function(value) {
  if (!value)
  {
    var value = this.current()
  }
  return /^\s+$/.test(value);
}

Tokenizer.prototype.is_num = function() {
  return /^[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?|\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(this.current());
}

Tokenizer.prototype.is_str = function() {
  return /^\"(\\.|[^\"])*\"$/.test(this.current());
}

Tokenizer.prototype.is_ident = function() {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.current());
}

Tokenizer.prototype.whitespace = function() {
  while (this.is_ws())
  {
    this.strpos += this.tokens[this.index++].length;
  }
}

Tokenizer.prototype.pos = function(value) {
  return this.strpos;
}

module.exports = Tokenizer;
