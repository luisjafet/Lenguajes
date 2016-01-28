%{
#include <stdio.h>
%}

%%
command : expr ‘\n’ { printf(“El resultado es: %d\n”, $1); }
		;

expr: expr ‘+’ term { $$ = $1 + $3; }
	| term { $$ = $1; }
	;

term: term * factor { $$ = $1 * $3; }
	| factor { $$ = $1; }
	;

factor: number { $$ = $1; }
	| ‘(‘ expr ’)’ { $$ = $2; }
	;

number : number digit ( $$ = 10 * $1 +$2; }
	| digit { $$ $1; }
	;
	
digit : ‘0’ { $$ = 0; }
	| ‘1’ { $$ = 1; }
	| ‘2’ { $$ = 2; }
	| ‘3’ { $$ = 3; }
	| ‘4’ { $$ = 4; }
	| ‘5’ { $$ = 5; }
	| ‘6’ { $$ = 6; }
	| ‘7’ { $$ = 7; }
	| ‘8’ { $$ = 8; }
	| ‘9’ { $$ = 9; }
	;
%%

main() {
	yyparse();
	return 0;
}

int yvlex(void) {
	static int done = 0; /* bandera para detener el análisis*/
	int c;
	if (done) return 0; /* detiene el análisis */
	c = getchar();
	if (c == ‘\n’) done = 1; /* dentendrá el análsis en la siguiente llamada */
	return c;
}

int yyerror(char *s) { /* Permite imprimir mensajes de error */
	printf(”%s\n”,s);
}
