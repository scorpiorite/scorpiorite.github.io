
function setup() {
	
	height = window.innerHeight
	width = window.innerWidth
	overlayWidth = width/2
	overlayHeight = height/2
	
	var canvas = createCanvas(width,height)
	canvas.parent('canvasHolder')
	
	overlay = createGraphics(overlayWidth,overlayHeight)
	
	console.log(height,width)
	
	fill(255,100,100)
	rect(0,0,width,height)
	
	// background_ = new mesh(Math.floor(Math.random()*5 + 25),window.innerHeight,window.innerWidth)
	background_ = new mesh(25,window.innerHeight,window.innerWidth)
	
	console.log(background_)
}

function draw() {
	
	clear()
	
	overlay.clear()
	//overlay.background(255)
	overlay.stroke(0)
	
	background_.spread()
	
	background_.fixNodes()
	
	background_.colorTriangles(400,400)
	
	stroke(255)
	background_.drawLinks()
	
	for(var i = 0; i < background_.nodes.length; i++) {
		fill(255,0,0)
		//ellipse(background_.nodes[i].posX,background_.nodes[i].posY,20,20)
		fill(0,0,0)
		//text(i,background_.nodes[i].posX,background_.nodes[i].posY)
	}
	
	image(overlay,width/2 - overlayWidth/2,height/2 - overlayHeight/2)
	
	textSize(100)
	textAlign(CENTER,CENTER)
	strokeWeight(4)
	stroke(0)
	fill(255)
	text("Test123", width/2, height/2)
	strokeWeight(1)
}

function scrollToElement(where) {
	if(where == "intro") {
		window.scrollTo(0,0)
	} else if(where == "main") {
		window.scrollTo(0,background_.height)
	}
}

