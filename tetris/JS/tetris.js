var n = 20;
var m = 20;
var score;
var level;
var lines;
var matrix = [];
var interval;
var current_shape;
var next_shape;
var speed;
var end = false;
var allowed_figures = [];
function containsCoord(i,j,coords){
	for(let coord of coords){
		let i1 = coord[0];
		let j1 = coord[1];
		if (i == i1 && j == j1) return true;
	}
	return false;
}
function getRow(num,table){
	let rows = $('#' + table + ' tr').toArray();
	return rows[num];
}
function getCol(row,num){
	let cols = $(row).find('td').toArray();
	return cols[num];
}
function getCell(i,j,table){
	return $(getCol(getRow(i,table),j));
}
function colorCell(i,j,col,table){
	getCell(i,j,table).css('background-color',col);
}
function uncolorCell(i,j,table){
	if(i == 19){
		console.log(`uncolored cell ${i},${j}`);
	}
	getCell(i,j,table).css('background-color','#dedda2');
	matrix[i][j] = null;
}
class Shape{
	i;
	col;
	j;
	coords = [];
	table;
	rotation;
	constructor(i,j,table,col){
		this.i = i;
		this.j = j;
		this.table = table;
		this.rotation = 0;
		this.col = col;
	}
	clone(i,j,table){
		const obj = Object.getPrototypeOf(this).constructor;
		return new obj(i,j,table,this.col);

	}
	move(dir){
		switch(dir){
			case 'l':
				if(!this.checkMove(dir)) return;
				for(let coord of this.coords){
					let i = coord[0];
					let j = coord[1];
					coord[1]--;
					colorCell(i,j-1,this.col,this.table);
					if(!containsCoord(i,j,this.coords))uncolorCell(i,j,this.table);
				}
				this.j--;
				break;
			case 'r':
				if(!this.checkMove(dir)) return;
				for(let coord of this.coords){
					let i = coord[0];
					let j = coord[1];
					colorCell(i,j+1,this.col,this.table);
					coord[1]++;
					if(!containsCoord(i,j,this.coords))uncolorCell(i,j,this.table);
				}
				this.j++;
				break;
			case 'd':
				if(!this.checkMove(dir)) {
					this.update_matrix();
					checkLine();
					generate_shape();
					return;
				}
				for(let coord of this.coords){
					let i = coord[0];
					let j = coord[1];
					colorCell(i+1,j,this.col,this.table);
					coord[0]++;
					if(!containsCoord(i,j,this.coords))uncolorCell(i,j,this.table);
				}
				this.i++;
				break;

		}
	}
	rotate(){
		throw new Error('ABSTRACT METHOD');
	}
	checkMove(dir){
		switch(dir){
			case 'l':
				for(let coord of this.coords){
					let i = coord[0];
					let j = coord[1];
					if(j - 1 < 0) return false;
					if(matrix[i][j - 1] != null && !containsCoord(i,j - 1,this.coords)) return false;
				}
				return true;
			case 'r':
				for(let coord of this.coords){
					let i = coord[0];
					let j = coord[1];
					if(j + 1 > m - 1) return false;
					if(matrix[i][j + 1] != null && !containsCoord(i,j + 1,this.coords)) return false;
				}
				return true;
			case 'd':
				for(let coord of this.coords){
					let i = coord[0];
					let j = coord[1];
					if(i + 1 > n - 1) return false;
					if(matrix[i + 1][j] != null && !containsCoord(i + 1,j,this.coords)) return false;
				}
				return true;

		}
	}
	update_matrix(){
		for(let coord of this.coords){
			let i = coord[0];
			let j = coord[1];
			matrix[i][j] = getCell(i,j,this.table);
		}
	}
	move_down(){
		while(this.checkMove('d')){
			this.move('d');
		}
		this.update_matrix();
		checkLine();
		generate_shape();
		return;
	}
}
class ZShape extends Shape{
	constructor(i,j,table){
		super(i,j,table,'red');
		let coord = [];
		colorCell(i-1,j-1,this.col,this.table);
		coord.push(i-1);
		coord.push(j-1);
		this.coords.push(coord.slice());
		coord = []
		colorCell(i-1,j,this.col,this.table);
		coord.push(i-1);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j,this.col,this.table);
		coord.push(i);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = []
		colorCell(i,j+1,this.col,this.table);
		coord.push(i);
		coord.push(j+1);
		this.coords.push(coord.slice());
	}
	rotate(){
		let coord = [];
		switch(this.rotation){
			case 0:
				colorCell(this.i-1,this.j + 1,this.col,this.table);
				uncolorCell(this.i-1,this.j - 1,this.table);
				this.coords.shift();
				coord.push(this.i-1);
				coord.push(this.j+1);
				this.coords.unshift(coord.slice());
				coord = [];
				colorCell(this.i+1,this.j,this.col,this.table);
				uncolorCell(this.i-1,this.j,this.table);
				this.coords.splice(1,1);
				coord.push(this.i+1);
				coord.push(this.j);
				this.coords.splice(1,0,coord.slice());
				this.rotation = (this.rotation + 1) % 2;
				break;
			case 1:
				uncolorCell(this.i-1,this.j + 1,this.table)
				colorCell(this.i-1,this.j - 1,this.col,this.table)
				this.coords.splice(0,1);
				coord = [];
				coord.push(this.i-1);
				coord.push(this.j-1);
				this.coords.unshift(coord.slice());
				coord = [];
				uncolorCell(this.i + 1,this.j,this.table)
				colorCell(this.i-1,this.j,this.col,this.table)
				this.coords.splice(1,1);
				coord.push(this.i-1);
				coord.push(this.j);
				this.coords.splice(1,0,coord.slice());
				this.rotation = (this.rotation + 1) % 2;
				break;
		}
	}
}

