var AnchoTablero = 8;
var AltoTablero= 8;
var AnchoCuadro = 50;
var AltoCuadro= 50;
var AnchoPixel = 1 + (AnchoTablero * AnchoCuadro);
var AltoPixel= 1 + (AltoTablero * AltoCuadro);
var kFilasIniciales = 3; 
var fRojas = "#212529";
var fBlancas = "#ffffff";
var turnoBlancas; 
var turnoNegras; 
var acuerdoTablas = false; 
var indiceABorrar = -1; 
var MovimientosLegals; 
var gCanvasElement;
var gDrawingContext;
var gPattern;
var piezas = [];
var gNumPieces= 24; 
var gNumMoves =0; 
var gSelectedPieceIndex;
var gSelectedPieceHasMoved;
var gMoveCount;
var gMoveCountElem;
var gGameInProgress;

function getCursorPosition(e) {
	
	var x;
	var y;
	if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
	}
	else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	x -= gCanvasElement.offsetLeft;
	y -= gCanvasElement.offsetTop;
	x = Math.min(x, AnchoTablero * AnchoCuadro);
    y = Math.min(y, AltoTablero * AltoCuadro);
    var cell = new Casilla(Math.floor(y/AltoCuadro), Math.floor(x/AnchoCuadro));
    return cell;
}

function GameOver(){
	MovimientosLegals = getMovimientosLegals(); 
	if (MovimientosLegals.length === 0){
		return true;
	}
	else {
		return false; 
	}
}

function endGame(){
	gGameInProgress = false; 
	if (turnoBlancas){
		alert("Fin del juego. Las fichas Negras son las ganadoras"); 
	}
	else {
		alert("Fin del juego. Las fichas Blancas son las ganadoras"); 
	}
	newGame();
}

function getMovimientosLegals(){
	var theMovimientosLegals = [];
	var z =0; 

	while (z<piezas.length){
		if (((turnoBlancas) && (fBlancas == piezas[z].color)) || ((turnoNegras) && (fRojas == piezas[z].color))){	
			var nuevosMovimientos = getMovimientosLegalsPieza(piezas[z]); 
		
			var t =0; 
			while (t <nuevosMovimientos.length){  
					if (nuevosMovimientos[t] instanceof Jump){
					var oneJump = nuevosMovimientos.splice(t, 1); 
					theMovimientosLegals= oneJump.concat(theMovimientosLegals); 
				}
				else {
					t++;
				}
			}	
			
			theMovimientosLegals = theMovimientosLegals.concat(nuevosMovimientos);  
		}
		z++;
	}
	return theMovimientosLegals;
}

function getMovimientosLegalsPieza(unaPieza){
	var i = -1;
	var fila=0; 
	var columna=0; 
	var someMovimientosLegals=[];
	var vacia = false; 
	
	while (i <2){
		if (((unaPieza.row != 0)&&(turnoBlancas))||((unaPieza.row != 7)&&(turnoNegras))){ 
			if (((unaPieza.column != 0)&& (i==-1))||((unaPieza.column != 7)&& (i==1))){ 
				if (turnoBlancas){ 
					fila = unaPieza.row -1;
					columna = unaPieza.column +i; 
				}
				else {
					fila = unaPieza.row +1;
					columna = unaPieza.column +i; 
				} 
				var j = 0; 
				var existe = false; 
				while ((j<piezas.length) && (existe==false)){
					if ((piezas[j].row == fila) && (piezas[j].column == columna)){
						existe = true; 
						if (piezas[j].color != unaPieza.color){ 
							if ((i<0)&&(turnoBlancas)&&(unaPieza.column >= 2)&&(unaPieza.row >= 2)){ 
								fila = unaPieza.row -2;
								columna = unaPieza.column -2; 
								vacia = casillaVacia(fila, columna); 
							}
							else if ((i>0)&&(turnoBlancas)&&(unaPieza.column <= 5)&&(unaPieza.row >= 2)){
								fila = unaPieza.row -2;
								columna = unaPieza.column +2; 
								vacia = casillaVacia(fila, columna);  
							}
							else if ((i<0)&&(turnoNegras)&&(unaPieza.column >= 2)&&(unaPieza.row <= 5)){ 
								fila = unaPieza.row +2;
								columna = unaPieza.column -2; 
								vacia = casillaVacia(fila, columna); 	
							}
							else if ((i>0)&&(turnoNegras)&&(unaPieza.column <= 5)&&(unaPieza.row <= 5)){
								fila = unaPieza.row +2;
								columna = unaPieza.column +2; 
								vacia = casillaVacia(fila, columna); 	
							}
						}
					}
					else {
						j++; 
					}
				}	
				if ((existe == false)){ 
					var aMove = new Move(unaPieza.row, unaPieza.column, fila, columna); 
					someMovimientosLegals.push(aMove); 
				}
				else if ((existe ==true) && (vacia==true)){  
					var aJump = new Jump(unaPieza.row, unaPieza.column, fila, columna); 
					someMovimientosLegals.unshift(aJump); 
				}
			}
		}
		i = i+2; 
	}	
	return someMovimientosLegals; 
}

