/*******************************************************
 ********************** INPUT **************************
 *******************************************************/

//Keyboard object: easier way to deal with keyEvents without needing to add and remove EventListeners when the scene is changed, just check the current state
var keyboard = {
	keysPressed: new Uint8Array(255),//Each byte represent a key
	keysDowns: [],//keys pressed down since last call to resetKeysDownUp();
	keysUps: [],//keys pressed up since last call to resetKeysDownUp();
	//init: set everithing up and start to listen to the keyboard events on the element
	init: function(element){
		var keyboardContext = this;
		//KeyDown Event: will run when a key is pressed or holded down(this event will be fired multiple times)
		element.addEventListener("keydown", function(e){
			//if the key is not pressed and thre's no keydown event yet for this key: add the key to the keysDown list
			if(keyboardContext.getKeyPressed(e.keyCode)==false && keyboardContext.getKeyDown(e.keyCode)==false){
				keyboardContext.keysDowns.push(e.keyCode);
			}
			//set the key to pressed
			keyboardContext.keysPressed[e.keyCode] = 1;
		}, true);
		//KeyUp Event: will run when a key is released
		element.addEventListener("keyup", function(e){
			//if the key is not pressed and thre's no keyup event yet for this key: add the key to the keysUp list
			if(keyboardContext.getKeyPressed(e.keyCode)==true && keyboardContext.getKeyUp(e.keyCode)==false){
				keyboardContext.keysUps.push(e.keyCode);
			}
			//set the key to not pressed
			keyboardContext.keysPressed[e.keyCode] = 0;
		}, true);
	},
	//Check whether the key(keyCode or Character) has been pressed down since las call to resetKeysDownUp()
	getKeyDown: function(key){
		if(typeof key == "string")key = key.toUpperCase().charCodeAt();//It's a string: get the keyCode for the first character
		return this.keysDowns.indexOf(key)!=-1;//check if the keyCode is is the keysDowns list
	},
	//Check whether the key(keyCode or Character) is pressed right now
	getKeyPressed: function(key){
		if(typeof key == "string")key = key.toUpperCase().charCodeAt(); //It's a string: get the keyCode for the first character
		return this.keysPressed[key]==1;//check if the key is pressed
	},
	//Check whether the key(keyCode or Character) has been pressed up since las call to resetKeysDownUp()
	getKeyUp: function(key){
		if(typeof key == "string")key = key.toUpperCase().charCodeAt(); //It's a string: get the keyCode for the first character
		return this.keysUps.indexOf(key)!=-1;//check if the keyCode is is the keysUps list
	},
	//Reset the keysDowns and keysUps
	resetKeysDownUp: function(){
		this.keysDowns = [];
		this.keysUps = [];
	}
};

//Mouse object: easier way to deal with mouseEvents without needing to add and remove EventListeners when the scene is changed, just check the current state
var mouse = {
	mouseDown: false,//mouse pressed down since last call to resetKeysDownUp();
	mousePressed: false,//current mouse press status
	mouseUp: false,//mouse pressed up since last call to resetKeysDownUp();
	mouseX: -1,//mouse poxition X
	mouseY: -1,//mouse position Y
	//init: set everithing up and start to listen to the mouse events on the element
	init: function(element){
		var mouseContext = this;
		//MouseDown Event: will run when the left mouse is pressed
		element.addEventListener("mousedown", function(e){
			//if the mouse is not pressed:
			if(mouseContext.mousePressed==false){
				mouseContext.mouseDown = true;
			}
			//set the mouse to pressed
			mouseContext.mousePressed = true;
		}, true);
		//MouseUp Event: will run when a key is released
		element.addEventListener("mouseup", function(e){
			//if the mouse is pressed:
			if(mouseContext.mousePressed==true){
				mouseContext.mouseUp = true;
			}
			//set the mouse to not pressed
			mouseContext.mousePressed = false;
		}, true);
		//MouseMove Event: will run when the mouse is moved
		element.addEventListener("mousemove", function(e){
			//update mouse position
			mouseContext.mouseX = e.pageX;
			mouseContext.mouseY = e.pageY;
		}, true);
	},
	//Check whether the mouse has been pressed down since last call to resetMouseDownUp()
	getMouseDown: function(){
		return this.mouseDown;
	},
	//Check whether the mouse is pressed right now
	getMousePressed: function(){
		return this.mousePressed;
	},
	//Check whether the mouse has been pressed up since las call to resetMouseDownUp()
	getMouseUp: function(){
		return this.mouseUp;
	},
	//Get the current mouse position
	getMousePosition: function(){
		return { x:this.mouseX, y:this.mouseY };
	},
	//Reset the mouseDown and mouseUp
	resetMouseDownUp: function(){
		this.mouseDown = false;
		this.mouseUp = false;
	}
};

