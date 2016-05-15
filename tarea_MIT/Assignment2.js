    // <reference path="default.html" />

var some_vars = [];

// Expressions
var NUM = "NUM";
var FALSE = "FALSE";
var VR = "VAR";
var PLUS = "PLUS";
var TIMES = "TIMES";
var LT = "LT";
var AND = "AND";
var NOT = "NOT";

// Statements
var SEQ = "SEQ";
var IFTE = "IFSTMT";
var WHLE = "WHILESTMT";
var ASSGN = "ASSGN";
var SKIP = "SKIP";
var ASSUME = "ASSUME";
var ASSERT = "ASSERT";

function interpretExpr(e, state) {
    if (e.type == NUM) { return e.val; }
    if (e.type == FALSE) { return false; }
    if (e.type == VR) { return state[e.name]; }
    if (e.type == PLUS) { return interpretExpr(e.left, state) + interpretExpr(e.right, state); }
    if (e.type == TIMES) { return interpretExpr(e.left, state) * interpretExpr(e.right, state); }
    if (e.type == LT) { return interpretExpr(e.left, state) < interpretExpr(e.right, state); }
    if (e.type == AND) { return interpretExpr(e.left, state) && interpretExpr(e.right, state); }
    if (e.type == NOT) { return !interpretExpr(e.left, state); }
}

function interpretStmt(c, state) {
    if (c.type == SEQ) {
        var sigmaPP = interpretStmt(c.fst, state);
        var sigmaP = interpretStmt(c.snd, sigmaPP);
        return sigmaP;
    }
    if (c.type == IFTE) {
        var expr = interpretExpr(c.cond, state);
        if(expr){
            var sigmaP = interpretStmt(c.tcase, state);
        }else{
            var sigmaP = interpretStmt(c.fcase, state);
        }
        return sigmaP;
    }
    if (c.type == WHLE) {
        var expr = interpretExpr(c.cond, state);
        if(expr){           
            var sigmaP = interpretStmt(c.body, state);
            var sigmaPP = interpretStmt(c, sigmaP);
            return sigmaPP;
        }
        return state;
    }
    if (c.type == ASSGN) {
        state[c.vr] = interpretExpr(c.val, state);
        return state;
        
    }
    if (c.type == ASSUME) {
        return state;
    }
    if (c.type == ASSERT) {
        return state;
    }
    if (c.type == SKIP) {
        return state;
    }
}

function interp() {
    clearConsole();
    var prog = eval(document.getElementById("p2input").value);  
    var state = JSON.parse(document.getElementById("State").value);
    var r = interpretStmt(prog, state);
    writeToConsole("Pretty print:");
    writeToConsole(prog.toString());
    writeToConsole("\n Final State:");
    writeToConsole(JSON.stringify(r));
}

function substitute(e, varName, newExp) {
    if (e.type == NUM){
        return e;
    }
    if (e.type == FALSE) {
        return flse();
    }
    if (e.type == VR){
        if (e.name === varName) {
            return newExp;
        } else {
            return e;
        }
    }
    if (e.type == PLUS){
        var left = substitute(e.left, varName, newExp);
        var right = substitute(e.right, varName, newExp);
        return plus(left, right);
    }
    if (e.type == TIMES){
        var left = substitute(e.left, varName, newExp);
        var right = substitute(e.right, varName, newExp);
        return times(left, right);
    }
    if (e.type == LT){
        var left = substitute(e.left, varName, newExp);
        var right = substitute(e.right, varName, newExp);
        return lt(left, right);
    }
    if (e.type == AND){
        var left = substitute(e.left, varName, newExp);
        var right = substitute(e.right, varName, newExp);
        return and(left, right);
    }
    if (e.type == NOT){
        return not(substitute(e.left, varName, newExp));
    }
    if(e.type == SEQ){
        var fst = substitute(e.fst, varName, newExp);
        var snd = substitute(e.snd, varName, newExp);
        return seq(fst, snd);
    }
}

// We know we can only aim for a "great" (whatever that means) vc instead of a wpc for a while
function wpc(c, predQ) {
    if (c.type == SKIP){
        return predQ;
    }
    if (c.type == ASSUME){
        return oor(not(c.exp), predQ);
    }
    if (c.type == ASSERT){
        return and(c.exp, predQ);
    }
    if (c.type == SEQ){
        var seq1 = wpc(c.snd, predQ);
        var seq2 = wpc(c.fst, seq1);
        return  seq2;
    }
    if (c.type == ASSGN){
        return substitute(predQ, c.vr, c.val);
    }
    if (c.type == IFTE){
        var ifte1 = wpc(c.tcase, predQ);
        var ifte2 = wpc(c.fcase, predQ);
        var ifte3 = oor(and(c.cond, ifte1), and(not(c.cond), ifte2));
        return ifte3;
    }
    if (c.type == WHLE){
        var b_ = oor(not(c.cond), wpc(c.body, c.inv));
        var c_ = oor(c.cond, predQ);
        var a_ = and(b_, c_);
        var subs = oor(not(c.inv), a_);
        var vars = getUniqueVars(c.inv);
        
        vars.forEach(function(v){
            subs = substitute(subs, v, v + guuid());
        })

//        for(var v in vars){
//            subs = substitute(subs, v, v + guuid());
//        }
       
        return and(c.inv, subs);
    }
}

function getUniqueVars(inv){
    getVars(inv);
    var unique_vars = [];
    // this creates unique list of only strings
    some_vars.forEach(function(v){
        if (typeof(v) == "string" && unique_vars.indexOf(v) == -1){
            unique_vars.push(v);
        }
    })
//    for (var v in some_vars){
//        if (typeof(v) == "string" && unique_vars.indexOf(v) == -1){
//            unique_vars.push(v);
//        }
//    }

    return unique_vars;

}

