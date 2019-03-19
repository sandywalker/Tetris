
var utils = require('./utils.js');
var consts = require('./consts.js');


var lineColor =  consts.GRID_LINE_COLOR;

var boxBorderColor = consts.BOX_BORDER_COLOR;

function lineProperties(ctx,p1,p2,color){
	this.ctx = ctx;
	this.p1 = p1;
	this.p2 = p2;
	this.color = color;
}

function gridProperties(el,gridSize,colCount,rowCount,color1,color2){
	this.el = el;
	this.gridSize = gridSize;
	this.colCount = colCount;
	this.rowCount = rowCount;
	this.color1 = color1;
	this.color2 = color2;
}

//Draw a single line in canvas context
var drawLine = function(lineProps){
	lineProps.ctx.beginPath();

	var p1 = lineProps.p1;
	var p2 = lineProps.p2;

	lineProps.ctx.moveTo(p1.x,p1.y);
	lineProps.ctx.lineTo(p2.x,p2.y);

	lineProps.ctx.lineWidth = 1;
	lineProps.ctx.strokeStyle = color;

	lineProps.ctx.stroke();
	lineProps.ctx.closePath();
};

//Draw game grids
var drawGrids = function(gridProps){
	var ctx = gridProps.el.getContext('2d');
	var width = gridProps.el.width;
	var height = gridProps.el.height;

	ctx.rect(0, 0, width, height);

	var grd = ctx.createLinearGradient(0, 0, 0, height);
	grd.addColorStop(0, gridProps.color1);   
	grd.addColorStop(1, gridProps.color2);
	ctx.fillStyle = grd;
	ctx.fill();

	var lineProps = lineProperties(ctx, 0, 0, lineColor);

	for (var i = 1; i < gridProps.colCount; i++) {
		var x = gridProps.gridSize*i+0.5;
		lineProps.p1 = {x:x,y:0};
		lineProps.p2 = {x:x,y:height};
		drawLine(lineProps);
	};

	for (var i = 1; i < gridProps.rowCount; i++) {
		var y = gridProps.gridSize*i+0.5;
		lineProps.p1 = {x:0,y:y};
		lineProps.p2 = {x:width,y:y};
		drawLine(lineProps);
	};
};

//Draw box of shape (shape is the composition of boxes)
	var drawBox = function(ctx,color,x,y,gridSize){
	if (y<0){
		return;
	}

	ctx.beginPath();
	ctx.rect(x,y,gridSize,gridSize);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.strokeStyle= boxBorderColor;
	ctx.lineWidth=1;
	ctx.stroke();
	ctx.closePath();
	}

/*
	Canvas main object, use to draw all games data.
*/
var tetrisCanvas = {

	init:function(scene,preview){
		this.scene = scene;
		this.preview = preview;
		this.sceneContext = scene.getContext('2d');
		this.previewContext = preview.getContext('2d');
		this.gridSize = scene.width / consts.COLUMN_COUNT;

		this.previewGridSize = preview.width / consts.PREVIEW_COUNT;

		this.drawScene();
		
	},

	//Clear game canvas
	clearScene:function(){
		this.sceneContext.clearRect(0, 0, this.scene.width, this.scene.height);
	},
	//Clear preview canvas
	clearPreview:function(){
		this.previewContext.clearRect(0,0,this.preview.width,this.preview.height);
	},
	//Draw game scene, grids
	drawScene:function(){
		this.clearScene();
		var gridProps = gridProperties(this.scene,this.gridSize,
			consts.COLUMN_COUNT,consts.ROW_COUNT,
			consts.SCENE_BG_START,consts.SCENE_BG_END); ///
		drawGrids(gridProps);
	},
	//Draw game data
	drawMatrix:function(matrix){
		for(var i = 0;i<matrix.length;i++){
			var row = matrix[i];
			for(var j = 0;j<row.length;j++){
				if (row[j]!==0){
					drawBox(this.sceneContext,row[j],j*this.gridSize,i*this.gridSize,this.gridSize);
				}
			}
		}	
	},
	//Draw preview data
	drawPreview:function(){
		var gridProps = gridProperties(this.preview,this.previewGridSize,
			consts.PREVIEW_COUNT,consts.PREVIEW_COUNT,
			consts.PREVIEW_BG,consts.PREVIEW_BG);
		drawGrids(gridProps); ///
	},
	//Draw acitve shape in game
	drawShape:function(shape){
		if (!shape){
			return;
		}
		var matrix = shape.matrix();
		var gsize = this.gridSize;
		for(var i = 0;i<matrix.length;i++){
			for(var j = 0;j<matrix[i].length;j++){
				if (matrix[i][j] === 1){
					var x = gsize *(shape.x + j);
					var y = gsize *(shape.y + i);
					drawBox(this.sceneContext,shape.color,x,y,gsize);
				}
			}
		}
	},
	//Draw preview shape in preview canvas
	drawPreviewShape:function(shape){
		if (!shape){
			return;
		}
		this.clearPreview();
		var matrix = shape.matrix();
		var gsize = this.previewGridSize;
		var startX = (this.preview.width - gsize*shape.getColumnCount()) / 2;
		var startY = (this.preview.height - gsize*shape.getRowCount()) / 2;
		for(var i = 0;i<matrix.length;i++){
			for(var j = 0;j<matrix[i].length;j++){
				if (matrix[i][j] === 1){
					var x = startX + gsize * j;
					var y = startY + gsize * i;
					drawBox(this.previewContext,shape.color,x,y,gsize);
				}
			}
		}
	}

};



module.exports = tetrisCanvas;
