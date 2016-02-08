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
		| '-' term {$$ = -$2;}
		| term { $$ = $1; }
		| SIN '(' term ')' { $$ = sin($3 * M_PI / 180); }
		| COS '(' term ')' { $$ = cos($3 * M_PI / 180); }
		| TAN '(' term ')' { $$ = tan($3 * M_PI / 180); }
		| COT '(' term ')' { $$ = 1/tan($3 * M_PI / 180); }
		| SEC '(' term ')' { $$ = 1/cos($3 * M_PI / 180); }
		| CSC '(' term ')' { $$ = 1/sin($3 * M_PI / 180); }
		| ASIN '(' term ')' { $$ = asin($3 * M_PI / 180); }
		| ACOS '(' term ')' { $$ = acos($3 * M_PI / 180); }
		| ATAN '(' term ')' { $$ = atan($3 * M_PI / 180); }
		| RAD term { $$ = ($2 * M_PI) / 180; }
		| GRAD term { $$ = ($2 * 180) / M_PI; }
		| term FACT { $$ = tgamma($1 + 1); }
		| expr POW term { $$ = pow($1, $3); }
		| expr MOD term { $$ = fmodf($1, $3); }
		| LOG term { $$ = log($2); }
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