/*******************************************************
 *********************** GAME **************************
 *******************************************************/
 
//imageManager object: image pool, load images and check when they are loaded
//After call imageManager.load("imgName", "imgUrl") use imageManager.imgName to acces the image
var imageManager = {
	loaded: 0,//counts how many images are loaded and ready for use
	length: 0,//counts how many images are being managed. Not all of them are loaded.
	load: function(imgName, imgUrl, loadedCallback){//load an image, this method is asynchronous(it may returns before the image is loaded)
		if(this.hasOwnProperty(imgName))return null;//check if image already exists
		var img = new Image();//create a image
		this[imgName] = img;//append the image to the object
		var imageManagerContext = this;
		imageManagerContext.length++;//one more image added
		img.addEventListener("load", function(){//add Event for image load
			imageManagerContext.loaded++;//one more image loaded
			if(loadedCallback)loadedCallback(imgName, img);//call the callback
		}, true);
		img.src = imgUrl;//start to load the image
		return img;
	}
};

//game object: manages canvas, images, scene and main loop.
//call init(...) to set the canvas element
//call images.load("imgName", "imgUrl") to load a image(asynchronous)
//set the currentScene property to some object with processInput, update and render
//call mainLoop to process and render. This method will repeat automatically if keepMainLoopRunning==true
var game = {
	//
	canvasContext: null,// we will draw everithing here
	images: imageManager,// we need to store them somewere
	currentScene: null,// each scene has a processInput, update and render. Those will define how to draw the scene.
	keepMainLoopRunning: false,// should we keep running the main loop and drawing every time? You will be able to call mainLoop and create a new frame but it will run only once
	//
	init: function(canvasElement){
		this.canvasContext = canvasElement.getContext("2d");//get the context
		//everithing set! we can call mainLoop
	},
	//
	mainLoop: function(){
		if(game.currentScene!=null){//We need a scene to draw, there's nothing to do if we don't have a current scene
			game.currentScene.processInput(game, keyboard, mouse);//process input
			keyboard.resetKeysDownUp();
			mouse.resetMouseDownUp();
			game.currentScene.update(game, 0);//update: move objects, physics, ...
			game.currentScene.render(game);//render: just draw everithing as it is(should not change anything in the scene)
		}
		if(game.keepMainLoopRunning)requestAnimationFrame(game.mainLoop);//draw the next frame when it's convenient
		
	},
	//
};


/*******************************************************
 ****************** STRUCTURES *************************
 *******************************************************
 * Point: { x:number, y:number }
 * Line/LineSegment: { x0:number, y0:number, x1:number, y1:number }
 * Box: { x:number, y:number, w:number, h:number }
 * Polygon: [ Point... ]
 */
 function PointPoint2Line(pt0, pt1){
	return {
		x0: pt0.x,
		y0: pt0.y,
		x1: pt1.x,
		y1: pt1.y,
	};
 }
 function PointPoint2Box(pt0, pt1){
	return { 
		 x: Math.min(pt0.x, pt1.x),
		 y: Math.min(pt0.y, pt1.y),
		 w: Math.abs(pt0.x - pt1.x),
		 h: Math.abs(pt0.y - pt1.y)
	};
 }
 function Line2Box(lin){
	return { 
		 x: Math.min(lin.x0, lin.x1),
		 y: Math.min(lin.y0, lin.y1),
		 w: Math.abs(lin.x0 - lin.x1),
		 h: Math.abs(lin.y0 - lin.y1)
	};
 }
 function Box2Polygon(box){
	 return [
		{ x:box.x, y:box.y },
		{ x:box.x+box.w, y:box.y },
		{ x:box.x+box.w, y:box.y+box.h },
		{ x:box.x, y:box.y+box.h }
	]
 }

