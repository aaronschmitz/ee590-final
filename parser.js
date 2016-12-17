Tokenizer = require('./tokenizer.js')

function ParserException(name, pos)
{
    this.name = name;
    this.position = pos;
    this.toString = function() {
      return this.name + " exception at character " + this.position + " (0-indexed)";
    }
}

function Parser(str) {

  this.str = str; // the string to be parsed

  this.variables = {true: true, false: false, null: null};
  
  this.functions = {print : function(input) {console.log (input);},
                    string : function(input) {return JSON.stringify(input);}}

  this.tokenizer = new Tokenizer();

  this.tokenizer
      .add(/\+/)
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
      // Matches all strings with appropriate escaping
      .add(/\"(\\.|[^\"])*\"/)
      // Matches all identifiers starting with letter or underscore
      .add(/[a-zA-Z_][a-zA-Z0-9_]*/)
      // Second half matches numbers starting with .; first half matches all other floats
      .add(/[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?|\.?[0-9]+([eE][-+]?[0-9]+)?/);

  this.tokenizer.tokenize(this.str);
}

Parser.prototype.number = function() {
  var num;
  if (this.tokenizer.is_num()) {
    num = this.tokenizer.float_val();
    this.tokenizer.eat();
  } else {
    throw new ParserException("Unexpected token", this.tokenizer.pos());
  }

  return num;
}
    
Parser.prototype.array = function() {
  var arr = [];
  var i = 0;
  if (!this.tokenizer.matches("["))
  {
    throw new ParserException("Array requires starting square bracket", this.tokenizer.pos());
  }
  this.tokenizer.eat();
  while (!this.tokenizer.matches("]"))
  {
    if (!this.tokenizer.matches(","))
    {
      arr[i] = this.expression();
      if (this.tokenizer.matches("]"))
      {
        break;
      }
      if (!this.tokenizer.matches(","))
      {
        throw new ParserException("Comma expected after array element", this.tokenizer.pos());
      }
    }

    i++;
    this.tokenizer.eat();
  }

  this.tokenizer.eat();

  return arr;
}
    
Parser.prototype.hash = function() {
  var hash = {};
  if (!this.tokenizer.matches("{"))
  {
    throw new ParserException("Hash requires starting curly bracket", this.tokenizer.pos());
  }
  this.tokenizer.eat();
  while (!this.tokenizer.matches("}"))
  {
    var key = this.identifier();
    if (!this.tokenizer.matches(":"))
    {
      throw new ParserException("Colon expected after hash key", this.tokenizer.pos());
    }
    this.tokenizer.eat();

    hash[key] = this.expression();
    
    if (this.tokenizer.matches("}"))
    {
      break;
    }
    if (!this.tokenizer.matches(","))
    {
      throw new ParserException("Comma expected after hash pair", this.tokenizer.pos());
    }

    this.tokenizer.eat();
  }

  this.tokenizer.eat();

  return hash;
}

Parser.prototype.string = function() {
  var tmpstr;
  var str = "";
  if (this.tokenizer.is_str()) {
    tmpstr = this.tokenizer.current();
    this.tokenizer.eat();
  } else {
    throw new ParserException("Unexpected token", this.tokenizer.pos());
  }
  
  for (var i = 1; i < tmpstr.length - 1; i++)
  {
    if (tmpstr[i] == "\\" && tmpstr[i + 1] == "\"")
    {
      str += "\"";
      i++;
    }
    else if (tmpstr[i] == "\\" && tmpstr[i + 1] == "\\")
    {
      str += "\\";
      i++;
    }
    else
    {
      str += tmpstr[i];
    }
  }

  return str;
}

Parser.prototype.variable = function() {
  var variable = this.getVariable();
  var val;

  if (this.tokenizer.matches("("))
  {
    val = this.func(variable);
  }
  else
  {
    val = this.evalVariable(variable);
  }

  return val;
}

Parser.prototype.func = function(variable) {
  if (variable === undefined)
  {
    variable = this.getVariable();
  }

  var result;
  if (!this.tokenizer.matches("("))
  {
    throw new ParserException("Function requires starting parenthesis", this.tokenizer.pos());
  }
  this.tokenizer.eat();
  if (this.tokenizer.matches(")"))
  {
    this.tokenizer.eat();
    this.callFunction(variable);
  }
  else
  {
    var value = this.expression();
    if (!this.tokenizer.matches(")"))
    {
      throw new ParserException("Expected closing parenthesis after function call", this.tokenizer.pos());
    }
    this.tokenizer.eat();

    result = this.callFunction(variable, value);
  }
  return result;
}

Parser.prototype.factor = function() {
  var val;
  if(this.tokenizer.matches("("))
  {
    this.tokenizer.eat();
    val = this.expression();

    if ( this.tokenizer.matches(")") )
    {
      this.tokenizer.eat();
    } else {
      throw new ParserException("Expected closing parenthesis", this.tokenizer.pos());
    }
  } else if (this.tokenizer.matches("+") || this.tokenizer.matches("-")) {
    var negative = false;
    if (this.tokenizer.matches("-"))
    {
      negative = true;
    }
    this.tokenizer.eat();

    val = this.factor();
    if (typeof val != "number" && typeof val != "boolean")
    {
      throw new ParserException("Cannot apply sign to non-number.", this.tokenizer.pos());
    }
    
    if (negative)
    {
      val = -val;
    }
  } else if (this.tokenizer.is_num()) {
    val = this.number();
  } else if (this.tokenizer.is_str()) {
    val = this.string();
  } else if (this.tokenizer.is_ident()) {
    val = this.variable();
  } else if (this.tokenizer.matches("[")) {
    val = this.array();
  } else if (this.tokenizer.matches("{")) {
    val = this.hash();
  } else {
    throw new ParserException("Unexpected token", this.tokenizer.pos());
  }

  return val;
}

Parser.prototype.term = function() {
  var val = this.factor();

  if (typeof val == "number" || typeof val == "boolean")
  {
    while (this.tokenizer.matches("*") || this.tokenizer.matches("/") || this.tokenizer.matches("%"))
    {
      var op = this.tokenizer.current();
      var pos = this.tokenizer.pos();
      this.tokenizer.eat();

      var num = this.factor();

      if (op == "*")
      {
        val *= num;
      } else if (op == "/" && num == 0) {
        throw new ParserException("Division by zero", pos);
      } else if (op == "/") {
        val /= num;
      } else if (op == "%" && num == 0) {
        throw new ParserException("Modulo by zero", pos);
      } else {
        val %= num;
      }
    }
  }

  return val;
}

Parser.prototype.expression = function(first) {
  
  var val;
  if (first !== undefined) {
    val = first;
  } else {
    val = this.term();
  }
  
  while (this.tokenizer.matches("+") || this.tokenizer.matches("-"))
  {
    var negative = false;
    if (this.tokenizer.matches("-"))
    {
      this.tokenizer.eat();
      if (typeof val != "number" && typeof val != "boolean")
      {
        throw new ParserException("Subtraction cannot be applied to non-number", this.tokenizer.pos());
      }
      var sub = this.term()
      if (typeof sub != "number" && typeof sub != "boolean")
      {
        throw new ParserException("Non-number cannot be subtracted", this.tokenizer.pos());
      }
      val -= sub;
    } else {
      this.tokenizer.eat();
      if (typeof val != "number" && typeof val != "string" && typeof val != "boolean")
      {
        throw new ParserException("Addition cannot be applied to non-number/string", this.tokenizer.pos());
      }
      var sub = this.term()
      if (typeof sub != "number" && typeof sub != "string" && typeof sub != "boolean")
      {
        throw new ParserException("Non-number/string cannot be added", this.tokenizer.pos());
      }
      val += sub;
    }
  }

  return val;
}

Parser.prototype.identifier = function() {
  var ident;
  if (this.tokenizer.is_ident()) {
    ident = this.tokenizer.current();
    this.tokenizer.eat();
  } else {
    throw new ParserException("Unexpected token", this.tokenizer.pos());
  }

  return ident;
}

Parser.prototype.getVariable = function() {
  var ident = this.identifier();
  var key = undefined;

  if (this.tokenizer.matches("["))
  {
    this.tokenizer.eat();
    key = this.expression();
    if (!this.tokenizer.matches("]"))
    {
      throw new ParserException("Expected closing square bracket", this.tokenizer.pos());
    }
    this.tokenizer.eat();
  } else if (this.tokenizer.matches("."))
  {
    this.tokenizer.eat();
    key = this.identifier();
  }

  return {identifier: ident, key: key};
}

Parser.prototype.evalVariable = function(variable) {
  if (!(variable.identifier in this.variables))
  {
    throw new ParserException("Undefined variable " + variable.identifier, this.tokenizer.pos());
  }
  
  if (variable.key === undefined)
  {
    return this.variables[variable.identifier];
  }

  if (typeof this.variables[variable.identifier] != "object")
  {
    throw new ParserException(variable.identifier + " is not a valid object", this.tokenizer.pos());
  }

  if (this.variables[variable.identifier][variable.key] === undefined)
  {
    if (Array.isArray(this.variables[variable.identifier]))
    {
      throw new ParserException("Undefined index " + variable.key + " in " + variable.identifier, this.tokenizer.pos());
    }
    throw new ParserException("Undefined key " + variable.key + " in " + variable.identifier, this.tokenizer.pos());
  }
  
  return this.variables[variable.identifier][variable.key];
  
}

Parser.prototype.setVariable = function(variable, value) {
  if (variable.key === undefined)
  {
    this.variables[variable.identifier] = value;
  } else {
    if (typeof variable.key == "number")
    {
      if (this.variables[variable.identifier] === undefined)
      {
        this.variables[variable.identifier] = new Array();
      }
      if (typeof this.variables[variable.identifier] != "object")
      {
        throw new ParserException("Array subscript applied to non-array", this.tokenizer.pos());
      }
      this.variables[variable.identifier][variable.key] = value;
    }
    else if (typeof variable.key == "string")
    {
      if (this.variables[variable.identifier] === undefined)
      {
        this.variables[variable.identifier] = new Object();
      }
      if (typeof this.variables[variable.identifier] != "object")
      {
        throw new ParserException("Object key applied to non-object", this.tokenizer.pos());
      }
      this.variables[variable.identifier][variable.key] = value;
    }
  }
}

Parser.prototype.callFunction = function(func, arg) {
  if (this.functions[func.identifier] === undefined)
  {
    throw new ParserException("Undefined function " + func, this.tokenizer.pos());
  }
  if (func.key !== undefined)
  {
    throw new ParserException("Unsupported syntax", this.tokenizer.pos());
  }
  return this.functions[func.identifier](arg);
}

Parser.prototype.statement = function() {
  var result;
  if (this.tokenizer.matches(";"))
  {
    result = null;
  }
  else if (this.tokenizer.is_ident())
  {
    var variable = this.getVariable();
    if (this.tokenizer.matches("="))
    {
      this.tokenizer.eat();
      result = this.expression();
      this.setVariable(variable, result);
    }
    else if (this.tokenizer.matches("("))
    {
      result = this.func(variable);
    } else {
      var value = this.evalVariable(variable);
      result = this.expression(value);
    }
  }
  else
  {
    result = this.expression(value);
  }

  if (!this.tokenizer.matches(";"))
  {
    throw new ParserException("Expected semicolon to end statement", this.tokenizer.pos());
  }

  this.tokenizer.eat();

  //console.log(result);

  return;
}

Parser.prototype.parse = function() {
  var result;

  while (!this.tokenizer.eof())
  {
    this.statement();
  }

  //console.log(this.variables);
  return result;
}

module.exports = Parser;