function getVars(inv){
    if (inv.type == VR){
        return some_vars.push(inv.name);
    }
    if (inv.type == PLUS){
        return some_vars.push(getVars(inv.left), getVars(inv.right));
    }
    if (inv.type == TIMES){
        return some_vars.push(getVars(inv.left), getVars(inv.right));
    }
    if (inv.type == LT){
        return some_vars.push(getVars(inv.left), getVars(inv.right));
    }
    if (inv.type == AND){
        return some_vars.push(getVars(inv.left), getVars(inv.right));
    }
    if (inv.type == NOT){
        return some_vars.push(getVars(inv.left));
    }
    if (inv.type == SEQ){
        return some_vars.push(getVars(inv.fst), getVars(inv.snd));
    }
    if (inv.type == NUM) {
        return some_vars.push(inv.val);
    }
}

function genVC() {
    clearConsole();
    var prog = eval(document.getElementById("p2input").value);
    var r = wpc(prog, tru());

    writeToConsole("WPC:\n" + r.toString());
    writeToConsole("\n\nCode to copy and paste into Z3:\n(assert (not " + r.toZ3() + "))" + "\n(check-sat)");
}


// Help functions for html console
function writeToConsole(text) {
    var csl = document.getElementById("console");
    if (typeof text == "string") {
        csl.textContent += text + "\n";
    } else {
        csl.textContent += text.toString() + "\n";
    }
}

function clearConsole() {
    var csl = document.getElementById("console");
    csl.textContent = "";
}

//Constructor definitions for the different AST nodes.
function str(obj) { return JSON.stringify(obj); }
function flse() {
    return { type: FALSE,
        toString: function () { return "false"; },
        toZ3: function () { return "false"; } };
}
function vr(name) {
    return { type: VR, name: name,
        toString: function () { return this.name; },
        toZ3: function () { return this.name; } };
}
function num(n) {
    return { type: NUM, val: n,
        toString: function () { return this.val; },
        toZ3: function () { return this.val; } };
}
function plus(x, y) {
    return { type: PLUS, left: x, right: y,
        toString: function () { return "(" + this.left.toString() + "+" + this.right.toString() + ")"; },
        toZ3: function () { return "(+ " + this.left.toZ3() + " " + this.right.toZ3() + ") "; } };
}
function times(x, y) {
    return { type: TIMES, left: x, right: y,
        toString: function () { return "(" + this.left.toString() + "*" + this.right.toString() + ")"; },
        toZ3: function () { return "(* " + this.left.toZ3() + " " + this.right.toZ3() + ") "; } };
}
function lt(x, y) {
    return { type: LT, left: x, right: y,
        toString: function () { return "(" + this.left.toString() + "<" + this.right.toString() + ")"; },
        toZ3: function () { return "(< " + this.left.toZ3() + " " + this.right.toZ3() + ") "; } };
}
function and(x, y) {
    return { type: AND, left: x, right: y,
        toString: function () { return "(" + this.left.toString() + "&&" + this.right.toString() + ")"; },
        toZ3: function () { return "(and " + this.left.toZ3() + " " + this.right.toZ3() + ") "; } };
}
function not(x) {
    return { type: NOT, left: x,
        toString: function () { return "(!" + this.left.toString() + ")"; },
        toZ3: function () { return "(not " + this.left.toZ3() + ") "; } };
}
function seq(s1, s2) {
    return { type: SEQ, fst: s1, snd: s2,
        toString: function () { return "" + this.fst.toString() + ";\n" + this.snd.toString(); },
        toZ3: function () { return this.fst.toZ3() + "\n" + this.snd.toZ3(); } };
}
function assume(e) {
    return { type: ASSUME, exp: e,
        toString: function () { return "assume " + this.exp.toString(); },
        toZ3: function () { return "(asumme " + this.exp.toZ3() + ") "; } };
}
function assert(e) {
    return { type: ASSERT, exp: e,
        toString: function () { return "assert " + this.exp.toString(); },
        toZ3: function () { return "(assert " + this.left.toZ3() + ") "; } };
}
function assgn(v, val) {
    return { type: ASSGN, vr: v, val: val,
        toString: function () { return "" + this.vr + ":=" + this.val.toString(); }};
}
function ifte(c, t, f) {
    return { type: IFTE, cond: c, tcase: t, fcase: f,
        toString: function () { return "if(" + this.cond.toString() + "){\n" + this.tcase.toString() + '\n}else{\n' + this.fcase.toString() + '\n}'; },
        toZ3: function () { return "(ite (" + this.cond.toZ3() + ") " + this.tcase.toZ3() + this.fcase.toZ3() + ") ";} };
}
function whle(c, i, b) {
    return { type: WHLE, cond: c, body: b, inv: i,
        toString: function () { return "while(" + this.cond.toString() + "){\n" + this.body.toString() + '\n}'; } };
}
function skip() {
    return { type: SKIP,
        toString: function () { return "/*skip*/"; } };
}

//some useful helpers:
function eq(x, y) {
    return and(not(lt(x, y)), not(lt(y, x)));
}

function gt(x, y){
    return lt(y, x);
}

function gteq(x, y){
    return not (lt(x, y));
}

function tru() {
    return not(flse());
}

function oor(x, y){
    return not(and(not(x), not(y)));

}

function guuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function block(slist) {
    if (slist.length == 0) {
        return skip();
    }
    if (slist.length == 1) {
        return slist[0];
    } else {
        return seq(slist[0], block(slist.slice(1)));
    }
}
