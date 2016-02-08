%{
#include <stdio.h>
#include <stdlib.h>
#include "y.tab.h"
%}

%%
[ \t]							;

(([0-9]+)|([0-9]*\.[0-9]+))		{
									yylval.val = atof(yytext);
									return NUMBER;
								}

[\(\)/+*\n]						{
									return yytext[0];
								}

sin								{
									return SIN;
								}

to_rad							{
									return RAD;
								}
%%