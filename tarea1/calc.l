%{
#include <stdlib.h>
#include "y.tab.h"
%}

%%
[ \t]		;
[0-9]+		{
				yylval.ival = atoi(yytext);
				return NUMBER;
			}
[\(\)+*\n]	{
				return yytext[0];
			}
.			ECHO;
%%