function casillaVacia(fila, columna){
	var y = 0; 
	var vacia = true; 
	while ((y<piezas.length) && (vacia==true)){
		if ((piezas[y].row ==fila) && (piezas[y].column == columna)){
			vacia = false; 
		}
		else {
			y++;
		}	
	}
	return vacia; 
}

function drawBoard() {

    gDrawingContext.clearRect(0, 0, AnchoPixel, AltoPixel);

    gDrawingContext.beginPath();
   
    for (var x = 0; x <= AnchoPixel; x += AnchoCuadro) {
		gDrawingContext.moveTo(0.5 + x, 0);
		gDrawingContext.lineTo(0.5 + x, AltoPixel);
    }
    
    for (var y = 0; y <= AltoPixel; y += AltoCuadro) {
		gDrawingContext.moveTo(0, 0.5 + y);
		gDrawingContext.lineTo(AnchoPixel, 0.5 +  y);
    }
    
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();
    
    for (var i = 0; i < piezas.length; i++) {
		
			drawPiece(piezas[i], piezas[i].color, i == gSelectedPieceIndex);
		
    }

    gMoveCountElem.innerHTML = gMoveCount;
	
	if (gGameInProgress && GameOver()) {
		endGame();
    } 
}

function drawPiece(p, color, selected) {
    var column = p.column;
    var row = p.row;
    var x = (column * AnchoCuadro) + (AnchoCuadro/2);
    var y = (row * AltoCuadro) + (AltoCuadro/2);
    var radius = (AnchoCuadro/2) - (AnchoCuadro/10);
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.fillStyle = color;
    gDrawingContext.fill();
    gDrawingContext.strokeStyle = "#000";
    gDrawingContext.stroke();
    if (selected) {
		gDrawingContext.fillStyle = "#ff0000";
		gDrawingContext.fill();
    }
}

function cargarPosiciones() {
	piezas = [];
	
	gNumPieces = parseInt(localStorage.getItem("numPiezas"));
	gMoveCount = parseInt(localStorage.getItem("numMove"));
	
	for (var i=0; i < gNumPieces; i++) { 
		var row = parseInt(localStorage.getItem("pieza" + i + ".fila")); 
		var column = parseInt(localStorage.getItem("pieza" + i + ".columna")); 
		var color = localStorage.getItem("pieza" + i + ".color"); 
		if ((!(color==="null"))&&(piezas.length<24)){  
			piezas.push(new Casilla(row, column, color));
		}
	}

	if (parseInt(localStorage.getItem("esTurno"))=="blancas"){
		turnoBlancas = true; 
		turnoNegras = false; 
	}	
	else {
		turnoBlancas = false; 
		turnoNegras = true; 
	}
	
	limpiarMovimientos(); 
	
	drawBoard();
}