class LineShape extends Shape{
	constructor(i,j,table){
		super(i,j,table,'cyan');
		let coord = []
		colorCell(i,j,this.col,this.table);
		coord.push(i);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+1,this.col,this.table);
		coord.push(i);
		coord.push(j+1);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+2,this.col,this.table);
		coord.push(i);
		coord.push(j+2);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+3,this.col,this.table);
		coord.push(i);
		coord.push(j+3);
		this.coords.push(coord.slice());
	}
	rotate(){
		let coord = [];
		switch(this.rotation){
			case 0:
				colorCell(this.i-2,this.j + 1,this.col,this.table);
				uncolorCell(this.i,this.j,this.table);
				this.coords.shift();
				coord.push(this.i-2);
				coord.push(this.j+1);
				this.coords.unshift(coord.slice());
				coord = [];
				colorCell(this.i-1,this.j+1,this.col,this.table);
				uncolorCell(this.i,this.j+2,this.table);
				this.coords.splice(2,1);
				coord.push(this.i-1);
				coord.push(this.j+1);
				this.coords.splice(2,0,coord.slice());
				coord = [];
				colorCell(this.i+1,this.j+1,this.col,this.table);
				uncolorCell(this.i,this.j+3,this.table);
				this.coords.pop();
				coord.push(this.i+1);
				coord.push(this.j+1);
				this.coords.push(coord.slice());
				this.rotation = (this.rotation + 1) % 2;
				break;
			case 1:
				uncolorCell(this.i-2,this.j + 1,this.table);
				colorCell(this.i,this.j,this.col,this.table);
				this.coords.shift();
				coord.push(this.i);
				coord.push(this.j);
				this.coords.unshift(coord.slice());
				coord = [];
				uncolorCell(this.i-1,this.j+1,this.table);
				colorCell(this.i,this.j+2,this.col,this.table);
				this.coords.splice(2,1);
				coord.push(this.i);
				coord.push(this.j+2);
				this.coords.splice(2,0,coord.slice());
				coord = [];
				uncolorCell(this.i+1,this.j+1,this.table);
				colorCell(this.i,this.j+3,this.col,this.table);
				this.coords.pop();
				coord.push(this.i);
				coord.push(this.j+3);
				this.coords.push(coord.slice());
				this.rotation = (this.rotation + 1) % 2;
				break;
		}
	}
}
class SquareShape extends Shape{
	constructor(i,j,table){
		super(i,j,table,'yellow');
		let coord = []
		colorCell(i-1,j,this.col,this.table);
		coord.push(i-1);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i-1,j+1,this.col,this.table);
		coord.push(i-1);
		coord.push(j+1);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j,this.col,this.table);
		coord.push(i);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+1,this.col,this.table);
		coord.push(i);
		coord.push(j+1);
		this.coords.push(coord.slice());
	}
	rotate(){return;}
}
class InverseZShape extends Shape{
	constructor(i,j,table){
		super(i,j,table,'green');
		let coord = [];
		colorCell(i,j,this.col,this.table);
		coord.push(i);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+1,this.col,this.table);
		coord.push(i);
		coord.push(j+1);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i-1,j+1,this.col,this.table);
		coord.push(i-1);
		coord.push(j+1);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i-1,j+2,this.col,this.table);
		coord.push(i-1);
		coord.push(j+2);
		this.coords.push(coord.slice());
	}
	rotate(){
		let coord = [];
		switch(this.rotation){
			case 0:
				colorCell(this.i+1,this.j + 2,this.col,this.table);
				uncolorCell(this.i,this.j,this.table);
				this.coords.shift();
				coord.push(this.i+1);
				coord.push(this.j+2);
				this.coords.unshift(coord.slice());
				coord = [];
				colorCell(this.i,this.j+2,this.col,this.table);
				uncolorCell(this.i-1,this.j+2,this.table);
				this.coords.pop();
				coord.push(this.i);
				coord.push(this.j+2);
				this.coords.push(coord.slice());
				this.rotation = (this.rotation + 1) % 2;
				break;
			case 1:
				uncolorCell(this.i+1,this.j + 2,this.table);
				colorCell(this.i,this.j,this.col,this.table);
				this.coords.shift();
				coord.push(this.i);
				coord.push(this.j);
				this.coords.unshift(coord.slice());
				coord = [];
				uncolorCell(this.i,this.j+2,this.table);
				colorCell(this.i-1,this.j+2,this.col,this.table);
				this.coords.pop();
				coord.push(this.i-1);
				coord.push(this.j+2);
				this.coords.push(coord.slice());
				this.rotation = (this.rotation + 1) % 2;
				break;
		}
	}
}
class KeysShape extends Shape{
	constructor(i,j,table){
		super(i,j,table,'purple');
		let coord = [];
		colorCell(i,j,this.col,this.table);
		coord.push(i);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+1,this.col,this.table);
		coord.push(i);
		coord.push(j+1);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+2,this.col,this.table);
		coord.push(i);
		coord.push(j+2);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i-1,j+1,this.col,this.table);
		coord.push(i-1);
		coord.push(j+1);
		this.coords.push(coord.slice());
	}
	rotate(){
		let coord = [];
		switch(this.rotation){
			case 0:
				colorCell(this.i+1,this.j + 1,this.col,this.table);
				uncolorCell(this.i,this.j,this.table);
				this.coords.shift();
				coord.push(this.i+1);
				coord.push(this.j+1);
				this.coords.unshift(coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 1:
				uncolorCell(this.i-1,this.j + 1,this.table);
				colorCell(this.i,this.j,this.col,this.table);
				this.coords.pop();
				coord.push(this.i);
				coord.push(this.j);
				this.coords.unshift(coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 2:
				uncolorCell(this.i,this.j + 2,this.table);
				colorCell(this.i - 1,this.j + 1,this.col,this.table);
				this.coords.splice(3,1);
				coord.push(this.i - 1);
				coord.push(this.j + 1);
				this.coords.splice(3,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 3:
				uncolorCell(this.i + 1,this.j + 1,this.table);
				colorCell(this.i,this.j + 2,this.col,this.table);
				this.coords.splice(1,1);
				coord.push(this.i);
				coord.push(this.j + 2);
				this.coords.splice(2,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
		}
	}
}

class KeysLeftShape extends Shape{
	constructor(i,j,table){
		super(i,j,table,'blue');
		let coord = [];
		colorCell(i,j,this.col,this.table);
		coord.push(i);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+1,this.col,this.table);
		coord.push(i);
		coord.push(j+1);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+2,this.col,this.table);
		coord.push(i);
		coord.push(j+2);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i-1,j,this.col,this.table);
		coord.push(i-1);
		coord.push(j);
		this.coords.push(coord.slice());
	}
	rotate(){
		let coord = [];
		switch(this.rotation){
			case 0:
				colorCell(this.i - 1,this.j + 1,this.col,this.table);
				uncolorCell(this.i,this.j + 2,this.table);
				this.coords.splice(2,1);
				coord.push(this.i - 1);
				coord.push(this.j+1);
				this.coords.splice(2,0,coord.slice());
				coord = [];
				colorCell(this.i+1,this.j,this.col,this.table);
				uncolorCell(this.i,this.j + 1,this.table);
				this.coords.splice(1,1);
				coord.push(this.i+1);
				coord.push(this.j);
				this.coords.splice(1,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 1:
				uncolorCell(this.i-1,this.j,this.table);
				colorCell(this.i,this.j - 1,this.col,this.table);
				this.coords.pop();
				coord.push(this.i);
				coord.push(this.j - 1);
				this.coords.push(coord.slice());
				coord = [];
				uncolorCell(this.i-1,this.j + 1,this.table);
				colorCell(this.i,this.j + 1,this.col,this.table);
				this.coords.splice(2,1);
				coord.push(this.i);
				coord.push(this.j + 1);
				this.coords.splice(2,0,coord.slice());
				coord = [];
				uncolorCell(this.i + 1,this.j,this.table);
				colorCell(this.i + 1,this.j + 1,this.col,this.table);
				this.coords.splice(1,1);
				coord.push(this.i + 1);
				coord.push(this.j + 1);
				this.coords.splice(1,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 2:
				uncolorCell(this.i + 1,this.j + 1,this.table);
				colorCell(this.i + 1,this.j,this.col,this.table);
				this.coords.splice(1,1);
				coord.push(this.i + 1);
				coord.push(this.j);
				this.coords.splice(1,0,coord.slice());
				coord = [];
				uncolorCell(this.i,this.j - 1,this.table);
				colorCell(this.i + 1,this.j - 1,this.col,this.table);
				this.coords.pop();
				coord.push(this.i + 1);
				coord.push(this.j - 1);
				this.coords.push(coord.slice());
				coord = [];
				uncolorCell(this.i,this.j + 1,this.table);
				colorCell(this.i - 1,this.j,this.col,this.table);
				this.coords.splice(2,1);
				coord.push(this.i - 1);
				coord.push(this.j);
				this.coords.splice(2,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 3:
				uncolorCell(this.i + 1,this.j - 1,this.table);
				colorCell(this.i,this.j - 1,this.col,this.table);
				this.coords.pop();
				coord.push(this.i);
				coord.push(this.j - 1);
				this.coords.push(coord.slice());
				coord = [];
				uncolorCell(this.i + 1,this.j,this.table);
				colorCell(this.i,this.j + 1,this.col,this.table);
				this.coords.splice(1,1);
				coord.push(this.i);
				coord.push(this.j + 1);
				this.coords.splice(1,0,coord.slice());
				coord = [];
				uncolorCell(this.i - 1,this.j,this.table);
				colorCell(this.i - 1,this.j - 1,this.col,this.table);
				this.coords.splice(2,1);
				coord.push(this.i - 1);
				coord.push(this.j - 1);
				this.coords.splice(2,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = this.coords.pop();
				this.coords.unshift(coord.slice());
				this.j--;
				coord = [];
				break;
		}
	}
}
class KeysRightShape extends Shape{
	constructor(i,j,table){
		super(i,j,table,'orange');
		let coord = [];
		colorCell(i,j,this.col,this.table);
		coord.push(i);
		coord.push(j);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+1,this.col,this.table);
		coord.push(i);
		coord.push(j+1);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i,j+2,this.col,this.table);
		coord.push(i);
		coord.push(j+2);
		this.coords.push(coord.slice());
		coord = [];
		colorCell(i-1,j+2,this.col,this.table);
		coord.push(i-1);
		coord.push(j+2);
		this.coords.push(coord.slice());
	}
	rotate(){
		let coord = [];
		switch(this.rotation){
			case 0:
				colorCell(this.i - 1,this.j,this.col,this.table);
				uncolorCell(this.i - 1,this.j + 2,this.table);
				this.coords.pop();
				coord.push(this.i - 1);
				coord.push(this.j);
				this.coords.push(coord.slice());
				coord = [];
				colorCell(this.i+1,this.j + 1,this.col,this.table);
				uncolorCell(this.i,this.j + 2,this.table);
				this.coords.splice(2,1);
				coord.push(this.i+1);
				coord.push(this.j + 1);
				this.coords.splice(2,0,coord.slice());
				coord = [];
				colorCell(this.i + 1,this.j,this.col,this.table);
				uncolorCell(this.i,this.j + 1,this.table);
				this.coords.splice(1,1);
				coord.push(this.i + 1);
				coord.push(this.j);
				this.coords.splice(1,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 1:
				uncolorCell(this.i-1,this.j,this.table);
				colorCell(this.i,this.j + 1,this.col,this.table);
				this.coords.pop();
				coord.push(this.i);
				coord.push(this.j + 1);
				this.coords.push(coord.slice());
				coord = [];
				uncolorCell(this.i + 1,this.j + 1,this.table);
				colorCell(this.i + 1,this.j - 1,this.col,this.table);
				this.coords.splice(2,1);
				coord.push(this.i + 1);
				coord.push(this.j - 1);
				this.coords.splice(2,0,coord.slice());
				coord = [];
				uncolorCell(this.i + 1,this.j,this.table);
				colorCell(this.i,this.j - 1,this.col,this.table);
				this.coords.splice(1,1);
				coord.push(this.i);
				coord.push(this.j - 1);
				this.coords.splice(1,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 2:
				uncolorCell(this.i,this.j - 1,this.table);
				colorCell(this.i - 1,this.j - 1,this.col,this.table);
				this.coords.splice(1,1);
				coord.push(this.i - 1);
				coord.push(this.j - 1);
				this.coords.splice(1,0,coord.slice());
				coord = [];
				uncolorCell(this.i,this.j + 1,this.table);
				colorCell(this.i - 1,this.j,this.col,this.table);
				this.coords.pop();
				coord.push(this.i - 1);
				coord.push(this.j);
				this.coords.push(coord.slice());
				coord = [];
				uncolorCell(this.i + 1,this.j - 1,this.table);
				colorCell(this.i + 1,this.j,this.col,this.table);
				this.coords.splice(2,1);
				coord.push(this.i + 1);
				coord.push(this.j);
				this.coords.splice(2,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = [];
				break;
			case 3:
				uncolorCell(this.i - 1,this.j,this.table);
				colorCell(this.i - 1,this.j + 1,this.col,this.table);
				this.coords.pop();
				coord.push(this.i - 1);
				coord.push(this.j + 1);
				this.coords.push(coord.slice());
				coord = [];
				uncolorCell(this.i - 1,this.j - 1,this.table);
				colorCell(this.i,this.j - 1,this.col,this.table);
				this.coords.splice(1,1);
				coord.push(this.i);
				coord.push(this.j - 1);
				this.coords.splice(1,0,coord.slice());
				coord = [];
				uncolorCell(this.i + 1,this.j,this.table);
				colorCell(this.i,this.j + 1,this.col,this.table);
				this.coords.splice(2,1);
				coord.push(this.i);
				coord.push(this.j + 1);
				this.coords.splice(2,0,coord.slice());
				this.rotation = (this.rotation + 1) % 4;
				coord = this.coords.shift();
				this.coords.splice(1,0,coord.slice());
				this.j--;
				coord = [];
				break;
		}
	}
}
function generate_next_shape(){
	for(let i = 0;i < 3;i++){
		for(let j = 0;j < 6;j++) uncolorCell(i,j,'NEXT');
	}
	let number = Math.floor(Math.random()*allowed_figures.length);
	next_shape = allowed_figures[number];
	next_shape = current_shape.clone(2,1,'NEXT');
	return number;
}
var number; 
function generate_shape(){
	current_shape = allowed_figures[number];
	current_shape = current_shape.clone(current_shape.i,current_shape.j,current_shape.table)
	number = generate_next_shape();
}
function move_all_shapes(num){
	for(let i = num - 1;i >= 0;i--){
		for(let j = 0;j < m;j++){
			if(matrix[i][j] != null){
				colorCell(i+1,j,$(matrix[i][j]).css('backgroundColor'),'GAMETABLE')
			}
			else uncolorCell(i+1,j,'GAMETABLE');
		}
	}
	current_shape = null;
}
function checkEnd(){
	let cnt = 0;
	let scnt = 0;
	for(let i = 0;i < m;i++){
		if(matrix[1][i] != null){
			cnt++;
			if(i >= 9 && i <=13) scnt++;
		}
	}
	if(cnt  == m|| scnt > 1){
		end = true;
		$('#gameover').show();
		clearInterval(interval);
		let name = prompt('UNESTI IME:');
		players = JSON.parse(window.localStorage['players']);
		players[name] = score;
		window.localStorage['players'] = JSON.stringify(players);
		window.location.href = './tetris-rezultati.html'
	}
}
function checkLine(){
	clearInterval(interval);
	let lines_cleared = 0;
	for(let i = 0;i < n;i++){
		let cnt = 0;
		for(let j = 0;j < m;j++){
			if(matrix[i][j] != null) cnt++;	
		}
		if(cnt == m){ move_all_shapes(i);
			lines++; 
			lines_cleared++;
		}

	}
	switch(lines_cleared){
		case 1:
			score+= 40*(level + 1);
			break;
		case 2:
			score += 100*(level + 1);
			break;
		case 3:
			score += 300*(level + 1);
		case 4:
			score += 1200*(level + 1);
	}
	update_score();
	update_lines();
	checkEnd();
	if(lines/10 > level){
		level++;
		update_level();
		speed = speed * 0.85;
	}
	if (!end)interval = setInterval(() => {current_shape.move('d')},speed);
}
function update_score(){
	$('#SCORE_VAL').text(score);
}
function update_level(){
	$('#LEVEL').text(level);
}
function update_lines(){
	$('#LINES').text(lines);
}
let figs = JSON.parse(window.localStorage['selected'])
function init_allowed_figures(){
	if(figs['Z'] == 'ok')allowed_figures.push(new ZShape(1,10,'GAMETABLE'));
	if(figs['S'] == 'ok')allowed_figures.push(new SquareShape(1,10,'GAMETABLE'));
	if(figs['IZ'] == 'ok')allowed_figures.push(new InverseZShape(1,10,'GAMETABLE'));
	if(figs['K'] == 'ok')allowed_figures.push(new KeysShape(1,10,'GAMETABLE'));
	if(figs['KL'] == 'ok')allowed_figures.push(new KeysLeftShape(1,10,'GAMETABLE'));
	if(figs['KR'] == 'ok')allowed_figures.push(new KeysRightShape(1,10,'GAMETABLE'));
	if(figs['L'] == 'ok')allowed_figures.push(new LineShape(1,10,'GAMETABLE'));

}
$(document).ready(()=>{
	$('#gameover').hide();
	init_allowed_figures();
	number = Math.floor(Math.random()*allowed_figures.length);
	let diff = window.localStorage['diff'];
	if(diff == 'L') speed = 1500;
	else if(diff == 'S') speed = '1200';
	else if(diff == 'T') speed = '500';
	for(let i = 0;i < n;i++){
		let row = $('<tr></tr>');
		for(let i = 0;i < m;i++){
			let cell = $('<td class="tetris"></td>');
			row.append(cell);
		}
		$('#GAMETABLE').append(row);
	}
	function init(){
		score = 0;
		level = 0;
		lines = 0;
		update_score();
		$('#LEVEL').text(level);
		$('#LINES').text(lines);
		for(let i = 0;i < n;i++){
			let row = [];
			for(let j = 0;j < m;j++){
				row.push(null);
			}
			matrix.push(row);
		}
		generate_shape();
		interval = setInterval(() => {current_shape.move('d')},speed);
	}
	init();
	document.addEventListener('keydown',function(event){
		if(event.key === 'ArrowLeft') current_shape.move('l');	
		if(event.key === 'ArrowRight') current_shape.move('r');	
		if(event.key === 'r' || event.key === 'R') current_shape.rotate();
		if(event.key === 'ArrowDown') current_shape.move_down();
	});

});


