%{
#include <stdio.h>
#include <math.h>
#include <tgmath.h>

int rad = 1;
double deg_mult = M_PI / 180;
double rad_mult = 180 / M_PI;

%}

%union {
	double val;
};




%token SIN COS TAN COT SEC CSC ASIN ACOS ATAN RAD DEG POW MOD LOG LN E EXP PORC;
%token <val> NUMBER PI;
%type <val> command expr;
%left '+' '-'
%left '*' '/' E EXP PORC
%left POW FACT MOD



%%

programs : programs command
		| command

command : expr '\n' {printf("El resultado es: %f\n", $1);}
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
		| expr POW  expr  { $$ = pow($1, $3); }
		| expr  MOD  expr  { $$ = fmodf($1, $3); }
		|  expr  '!' { $$ = tgamma($1 + 1); }
		| LOG expr { $$ = log10($2); }
		| LN expr { $$ = log($2); }
		| EXP expr { $$ = exp($2); }
		| expr PORC {$$ = 0.01 * $1; }
		| expr E expr {$$ = $1 * (pow(10, $3)); }
		| RAD { rad = 1; printf("Radianes \n"); }
		| DEG { rad = 0; printf("Grados \n"); }
		| SIN expr{
						if(rad){
							$$ = sin($2);
						}else{
							$$ = sin(deg_mult * $2);
						}
					}
		| COS expr {
						if(rad){
							$$ = cos($2);
						}else{
							$$ = cos(deg_mult * $2);
						}
					}
		| TAN expr{
						if(rad){
							$$ = tan($2);
						}else{
							$$ = tan(deg_mult * $2);
						}
					}

		| COT expr {
						if(rad){
							$$ = 1/tan($2);
						}else{
							$$ = 1/tan(deg_mult * $2);
						}
					}
		| SEC expr {
						if(rad){
							$$ = 1/cos($2);
						}else{
							$$ = 1/cos(deg_mult * $2);
						}
					}
		| CSC expr {
						if(rad){
							$$ = 1/sin($2);
						}else{
							$$ = 1/sin(deg_mult * $2);
						}
					}
		| ASIN expr{
						if(rad){
							$$ = asin(rad_mult * $2);
						}else{
							$$ = asin($2) * rad_mult;
						}
					}
		| ACOS expr{
						if(rad){
							$$ = acos(rad_mult * $2);
						}else{
							$$ = acos($2) * rad_mult;
						}
					}
		| ATAN expr{
						if(rad){
							$$ = atan(rad_mult * $2);
						}else{
							$$ = atan($2) * rad_mult;
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