/*******************************************************
 ******************* COLLISION *************************
 *******************************************************/
//cehcks whether a point is inside a box
function checkBoxPointCollision(box, pt){
    return !(	box.x > pt.x
        	|| 	box.x+box.w < pt.x
        	|| 	box.y > pt.y
        	|| 	box.y+box.h < pt.y);
}
//cehcks whether thow box intersects themselves at some point
function checkBoxBoxCollision(box0, box1){
	//http://gamedev.stackexchange.com/questions/586/what-is-the-fastest-way-to-work-out-2d-bounding-box-intersection
    return !(	box1.x > box0.x+box0.w
        	|| 	box1.x+box1.w < box0.x
        	|| 	box1.y > box0.y+box0.h
        	|| 	box1.y+box1.h < box0.y);
}
//cehcks whether a point is inside a polygon
function checkPolygonPointCollision(pol, pt){
	//Ray casting algorithm
	//http://alienryderflex.com/polygon/
	var oddNodes=false;
	for (var i=0, j=pol.length-1; i<pol.length; j=i,i++) {//iterate over each vertex
		if ((pol[i].y<=pt.y && pt.y<=pol[j].y) || (pol[j].y<=pt.y && pt.y<=pol[i].y)) {//py.y ta dentro
			if (pol[i].x+(pt.y-pol[i].y)/(pol[j].y-pol[i].y)*(pol[j].x-pol[i].x)<=pt.x) {
				oddNodes = !oddNodes;
			}
		}
	}
	return oddNodes;
}
//checks wether two line intersects themselves, return the collision points or null
function checkLineLineIntersection(lin0, lin1){
	//http://stackoverflow.com/questions/4543506/algorithm-for-intersection-of-2-lines
	//linA*X + linB*Y = linC
	var lin0a=lin0.y1-lin0.y0, lin0b=lin0.x0-lin0.x1, lin0c=lin0a*lin0.x0+lin0b*lin0.y0;
	var lin1a=lin1.y1-lin1.y0, lin1b=lin1.x0-lin1.x1, lin1c=lin1a*lin1.x0+lin1b*lin1.y0;
	var delta = lin0a*lin1b - lin1a*lin0b;
	if(Math.abs(delta)<1e-9) return null;//parallel lines
	var x = (lin1b*lin0c - lin0b*lin1c)/delta;
	var y = (lin0a*lin1c - lin1a*lin0c)/delta;
	return { x: x, y:y };
}
//checks wether two line SEGMENTS intersects themselves, return the collision points or null
function checkLineSegmentLineSegmentsIntersection(lin0, lin1){
	var point = checkLineLineIntersection(lin0, lin1);
	if(point==null)return null;
	var lin0bb = Line2Box(lin0), lin1bb = Line2Box(lin1);
	if(checkBoxPointCollision(lin0bb, point)==false || checkBoxPointCollision(lin1bb, point)==false)return null;
	return point;
}
//checks wether a line intersects a polygon, return the collision points
function checkPolygonLineIntersections(pol, lin){
	var intersections = [];
	for(var i=0, j=pol.length-1; i<pol.length; j=i,i++){
		var nlin = PointPoint2Line(pol[i], pol[j]);
		var r = checkLineSegmentLineSegmentsIntersection(lin, nlin);
		if(r!=null){
			intersections.push(r);
		}
	}
	return intersections;
}
//checks wether two polygons intersects themselves, return the collision points
function checkPolygonPolygonIntersections(pol0, pol1){
	var intersections = [];
	for(var i=0, j=pol0.length-1; i<pol0.length; j=i,i++){
		var nlin = PointPoint2Line(pol0[i], pol0[j]);
		var r = checkPolygonLineIntersections(pol1, nlin);
		intersections = intersections.concat(r);
	}
	return intersections;
}
//checks wether a line intersects a box, return the collision points
function checkBoxLineIntersections(box, lin){
	var pol = Box2Polygon(box);
	return checkPolygonLineIntersections(pol, lin);
}


