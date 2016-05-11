// <reference path="default.html" />

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
    // SEQ
    if (c.type == SEQ) {
        var sigmaPP = interpretStmt(c.fst, state);
        var sigmaP = interpretStmt(c.snd, sigmaPP);
        return sigmaP;
    }
    // IF THEN ELSE
    if (c.type == IFTE) {
        var expr = interpretExpr(c.cond, state);
        if(expr){
            var sigmaP = interpretStmt(c.tcase, state);
        }else{
            var sigmaP = interpretStmt(c.fcase, state);
        }
        return sigmaP;
    }
    // WHILE
    if (c.type == WHLE) {
        var expr = interpretExpr(c.cond, state);
        if(expr){           
            var sigmaP = interpretStmt(c.body, state);
            var sigmaPP = interpretStmt(c, sigmaP);
            return sigmaPP;
        }
        return state;
    }
    // ASSIGN
    if (c.type == ASSGN) {
        state[c.vr] = interpretExpr(c.val, state);
        return state;
        
    }
    // ASUME
    if (c.type == ASSUME) {
        return state;
    }
    // ASSERT
    if (c.type == ASSERT) {
        return state;
    }
    // SKIP
    if (c.type == SKIP) {
        return state;
    }
}

function substitute(e, varName, newExp) {
    if (e.type == VR) {
        if (e.name === varName) {
            return newExp;
        } else {
            return e;
        }
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

function genVC() {
    clearConsole();
    var prog = eval(document.getElementById("p2input").value);  
    var r = wpc(prog, tru());
    writeToConsole(JSON.stringify(r));
}



function wpc(c, predQ) {
    //predQ is an expression.
    //cmd is a statement.
    if (c.type == SKIP) {
        return predQ;
    }
    if (c.type == ASSUME) {
        return oor(not(c.exp), predQ);
    }
    if (c.type == ASSERT) {
        return and(c.exp, predQ);
    }
    if (c.type == SEQ) {
        var wpc1 = wpc(c.snd, predQ);
        return  wpc(c.fst, wpc1);
    }
    if (c.type == ASSGN) {
        return substitute(predQ, c.vr, c.val);
    }
    if (c.type == IFTE) {
        return oor(and(c.cond, wpc(c.tcase, predQ)), and(not(c.cond), wpc(c.fcase, predQ)));
    }
}


//The stuff you have to implement.
function computeVC(prog) {
    //Compute the verification condition for the program leaving some kind of place holder for loop invariants.
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
    return { type: FALSE, toString: function () { return "false"; } };
}
function vr(name) {
    return { type: VR, name: name, toString: function () { return this.name; } };
}
function num(n) {
    return { type: NUM, val: n, toString: function () { return this.val; } };
}
function plus(x, y) {
    return { type: PLUS, left: x, right: y, toString: function () { return "(" + this.left.toString() + "+" + this.right.toString() + ")"; } };
}
function times(x, y) {
    return { type: TIMES, left: x, right: y, toString: function () { return "(" + this.left.toString() + "*" + this.right.toString() + ")"; } };
}
function lt(x, y) {
    return { type: LT, left: x, right: y, toString: function () { return "(" + this.left.toString() + "<" + this.right.toString() + ")"; } };
}
function and(x, y) {
    return { type: AND, left: x, right: y, toString: function () { return "(" + this.left.toString() + "&&" + this.right.toString() + ")"; } };
}
function not(x) {
    return { type: NOT, left: x, toString: function () { return "(!" + this.left.toString() + ")"; } };
}
function seq(s1, s2) {
    return { type: SEQ, fst: s1, snd: s2, toString: function () { return "" + this.fst.toString() + ";\n" + this.snd.toString(); } };
}
function assume(e) {
    return { type: ASSUME, exp: e, toString: function () { return "assume " + this.exp.toString(); } };
}
function assert(e) {
    return { type: ASSERT, exp: e, toString: function () { return "assert " + this.exp.toString(); } };
}
function assgn(v, val) {
    return { type: ASSGN, vr: v, val: val, toString: function () { return "" + this.vr + ":=" + this.val.toString(); } };
}
function ifte(c, t, f) {
    return { type: IFTE, cond: c, tcase: t, fcase: f, toString: function () { return "if(" + this.cond.toString() + "){\n" + this.tcase.toString() + '\n}else{\n' + this.fcase.toString() + '\n}'; } };
}
function whle(c, b) {
    return { type: WHLE, cond: c, body: b, toString: function () { return "while(" + this.cond.toString() + "){\n" + this.body.toString() + '\n}'; } };
}
function skip() {
    return { type: SKIP, toString: function () { return "/*skip*/"; } };
}

//some useful helpers:
function eq(x, y) {
    return and(not(lt(x, y)), not(lt(y, x)));
}
function tru() {
    return not(flse());
}
function oor(x, y){
    return and(not(x), not(y));

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