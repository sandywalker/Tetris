var utils = require('./utils.js');
var consts = require('./consts.js');
var shapes = require('./shapes.js');
var views = require('./views.js');
var canvas = require('./canvas.js');




/**
	Init game matrix
*/
var initMatrix = function(rowCount,columnCount){
	var result = [];
	for (var i = 0; i<rowCount;i++){
		var row = [];
		result.push(row);
		for(var j = 0;j<columnCount;j++){
			row.push(0);
		}
	}

	return result;
};


/**
	Check all full rows in game matrix
	return rows number array. eg: [18,19];
*/
var checkFullRows = function(matrix){
	var rowNumbers = [];
  	for(var i = 0;i<matrix.length;i++){
  		var row = matrix[i];
  		var full = true;
  		for(var j = 0;j<row.length;j++){
  			full = full&&row[j]!==0;
  		}
  		if (full){
  			rowNumbers.push(i);
  		}
  	}

  	return rowNumbers;	
};

/**
	Remove one row from game matrix. 
	copy each previous row data to  next row  which row number less than row;
*/
var removeOneRow = function(matrix,row){
	var colCount = matrix[0].length;
	for(var i = row;i>=0;i--){
		for(var j = 0;j<colCount;j++){
			if (i>0){
				matrix[i][j] = matrix[i-1][j];
			}else{
				matrix[i][j] = 0 ;
			}	
		}
	}	
}
/**
	Remove rows from game matrix by row numbers.
*/
var removeRows = function(matrix,rows){
	for(var i in rows){
		removeOneRow(matrix,rows[i]);
	}
}


var defaults = {
	maxHeight:700,
	maxWidth:600
}

function Tetris(id){
	this.id = id;
	this.init();
}

Tetris.prototype = {

	init:function(options){
		
		var cfg = this.config = utils.extend(options,defaults);

		this.reset();
		this.interval = consts.DEFAULT_INTERVAL;
		this.running = false;
		this.gameover = false;

		
		
		views.init(this.id, cfg.maxWidth,cfg.maxHeight);

		canvas.init(views.scene,views.preview);

		this.matrix = initMatrix(consts.ROW_COUNT,consts.COLUMN_COUNT);

		this._initEvents();
		this.shape = shapes.randomShape();

	},
	_keydownHandler:function(e){
		
		var matrix = this.matrix;

		if(!e) { 
			var e = window.event; 
		}
		if (!this.shape){
			return;
		}

		switch(e.keyCode){
			case 37:{this.shape.goLeft(matrix);}
			break;
			
			case 39:{this.shape.goRight(matrix);}
			break;
			
			case 38:{this.shape.rotate(matrix);}
			break;

			case 40:{this.shape.goDown(matrix);}
			break;

			case 32:{this.shape.goBottom(matrix);this._refresh();}
			break;
		}
	},
	_initEvents:function(){
		window.addEventListener('keydown',utils.proxy(this._keydownHandler,this),false);
	},
	reset:function(){
		this.startTime = new Date().getTime();
		this.currentTime = this.startTime;
		this.prevTime = this.startTime;
	},
	start:function(){
		this.running = true;
		window.requestAnimationFrame(utils.proxy(this._update,this));
	},
	pause:function(){
		this.running = false;
		this.currentTime = new Date().getTime();
		this.prevTime = this.currentTime;
	},
	_draw:function(){
		canvas.drawScene(); 
		canvas.drawShape(this.shape);
		canvas.drawMatrix(this.matrix);
	},
	_update:function(){
		if (!this.running){
			return;
		}
		this.currentTime = new Date().getTime();
		if (this.currentTime - this.prevTime > this.interval ){
			this._refresh();
			this.prevTime = this.currentTime;
		}
		this._draw();
		window.requestAnimationFrame(utils.proxy(this._update,this));
	},
	_refresh:function(){
		if (this.shape.canDown(this.matrix)){
			this.shape.goDown(this.matrix);
		}else{
			this.shape.copyTo(this.matrix);
			this._check();
			this.shape = shapes.randomShape();
			this._draw();
		}
	},

	_check:function(){
		var rows = checkFullRows(this.matrix);
		if (rows.length){
			removeRows(this.matrix,rows);
		}
	}
}


window.Tetris = Tetris;





