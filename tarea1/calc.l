%{
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "y.tab.h"
%}

%%
[ \t]							;

(([0-9]+)|([0-9]*\.[0-9]+))		{
									yylval.val = atof(yytext);
									return NUMBER;
								}

[\(\)/+\-*\n!]						{
									return yytext[0];
								}

pi								{
									yylval.val = M_PI;
									return PI;
								}

sin								{
									return SIN;
								}										

cos								{
									return COS;
								}

tan								{
									return TAN;
								}	

cot								{
									return COT;
								}

sec								{
									return SEC;
								}

csc								{
									return CSC;
								}																

asin							{
									return ASIN;
								}										

acos							{
									return ACOS;
								}

atan							{
									return ATAN;
								}	


rad								{
									return RAD;
								}

deg								{
									return DEG;
								}								

\^								{
									return POW;
								}								

mod								{
									return MOD;
								}					

log								{
									return LOG;
								}														

%%
