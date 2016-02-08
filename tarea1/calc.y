%{
#include <stdio.h>
#include <math.h>
#include <tgmath.h>
%}

%union {
	double val;
};

%token SIN COS TAN COT SEC CSC ASIN ACOS ATAN RAD GRAD FACT POW MOD LOG;
%token <val> NUMBER PI;
%type <val> command term expr factor;

%%
command : expr '\n' { printf("El resultado es: %f\n", $1); }
		;


expr	: expr '+' term { $$ = $1 + $3; }
		| expr '-' term { $$ = $1 - $3; }
		| term { $$ = $1; }
		| expr POW term { $$ = pow($1, $3); }
		| expr MOD term { $$ = fmodf($1, $3); }
		;

term	: term '*' factor { $$ = $1 * $3; }
		| term '/' factor  {
                               if($3==0)
                               {
                                       printf("¡ERROR! División entre cero no definida\n");
                               }
                               $$=$1/$3;
                       }
		| factor { $$ = $1; }
		;

factor	: NUMBER { $$ = $1; }
		| '(' expr ')' { $$ = $2; }
		| PI { $$ = $1; }
		| '-' expr {$$ = -$2;}
		| SIN '(' expr ')' { $$ = sin($3 * M_PI / 180); }
		| COS '(' expr ')' { $$ = cos($3 * M_PI / 180); }
		| TAN '(' expr ')' { $$ = tan($3 * M_PI / 180); }
		| COT '(' expr ')' { $$ = 1/tan($3 * M_PI / 180); }
		| SEC '(' expr ')' { $$ = 1/cos($3 * M_PI / 180); }
		| CSC '(' expr ')' { $$ = 1/sin($3 * M_PI / 180); }
		| ASIN '(' expr ')' { $$ = asin($3 * M_PI / 180); }
		| ACOS '(' expr ')' { $$ = acos($3 * M_PI / 180); }
		| ATAN '(' expr ')' { $$ = atan($3 * M_PI / 180); }
		| RAD expr { $$ = ($2 * M_PI) / 180; }
		| GRAD expr { $$ = ($2 * 180) / M_PI; }
		| expr FACT { $$ = tgamma($1 + 1); }
		| LOG expr { $$ = log($2); }
		;

	
%%

main() {
	yyparse();
	return 0;
}

int yvlex(void){
	static int done = 0; /* bandera para detener el análisis*/
	int c;
	if (done) return 0; /* detiene el análisis */
	c = getchar();
	if (c == '\n') done = 1; /* dentendrá el análsis en la siguiente llamada */
	return c;
}

int yyerror(char *s){ /* Permite imprimir mensajes de error */
	printf("%s\n",s);
}

yywrap(){
	return(1);
}
