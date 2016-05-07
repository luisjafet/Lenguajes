/// <reference path="default.html" />
/// <reference path="default.html" />
/// JavaScript source code


/// Expressions
var NUM = "NUM";
var FALSE = "FALSE";
var VR = "VAR";
var PLUS = "PLUS";
var TIMES = "TIMES";
var LT = "LT";
var AND = "AND";
var NOT = "NOT";

/// Statements
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
    if (e.type == VR) {
        return state[e.name]; 
    }
    if (e.type == PLUS) {
        return interpretExpr(e.left, state) + interpretExpr(e.right, state);
    }
    if (e.type == TIMES) { return interpretExpr(e.left, state) * interpretExpr(e.right, state); }
    if (e.type == LT) { return interpretExpr(e.left, state) < interpretExpr(e.right, state); }
    if (e.type == AND) { return interpretExpr(e.left, state) && interpretExpr(e.right, state); }
    if (e.type == NOT) { return !interpretExpr(e.left, state); }

}

function interpretStmt(c, state) {
    console.log("Object.keys(c) " + Object.keys(c));
    if (c.type == SEQ) {
        var sigmaPP = interpretStmt(c.fst, state);
        var sigmaP = interpretStmt(c.snd, sigmaPP);
        return sigmaP;
    }

    if (c.type == IFTE) {
        expr = interpretExpr(c.cond, state);
        if(expr) {
            var sigmaP = interpretStmt(c.tcase, state);
        } else {
            var sigmaP = interpretStmt(c.fcase, state);
        }
        return sigmaP;
    }

    if (c.type == WHLE) {

    }

    if (c.type == ASSGN) {
        c.val = interpretExpr(c.val, state);
        state[c.vr] = c.val;
        return state;
    }

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
    console.log("prog: " + prog);
    var r = interpretStmt(prog, state);
    str = JSON.stringify(r);
    writeToConsole(str);
}

function genVC() {
    var prog = eval(document.getElementById("p2input").value);
    clearConsole();
    writeToConsole("Just pretty printing for now");
    writeToConsole(prog.toString());
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

function wpc(cmd, predQ) {
    //predQ is an expression.
    //cmd is a statement.
    if (cmd.type == SKIP) {
        return predQ;
    }
    if (cmd.type == ASSERT) {
        return and(cmd.exp, predQ);
    }


}



//The stuff you have to implement.
function computeVC(prog) {
    //Compute the verification condition for the program leaving some kind of place holder for loop invariants.
}
