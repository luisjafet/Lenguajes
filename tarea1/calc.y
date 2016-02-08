%{
#include <stdio.h>
#include <math.h>
%}

%union {
	double val;
};

%token SIN RAD;
%token <val> NUMBER;
%type <val> command term expr factor;

%%
command : expr '\n' { printf("El resultado es: %f\n", $1); }
		;


expr	: expr '+' term { $$ = $1 + $3; }
		| term { $$ = $1; }
		| expr '/' term { $$ = $1 / $3; }
		| SIN '(' expr ')' { $$ = sin($3 * M_PI / 180); }
		| RAD expr { $$ = $2 * M_PI / 180; }
		;

term	: term '*' factor { $$ = $1 * $3; }
		| factor { $$ = $1; }
		;

factor	: NUMBER { $$ = $1; }
		| '(' expr ')' { $$ = $2; }
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
