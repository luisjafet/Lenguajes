%{
#include <stdio.h>
#include <math.h>
#include <tgmath.h>

int rad = 1;
double rad_mult = M_PI / 180;
double deg_mult = 180 / M_PI;

%}

%union {
	double val;
};




%token SIN COS TAN COT SEC CSC ASIN ACOS ATAN RAD DEG FACT POW MOD LOG;
%token <val> NUMBER PI;
%type <val> command expr;

%%
command : expr '\n' { printf("El resultado es: %f\n", $1); return 0; }
		;


expr	: 	NUMBER { $$ = $1; }
		| '(' expr ')' { $$ = $2; }
		| PI { $$ = $1; }
		| '-' expr {$$ = -$2;}
		| expr '+' expr { $$ = $1 + $3; }
		| expr '-' expr { $$ = $1 - $3; }
		| expr '*' expr { $$ = $1 * $3; }
		| expr '/' expr  {
						if($3==0){
							printf("¡ERROR! División entre cero no definida\n");
                                	}
                              	$$=$1/$3; }
		//| expr { $$ = $1; }
		| '(' expr ')' POW '(' expr ')' { $$ = pow($2, $6); }
		| '(' expr ')' MOD '(' expr ')' { $$ = fmodf($2, $6); }
		| '(' expr ')' FACT { $$ = tgamma($2 + 1); }
		| LOG '(' expr ')' { $$ = log($3); }
		| RAD { rad = 1; }
		| DEG { rad = 0; }
		| SIN '(' expr ')'{
						if(rad){
							$$ = sin(rad_mult * $3);
						}else{
							$$ = sin(deg_mult * $3);
						}
					}
		| COS '(' expr ')'{
						if(rad){
							$$ = cos(rad_mult * $3);
						}else{
							$$ = cos(deg_mult * $3);
						}
					}
		| TAN '(' expr ')'{
						if(rad){
							$$ = tan(rad_mult * $3);
						}else{
							$$ = tan(deg_mult * $3);
						}
					}

		| COT '(' expr ')'{
						if(rad){
							$$ = 1/tan(rad_mult * $3);
						}else{
							$$ = 1/tan(deg_mult * $3);
						}
					}
		| SEC '(' expr ')'{
						if(rad){
							$$ = 1/cos(rad_mult * $3);
						}else{
							$$ = 1/cos(deg_mult * $3);
						}
					}
		| CSC '(' expr ')'{
						if(rad){
							$$ = 1/sin(rad_mult * $3);
						}else{
							$$ = 1/sin(deg_mult * $3);
						}
					}
		| ASIN '(' expr ')'{
						if(rad){
							$$ = asin(rad_mult * $3);
						}else{
							$$ = asin(deg_mult * $3);
						}
					}
		| ACOS '(' expr ')'{
						if(rad){
							$$ = acos(rad_mult * $3);
						}else{
							$$ = acos(deg_mult * $3);
						}
					}
		| ATAN '(' expr ')'{
						if(rad){
							$$ = atan(rad_mult * $3);
						}else{
							$$ = atan(deg_mult * $3);
						}
					}
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
