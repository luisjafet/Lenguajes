%{
#include <stdlib.h>
#include "y.tab.h"
%}

%%
[ \t]	;
[0-9]+	{ yylval.ival = atoi(yytext); return NUMBER; }
[\(\)+*\n]	{ return yytext[0]; }
.	ECHO;

%%

%{
#include <stdio.h>
%}
%union {
int ival;
}
%token <ival> NUMBER;
%type <ival> command term expr factor;
%%
...
factor: NUMBER { $$ = $1; }
| ‘(‘ expr ’)’ { $$ = $2; }
;
...