function mesh(nodeCount,height,width) {
	this.nodes = []
	this.height = height
	this.width = width
	this.triangles = []
	
	this.distBetween = function(a,b,x) {
		if(x === undefined) {
			return Math.sqrt(Math.pow((this.nodes[a].posX - this.nodes[b].posX),2) + Math.pow((this.nodes[a].posY - this.nodes[b].posY),2))
		} else {
			return Math.sqrt(Math.pow((this.nodes[a].posX - b),2) + Math.pow((this.nodes[a].posY - x),2))
		}
	}
	
	this.closestNode = function(node) {
		var min = height*width
		index = node
		for(var i = 0; i < nodeCount; i++) {
			if(node != i) {
				distance = this.distBetween(node,i)
				if(distance < min) {
					min = distance
					index = i
				}
			}
		}
		return index
	}
	
	this.doesIntersect = function(A,B,C,D) { // Detects if there is intersection between AB and CD
		
		if(A == B || A == C || A == D || B == C || B == D || C == D) {
			return false
		}
		
		Ax = this.nodes[A].posX
		Ay = this.nodes[A].posY
		Bx = this.nodes[B].posX
		By = this.nodes[B].posY
		Cx = this.nodes[C].posX
		Cy = this.nodes[C].posY
		Dx = this.nodes[D].posX
		Dy = this.nodes[D].posY
		
		s1_x = Bx - Ax
		s1_y = By - Ay
		s2_x = Dx - Cx
		s2_y = Dy - Cy
		
		s = (-s1_y * (Ax - Cx) + s1_x * (Ay - Cy)) / (-s2_x * s1_y + s1_x * s2_y)
		t = ( s2_x * (Ay - Cy) - s2_y * (Ax - Cx)) / (-s2_x * s1_y + s1_x * s2_y)
		
		if(s >= 0 && s <= 1 && t >= 0 && t <= 1) {
			return true
		} else {
			return false
		}
	}
	
	this.bearing = function(delta_x,delta_y) {
		if(delta_x == 0) {
			if(delta_y > 0) {
				return 90
			} else {
				return 270
			}
		} else if(delta_y == 0) {
			if(delta_x > 0) {
				return 0
			} else {
				return 180
			}
		} else if(delta_y > 0){
			if(delta_x > 0) {
				return       Math.atan( delta_y/ delta_x)*(180/Math.PI)	// Q1
			} else {
				return 90 +  Math.atan(-delta_x/ delta_y)*(180/Math.PI)	// Q2
			}
		} else {
			if(delta_x < 0) {
				return 180 + Math.atan(-delta_y/-delta_x)*(180/Math.PI)	// Q3
			} else {
				return 270 + Math.atan( delta_x/-delta_y)*(180/Math.PI)	// Q4
			}
		}
	}
	
	this.drawLinks = function() {
		for(var i = 0; i < this.nodes.length; i++) {
			for(var j = 0; j < this.nodes[i].links.length; j++) {
				var x1 = background_.nodes[i].posX
				var x2 = background_.nodes[i].links[j].posX
				var y1 = background_.nodes[i].posY
				var y2 = background_.nodes[i].links[j].posY
				
				overlay.strokeWeight(0.5)
				//stroke(0)
				//line(x1,y1,x2,y2)
				//overlay.line(x1-width/4,y1-height/4,x2-width/4,y2-height/4)
			}
		}
	}
	
	this.spread = function() {
		for(var i = 0; i < this.nodes.length; i++) {
			for(var j = 0; j < this.nodes[i].links.length; j++) {
				this.nodes[i].repel(this.nodes[i].links[j].id)
			}
			// this.nodes[i].repel(0,0)
			// this.nodes[i].repel(this.width,0)
			// this.nodes[i].repel(0,this.height)
			// this.nodes[i].repel(this.width,this.height)
			this.nodes[i].move()
		}
	}
	
	this.fixNodes = function() {
		var count = 0
		while(true) {
			
			if(count > 1000) {
				break;
			}
			
			count++
			
			var noIntersects = true
			var max = 0
			var maxIndex = []
			var indexes = []
			
			for(var i = 0; i < this.nodes.length; i++) {
				for(var j = 0; j < this.nodes[i].links.length; j++) {
					for(var k = 0; k < this.nodes.length; k++) {
						for(var n = 0; n < this.nodes[k].links.length; n++) {
							
							if(this.doesIntersect(i,this.nodes[i].links[j].id,k,this.nodes[k].links[n].id)) {
								
								noIntersects = false
								
								var A = this.distBetween(i,this.nodes[i].links[j].id)
								var B = this.distBetween(k,this.nodes[k].links[n].id)
								
								if(A > B) {
									indexes.push([i,this.nodes[i].links[j].id])
								} else {
									indexes.push([k,this.nodes[k].links[n].id])
								}
							}
						}
					}
				}
			}
			
			if(noIntersects) {
				break;
			} else {
				for(var i = 0; i < indexes.length; i++) {
					this.nodes[indexes[i][0]].unlink(indexes[i][1])
				}
			}
		}
		
		for(var i = 0; i < this.nodes.length; i++) {
			for(var j = 0; j < this.nodes.length; j++) {
				
				if(!this.nodes[i].isLinked(j) && i != j) {
					var clear = true
					
					for(var k = 0; k < this.nodes.length; k++) {
						
						if(!clear) {break;}
						
						for(var n = 0; n < this.nodes[k].links.length; n++) {
							
							if(this.doesIntersect(i,j,k,this.nodes[k].links[n].id)) {
								clear = false
							}
						}
					}
					
					if(clear) {
						this.nodes[i].link(j)
					}
				}
			}
		}
		this.detectTriangles()
	}
	
	this.detectTriangles = function() {
		this.triangles = []
		for(var i = 0; i < this.nodes.length; i++) {
			var node_1 = i
			for(var j = 0; j < this.nodes[i].links.length; j++) {
				var node_2 = this.nodes[i].links[j].id
				for(var k = 0; k < this.nodes[node_2].links.length; k++) {
					var node_3 = this.nodes[node_2].links[k].id
					for(var n = 0; n < this.nodes[node_3].links.length; n++) {
						var node_4 = this.nodes[node_3].links[n].id
						if(node_1 == node_4) {
							var triangle = [node_1,node_2,node_3].sort(function(a, b){return a - b})
							var included = false
							for(var m = 0; m < this.triangles.length; m++) {
								if(this.triangles[m][0] == triangle[0] && this.triangles[m][1] == triangle[1] && this.triangles[m][2] == triangle[2]) {
									included = true
									break;
								}
							}
							if(!included) {
								this.triangles.push(triangle)
							}
						}
					}
				}
			}
		}
	}
	
	this.colorTriangles = function(limitX,limitY) {
		for(var i = 0; i < this.triangles.length; i++) {
			
			var X1 = this.nodes[this.triangles[i][0]].posX
			var Y1 = this.nodes[this.triangles[i][0]].posY
			
			var X2 = this.nodes[this.triangles[i][1]].posX
			var Y2 = this.nodes[this.triangles[i][1]].posY
			
			var X3 = this.nodes[this.triangles[i][2]].posX
			var Y3 = this.nodes[this.triangles[i][2]].posY
			
			var area = (1/2)*Math.abs((X2-X1)*(Y3-Y1)-(X3-X1)*(Y2-Y1))
			var a = 10000
			var Tcolor = Math.floor((a/(area+a))*360)
			
			var color_ = color('hsb('+ Tcolor +', 100%, 100%)')
			fill(color_)
			// stroke(color_)
			stroke(0)
			// noStroke()
			strokeWeight(0.5)
			triangle(X1,Y1,X2,Y2,X3,Y3)
			
			overlay.fill(255-Tcolor/1.5)
			overlay.stroke(0)
			overlay.strokeWeight(0.5)
			overlay.triangle(X1-width/4,Y1-height/4,X2-width/4,Y2-height/4,X3-width/4,Y3-height/4)
		}
	}
	
	for(var i = 0; i < nodeCount; i++) {
		this.nodes.push(new node_(this,this.nodes,i,
		Math.random()*width/4 + width/2 - width/8,
		Math.random()*height/4 + height/2 - height/8
		// Math.random()*width,
		// Math.random()*height
		))
	}
	
	for(var i = 0; i < nodeCount; i++) {
		for(var j = 0; j < nodeCount; j++) {
			if(i != j) {
				this.nodes[i].links.push(this.nodes[j])
			}
		}
	}
	
	this.fixNodes()
}