function empiezanBlancas(){
	document.getElementById("esTurno").innerHTML = "Las fichas Blancas comienza la partida"; 
}


function newGame() {

	empiezanBlancas();	
	
	// Reiniciamos variables. 
	gNumMoves = 0;	
	gNumPieces = 24;	

	turnoBlancas = true; 
	turnoNegras = false; 
	
	
	piezas = []; 

	for (var i=0; i< kFilasIniciales; i++){
		for (var j=(i+1)%2; j < AltoTablero; j=j+2) {
			piezas.push(new Casilla(i,j, fRojas));
		}
	}

	for (var i=AltoTablero-1; i >= AltoTablero - kFilasIniciales; i--){
		for (var j=(i+1)%2; j < AltoTablero; j=j+2) {
			piezas.push(new Casilla(i,j, fBlancas));
		}
	}

    gNumPieces = piezas.length;
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
	gGameInProgress = false; 
	
	turnoBlancas = true; 
	turnoNegras = false;  
	
	drawBoard();
	gGameInProgress = true;  
}

function Casilla(row, column, color) {
    this.row = row;
    this.column = column;
    this.color = color;
}

function comprobarCoronacion(){
	if(((turnoBlancas) && (piezas[gSelectedPieceIndex].color == fBlancas) && (piezas[gSelectedPieceIndex].row == 0)) || 
	((turnoNegras) && (piezas[gSelectedPieceIndex].color == fRojas) && (piezas[gSelectedPieceIndex].row == 7))){
		var candidata = piezas.splice(gSelectedPieceIndex, 1); 
	}
}

function Move(r1, c1, r2, c2) {
    this.fromRow = r1;
    this.fromCol = c1;
    this.toRow = r2;
	this.toCol = c2;
}

function Jump(r1, c1, r2, c2) {
    Move.apply(this, [r1, c1, r2, c2])
}

Jump.prototype = new Move();
Jump.prototype.constructor = Move;

function isThereAPieceBetween(casilla1, casilla2) {
	var existe = false; 
	var i = 0; 
	var fila = 0; 
	var columna = 0; 
	
	if ((turnoBlancas) && (casilla2.column- casilla1.column == -2) && (casilla2.row- casilla1.row == -2)){ 
		columna = casilla1.column -1; 
		fila = casilla1.row -1; 
	}
	else if ((turnoBlancas) && (casilla2.column-casilla1.column == 2) && (casilla2.row- casilla1.row == -2)){ 
		columna = casilla1.column +1; 
		fila = casilla1.row -1; 
	}
	else  if((turnoNegras) && (casilla2.column- casilla1.column == -2 ) && (casilla2.row- casilla1.row == 2)){ 
		columna = casilla1.column -1; 
		fila = casilla1.row +1; 
	}
	else  if((turnoNegras) && (casilla2.column- casilla1.column == 2) && (casilla2.row- casilla1.row == 2)){ 
		columna = casilla1.column +1; 
		fila = casilla1.row +1; 
	}
	while ((i<piezas.length) && (existe==false)){ 
		if ((piezas[i].row == fila) && (piezas[i].column == columna)){
			if (casilla1.color !==piezas[i].color){ 
				existe = true; 
				indiceABorrar = i; 
			}
			else {
				alert("No puedes comer fichas de tu mismo color"); 
			}
		}
		i++;
	}
	return existe; 
}

function mostrarMovimiento(casilla1, casilla2, salto) {
	var movimiento = document.createElement("p");
	
	if (turnoBlancas){
	
		document.getElementById("esTurno").innerHTML = "Es turno para las fichas negras"; 
	}
	else {
	
		document.getElementById("esTurno").innerHTML = "Es turno para las fichas blancas"; 
	}
}

function limpiarMovimientos(){
	
	if (turnoBlancas){
		document.getElementById("esTurno").innerHTML = "Es turno para las fichas blancas:"; 
	}
	else {
		document.getElementById("esTurno").innerHTML = "Es turno para las fichas negras:"; 
	}
}