/*******************************************************
 ******************* TESTS ******************************
 *******************************************************/
function limitVectLen(vec, lim){
	var len = Math.sqrt(vec.x*vec.x+vec.y*vec.y);
	if(len>lim){
		vec.x *= lim/len;
		vec.y *= lim/len;
	}
}
function colorDiff(r0, g0, b0, r1, g1, b1){
	return Math.max(Math.abs(r1-r0), Math.abs(g1-g0), Math.abs(b1-b0));
}
var collisionTestScene = {
	box1: { x:50, y:50, w: 50, h: 50 },
	box2: { x:150, y:200, w: 50, h: 50, c:null },
	line1: { x0:50, y0:50, x1:700, y1:230 },
	line2: { x0:800, y0:150, x1:0, y1:0 },
	extraPts: [],
	processInput: function(gameContext, keyboard, mouse){
		//move box1 using keyboard(WSAD)
		if(keyboard.getKeyPressed("a"))this.box1.x -= 5;
		if(keyboard.getKeyPressed("d"))this.box1.x += 5;
		if(keyboard.getKeyPressed("w"))this.box1.y -= 5;
		if(keyboard.getKeyPressed("s"))this.box1.y += 5;
		//move box2 using mouse
		this.box2.x = mouse.getMousePosition().x;
		this.box2.y = mouse.getMousePosition().y;
		//move lines
		this.line1.x0 = this.box1.x;
		this.line1.y0 = this.box1.y;
		this.line2.x1 = this.box2.x;
		this.line2.y1 = this.box2.y;
		//set box2 color using mouse events
		if(mouse.getMouseDown()){
			this.box2.c = "#F00";
		}else if(mouse.getMouseUp()){
			this.box2.c = "#0F0";
		}else if(mouse.getMousePressed()){
			this.box2.c = "#FF0";
		}else{
			this.box2.c = "#000";
		}
	},
	update: function(gameContext, deltaTime){
		//console.log(this.line1, this.line2, JSON.stringify(this.extraPts));
		//console.log(checkBoxPointCollision(this.box1, this.box2), checkPolygonPointCollision(Box2Polygon(this.box1), this.box2), checkBoxBoxCollision(this.box1, this.box2));
		/*//
		var pt = checkLineSegmentLineSegmentsIntersection(this.line1, this.line2);
		this.extraPts = [];
		if(pt!=null)this.extraPts.push(pt);
		//
		this.extraPts = checkBoxLineIntersections(this.box1, this.line2);
		//*/
		//console.log(JSON.stringify(Box2Polygon(this.box1)), JSON.stringify(Box2Polygon(this.line2)));
		this.extraPts = checkPolygonPolygonIntersections(Box2Polygon(this.box1), Box2Polygon(this.box2));
		
	},
	render: function(gameContext){
		var canvas = gameContext.canvasContext;
		canvas.clearRect(0, 0, 1280, 720);
		//draw boxes
		canvas.fillStyle = "#F0F";
		canvas.fillRect(this.box1.x, this.box1.y, this.box1.w, this.box1.h);
		canvas.fillStyle = this.box2.c;
		canvas.fillRect(this.box2.x, this.box2.y, this.box2.w, this.box2.h);
		//draw lines
		canvas.strokeStyle = "#00F";
		canvas.beginPath();
		canvas.moveTo(this.line1.x0, this.line1.y0);
		canvas.lineTo(this.line1.x1, this.line1.y1);
		canvas.closePath();
		canvas.stroke();
		canvas.beginPath();
		canvas.moveTo(this.line2.x0, this.line2.y0);
		canvas.lineTo(this.line2.x1, this.line2.y1);
		canvas.closePath();
		canvas.stroke();
		//draw collisions
		canvas.fillStyle = "#00F";
		for(var i=0; i<this.extraPts.length; i++){
			canvas.beginPath();
			canvas.arc(this.extraPts[i].x, this.extraPts[i].y, 10, 0, 2*Math.PI);
			canvas.closePath();
			canvas.fill();
		}
	}
}