node_ = function(mesh,parent,id,posX,posY) {
	this.mesh = mesh
	this.parent = parent
	this.id = id
	this.posX = posX
	this.posY = posY
	this.velX = 0
	this.velY = 0
	// this.velX = Math.random()*2 - 1
	// this.velY = Math.random()*2 - 1
	this.links = []
	
	this.link = function(x) {
		this.links.push(this.parent[x])
		this.parent[x].links.push(this)
	}
	
	this.unlink = function(x) {
		for(var i = 0; i < this.links.length; i++) {
			if(this.links[i].id == x) {
				this.links.splice(i,1)
			}
		}
		for(var i = 0; i < this.parent[x].links.length; i++) {
			if(this.parent[x].links[i].id == this.id) {
				this.parent[x].links.splice(i,1)
			}
		}
	}
	
	this.isLinked = function(x) {
		for(var i = 0; i < this.links.length; i++) {
			if(this.links[i].id == x) {
				return true
			}
		}
		return false
	}
	
	this.move = function() {
		this.posX += this.velX
		this.posY += this.velY
		if(this.posX < 0) {
			this.posX = 0
			this.velX = 0
		}
		if(this.posY < 0) {
			this.posY = 0
			this.velY = 0
		}
		if(this.posX > this.mesh.width) {
			this.posX = this.mesh.width
			this.velX = 0
		}
		if(this.posY > this.mesh.height) {
			this.posY = this.mesh.height
			this.velY = 0
		}
	}
	
	this.repel = function(x,y) { // There is probably a more efficient way to do this
		
		if(y === undefined) {
			var delta_x = this.parent[x].posX - this.posX
			var delta_y = this.parent[x].posY - this.posY
			var dist = this.mesh.distBetween(this.id,x)
		} else {
			var delta_x = x - this.posX
			var delta_y = y - this.posY
			var dist = this.mesh.distBetween(this.id,x,y)
		}
		
		var dir = this.mesh.bearing(delta_x,delta_y)
		
		var repelDir = dir > 180 ? dir - 180 : dir + 180
		
		this.posX += 30*Math.cos(repelDir*Math.PI/180)/dist
		this.posY += 30*Math.sin(repelDir*Math.PI/180)/dist
		
		//console.log(Math.cos(dir*Math.PI/180)/dist,Math.sin(dir*Math.PI/180)/dist,dist)
	}
}

function board() {
	
}

function temp() {
	var benchStart = new Date()
	
	frameRate(0)
	
	for(var i = 0; i < 1000; i++) {
		var randomNum = new Promise(
			function(resolve,reject) {
				resolve(Math.floor(Math.random()*100))
			}
		)
		
		randomNum.then(function(fulfilled){
			console.log(fulfilled)
		})
	}
	
	var benchEnd = new Date()
	var benchDiff = benchEnd - benchStart
	
	console.log('Time: ' + benchDiff)
}