function clickOnEmptyCell(cell) {
    if (gSelectedPieceIndex == -1){ 
		return; 
	}
   
    var direccion = 1;
    if (piezas[gSelectedPieceIndex].color == fBlancas)
	   direccion = -1;
    
    var rowDiff = direccion * (cell.row - piezas[gSelectedPieceIndex].row);
    var columnDiff = direccion * (cell.column - piezas[gSelectedPieceIndex].column);
    if ((rowDiff == 1 && Math.abs(columnDiff) == 1) && (!(MovimientosLegals[0] instanceof Jump))){
		
		mostrarMovimiento(piezas[gSelectedPieceIndex], cell, false);
			
		piezas[gSelectedPieceIndex].row = cell.row;
		piezas[gSelectedPieceIndex].column = cell.column;
		
		comprobarCoronacion(); 
		
		cambioTurno(); 
		gMoveCount += 1;
		gSelectedPieceIndex = -1;
		gSelectedPieceHasMoved = false;
		drawBoard();
		gNumMoves += 1;
		return;
    }
	else if ((rowDiff == 1 && Math.abs(columnDiff) == 1) && (MovimientosLegals[0] instanceof Jump)){
		alert("Tienes posibilidad de realizar saltos");
	}
    else if ((Math.abs(rowDiff)== 2 && Math.abs(columnDiff)== 2) &&
	isThereAPieceBetween(piezas[gSelectedPieceIndex], cell) && (MovimientosLegals[0] instanceof Jump)) {
		if (!gSelectedPieceHasMoved) {
			gMoveCount += 1;
		}
		
		// Mostramos el movimiento hecho
		mostrarMovimiento(piezas[gSelectedPieceIndex], cell, true);
		
		piezas[gSelectedPieceIndex].row = cell.row;
		piezas[gSelectedPieceIndex].column = cell.column;
		
		if (indiceABorrar > gSelectedPieceIndex){	
			borrarPieza();
			comprobarCoronacion();
		}
		else {
			comprobarCoronacion();
			borrarPieza();
		}
		
		
		gSelectedPieceIndex = -1;
		gSelectedPieceHasMoved = false;

		
		gNumMoves = 0; 
		cambioTurno(); 
		drawBoard();
		return;
    }
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

function cambioTurno(){
	if (turnoBlancas){
		turnoBlancas=false; 
		turnoNegras=true; 
	}
	else {
		turnoBlancas=true; 
		turnoNegras=false; 
	}
}

function borrarPieza(){
	piezas.splice(indiceABorrar, 1); 
	indiceABorrar = -1; 
	gNumPieces--;
}

function gestorClick(e){
	var casilla = getCursorPosition(e);
	for (var i = 0; i < gNumPieces; i++) {
		if ((piezas[i].row == casilla.row) && 
				(piezas[i].column == casilla.column)) {
					ClickFicha(i);
					return;
				}
	}
	clickOnEmptyCell(casilla);	
}

function ClickFicha(indicePieza){
	if (((turnoBlancas) && (piezas[indicePieza].color==fBlancas)) || ((turnoNegras) && (piezas[indicePieza].color==fRojas))){
		if (gSelectedPieceIndex == indicePieza) {
			return; 
		}
		gSelectedPieceIndex = indicePieza;
		gSelectedPieceHasMoved = false;
		drawBoard();
	}	
	else {
	
		alert("Espera tu turno"); 
	}
}

function iniciarJuego(canvasElement, moveCountElement) {
    gCanvasElement = canvasElement;
    gCanvasElement.width = AnchoPixel;
    gCanvasElement.height = AltoPixel;
    gCanvasElement.addEventListener("click", gestorClick, false);
    gMoveCountElem = moveCountElement;
    gDrawingContext = gCanvasElement.getContext("2d");

	// Nueva partida
	saveButton = document.getElementById("resetButton");
	saveButton.onclick = newGame;
    newGame();
}
