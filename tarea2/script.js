function skipSpace(string) {
  // El regex encuentra los espacios (incluyendo tabs y saltos de línea) y las líneas que tienen un # al principio
  // match regresa un array con los elementos encontrados, nos quedamos con el primero y encontramos su longituud para
  // con slice quedarnos con todo a partir del final del match
  var ignora = string.match(/^([ \t\r\n]|\#.*)*/);
  return string.slice(ignora[0].length);
}

//builds syntax tree
function parseApply(expr, program) {
  program = skipSpace(program);
  if (program[0] != "(")
    return {expr: expr, rest: program};

  program = skipSpace(program.slice(1));
  expr = {type: "apply", operator: expr, args: []};
  while (program[0] != ")") {
    var arg = parseExpression(program);
    expr.args.push(arg.expr);
    program = skipSpace(arg.rest);
    if (program[0] == ",")
      program = skipSpace(program.slice(1));
    else if (program[0] != ")")
      throw new SyntaxError("Expected ',' or ')'");
  }
  return parseApply(expr, program.slice(1));
}

// function parseExpression(program) {
//   program = skipSpace(program);
//   var match, expr;
//   if (match = /^"([^"]*)"/.exec(program))
//     expr = {type: "value", value: match[1]};
//   else if (match = /^\d+\b/.exec(program))
//     expr = {type: "value", value: Number(match[0])};
//   else if (match = /^[^\s(),"]+/.exec(program))
//     expr = {type: "word", name: match[0]};
//   else
//     throw new SyntaxError("Unexpected syntax: " + program);
// 
//   return parseApply(expr, program.slice(match[0].length));
// }

function parseExpression(program) {
  program = skipSpace(program);
  var match, expr;
  if (match = /^"([^"]*)"/.exec(program))
    expr = {type: "value", value: match[1]};
  else if (match = /^\d+\b/.exec(program))
    expr = {type: "integer", value: Number(match[0])};
  else if (match = /^\d+\b.\d+\b/.exec(program))
    expr = {type: "float", value: Number(match[0])};  
  else if (match = /^[^\s(),"]+/.exec(program))
    expr = {type: "word", name: match[0]};
  else
    throw new SyntaxError("Unexpected syntax: " + program);

  return parseApply(expr, program.slice(match[0].length));
}

function parse(program) {
  var result = parseExpression(program);
  if (skipSpace(result.rest).length > 0)
    throw new SyntaxError("Unexpected text after program");
  return result.expr;
}

function evaluate(expr, env) {
  switch(expr.type) {
    case "integer":
      return expr.value;

    case "float":
      return expr.value;

    case "word":
      if (expr.name in env)
        return env[expr.name];
      else
        throw new ReferenceError("Undefined variable: " +
                                 expr.name);
    case "apply":
      if (expr.operator.type == "word" &&
          expr.operator.name in specialForms)
        return specialForms[expr.operator.name](expr.args,
                                                env);
      var op = evaluate(expr.operator, env);
      if (typeof op != "function")
        throw new TypeError("Applying a non-function.");
      return op.apply(null, expr.args.map(function(arg) {
        return evaluate(arg, env);
      }));
  }
}
// special tokens
// if
var specialForms = Object.create(null);
specialForms["if"] = function(args, env) {
  if (args.length != 3)
    throw new SyntaxError("Bad number of args to if");

  if (evaluate(args[0], env) !== false)
    return evaluate(args[1], env);
  else
    return evaluate(args[2], env);
};

// while
specialForms["while"] = function(args, env) {
  if (args.length != 2)
    throw new SyntaxError("Bad number of args to while");

  while (evaluate(args[0], env) !== false)
    evaluate(args[1], env);

  return false;
};

// for
// implementation maybe complete...
specialForms["for"] = function(args, env) {
  if (args.length != 4)
    throw new SyntaxError("Bad number of args to for");

  for (evaluate(args[0], env); evaluate(args[1], env); evaluate(args[2], env))
    evaluate(args[3], env);

  return false;
};

// do
specialForms["do"] = function(args, env) {
  var value = false;
  args.forEach(function(arg) {
    value = evaluate(arg, env);
  });
  return value;
};

// define
specialForms["define"] = function(args, env) {
  if (args.length != 2 || args[0].type != "word")
    throw new SyntaxError("Bad use of define");
  var value = evaluate(args[1], env);
  env[args[0].name] = value;
  return value;
};

// set: similar to define, which gives a variable a new value, updating the variable in an outer scope if it doesn’t already exist in the inner scope. 
// If the variable is not defined at all, the function throws a ReferenceError.
specialForms["set"] = function(args, env) {
  if (args.length != 2 || args[0].type != "word")
    throw new SyntaxError("Bad use of set");
  var varName = args[0].name;
  var value = evaluate(args[1], env);

  for (var scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, varName)) {
      scope[varName] = value;
      return value;
    }
  }
  throw new ReferenceError("Setting undefined variable " + varName);
};

// defines env
var topEnv = Object.create(null);

// boolean vals
topEnv["true"] = true;
topEnv["false"] = false;

// other operands
// <= and >= added
["+", "-", "*", "/", "==", "<", ">", "<=", ">="].forEach(function(op) {
  topEnv[op] = new Function("a, b", "return a " + op + " b;");
});

// print func
topEnv["print"] = function(value) {
  console.log(value);
  return value;
};

// arrays
// http://www.nfriedly.com/techblog/2009/06/advanced-javascript-objects-arrays-and-array-like-objects/
// http://www.javascriptkit.com/javatutors/arrayprototypeslice.shtml
topEnv["array"] = function() {
   return Array.prototype.slice.call(arguments, 0);
};

// length of an array
topEnv["length"] = function(array) {
   return array.length;
};

// get the nth element of an array
topEnv["element"] = function(array, position) {
   return array[position];
};

// sum_array
topEnv["sum_array"] = function(array) {
  sum = array.reduce(function(a, b) { return a + b; }, 0);
  return sum;
};

// sort_array
topEnv["sum_array"] = function(array) {
  sum = array.reduce(function(a, b) { return a + b; }, 0);
  return sum;
};

// run program
// The use of Array.prototype.slice.call is a trick to turn an array-like object, such as arguments, into a real array so that we can call join on it. 
// It takes all the arguments given to run and treats them as the lines of a program.
function run() {
  var env = Object.create(topEnv);
  var program = Array.prototype.slice
    .call(arguments, 0).join("\n");
  return evaluate(parse(program), env);
}

// function construct "fun"
specialForms["fun"] = function(args, env) {
  if (!args.length)
    throw new SyntaxError("Functions need a body");
  function name(expr) {
    if (expr.type != "word")
      throw new SyntaxError("Arg names must be words");
    return expr.name;
  }
  var argNames = args.slice(0, args.length - 1).map(name);
  var body = args[args.length - 1];

  return function() {
    if (arguments.length != argNames.length)
      throw new TypeError("Wrong number of arguments");
    var localEnv = Object.create(env);
    for (var i = 0; i < arguments.length; i++)
      localEnv[argNames[i]] = arguments[i];
    return evaluate(body, localEnv);
  };
};

// program example with while
run("do(define(total, 0),",
    "   define(count, 1),",
    "   while(<=(count, 11),",
    "         do(define(total, +(total, count)),",
    "            define(count, +(count, 1)))),",
    "   print(total))");

// program example with for
run("do(define(total, 0),",
    "   define(n, 11),",
    "   for(define(count, 0), <=(count, n), define(count, +(count, 1)),",
    "         do(define(total, +(total, count)))),",
    "   print(total))");

run("do(print(sum_array(array(1,2,3))))");

run("do(print(sum_array(array(1,\"a\",3))))");

run("do(define(sum, fun(array,",
    "     do(define(i, 0),",
    "        define(sum, 0),",
    "        while(<(i, length(array)),",
    "          do(define(sum, +(sum, element(array, i))),",
    "             define(i, +(i, 1)))),",
    "        sum))),",
    "   print(sum(array(1, 2, 3))))");
// → 6

console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}

console.log(parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}