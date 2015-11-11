// JavaScript Document
/**
* Script Name
* Author: Team Tide <email@server.com>
* Date: November 2015
* Version: 0.0
* Description
*/




/*******************************************************
 ********************* SCENES **************************
 *******************************************************/

//Image Loading Scent
var loadingScene = {
	processInput: function(gameContext, keyboard, mouse){},//Nothing to do here!
	update: function(gameContext, deltaTime){},//Nothing to do here!
	render: function(gameContext){
		var gameImageManager = gameContext.images;
		if(gameImageManager.loaded==gameImageManager.length){//check whether all images are loaded
			gameContext.currentScene = menuScene;//All images loaded! Go to the menu!
		}else{
			//write in the canvas how many images are currently loaded
			var canvas = gameContext.canvasContext;
			var text = "Loading images: " + gameImageManager.loaded + "/" + gameImageManager.length;
			canvas.fillText(text, 50, 50);
		}
	}
};

//Menu
var menuScene = {
	processInput: function(gameContext, keyboard, mouse){},//Nothing to do here!
	update: function(gameContext, deletaTime){},//Nothing to do here!
	render: function(gameContext){
		gameContext.currentScene = gameScene;//go straight to the game
		keyboard.resetKeysDownUp();//reset keys before start the game
	}
};

//Game
var gameScene = {
	gravity: { x:0, y:0.3 },
	mainCharacter: {
		position: { x:10, y:150 },
		speed: { x:0, y:0 },
		acceleration: { x:0, y:0 },
		state: ""
	},
	platforms: [
		{ x:0, y:230, w:200, h:330 },
		{ x:200, y:200, w:200, h:330 },
		{ x:470, y:200, w:200, h:330 },
		{ x:740, y:285, w:200, h:330 },
		{ x:940, y:210, w:200, h:330 },
		{ x:1255, y:280, w:200, h:330 },
		{ x:1590, y:390, w:200, h:330 },
		{ x:1915, y:380, w:200, h:330 },
		{ x:2090, y:305, w:200, h:330 },
		{ x:2290, y:230, w:200, h:330 },
		{ x:2580, y:230, w:200, h:330 },
	],
	ropes: [
		{ x0:1430, y0:245, x1:1610, y1:355 }
	],
	ladders: [
		{ x0:2060, y0:380, x1:2090, y1:305 }
	],
	pipes: [
		{ x0:2290, y0:305, x1:2290, y1:220 }
	],
	poles: [
		{ x:2530, y:190 }
	],
	billboards: [
		{ x:1770, y:330, w:160, h:80 }
	],
	objects: [
		{
			otype: "platform",
			poly: []
		}
	],
	processInput: function(gameContext, keyboard, mouse){
		if(keyboard.getKeyDown("w")){//jump
			this.mainCharacter.speed.y -= 5;
		}
		if(keyboard.getKeyDown("a")){//run left, start
			this.mainCharacter.speed.x -= 5;
		}
		if(keyboard.getKeyUp("a")){//run left, start
			this.mainCharacter.speed.x += 5;
		}
		if(keyboard.getKeyDown("d")){//run right, start
			this.mainCharacter.speed.x += 5;
		}
		if(keyboard.getKeyUp("d")){//run right, end
			this.mainCharacter.speed.x -= 5;
		}
	},
	update: function(gameContext, deltaTime){
		//update mainCharacter.speed: discrete integrate acceleration and gravity
		this.mainCharacter.speed.x += this.mainCharacter.acceleration.x + this.gravity.x;
		this.mainCharacter.speed.y += this.mainCharacter.acceleration.y + this.gravity.y;
		if(this.mainCharacter.speed.y>5)this.mainCharacter.speed.y=5;
		//update mainCharacter.position: discrete integrate speed
		this.mainCharacter.position.x += Math.floor(this.mainCharacter.speed.x);
		this.mainCharacter.position.y += Math.floor(this.mainCharacter.speed.y);
		//Check for platform collision
		var allCollisions = [];
		for(var i=0; i<this.platforms.length; i++){
			var mainCharBB = { x:this.mainCharacter.position.x, y:this.mainCharacter.position.y, w:120/4, h:183/4 };
			var mainCharBP = Box2Polygon(mainCharBB);
			//var mainCharacterPtBM = { x:mainCharBB.x+mainCharBB.w/2, h:mainCharBB.y+mainCharBB.h };
			var collisions = checkPolygonPolygonIntersections(Box2Polygon(this.platforms[i]), mainCharBP);
			var collisionMaxX=-Infinity, collisionMinX=+Infinity, collisionMaxY=-Infinity, collisionMinY=+Infinity;
			var collisionBottom=0, collisionTop=0, collisionLeft=0, collisionRight=0, collisionBottomLeft=0, collisionBottomRight=0, collisionTopLeft=0, collisionTopRight=0;
			//console.log(JSON.stringify(collisions), JSON.stringify(mainCharBB));
			for(var j=0; j<collisions.length; j++){
				collisionBottomLeft += Math.abs(collisions[j].y-(mainCharBB.y+mainCharBB.h))<1e-3 && Math.abs(collisions[j].x-(mainCharBB.x))<1e-3?1:0;
				collisionBottomRight += Math.abs(collisions[j].y-(mainCharBB.y+mainCharBB.h))<1e-3 && Math.abs(collisions[j].x-(mainCharBB.x+mainCharBB.w))<1e-3?1:0;
				collisionTopLeft += Math.abs(collisions[j].y-(mainCharBB.y))<1e-3 && Math.abs(collisions[j].x-(mainCharBB.x))<1e-3?1:0;
				collisionTopRight += Math.abs(collisions[j].y-(mainCharBB.y))<1e-3 && Math.abs(collisions[j].x-(mainCharBB.x+mainCharBB.w))<1e-3?1:0;
				collisionBottom += Math.abs(collisions[j].y-(mainCharBB.y+mainCharBB.h))<1e-3?1:0;
				collisionTop += Math.abs(collisions[j].y-(mainCharBB.y))<1e-3?1:0;
				collisionLeft += Math.abs(collisions[j].x-(mainCharBB.x))<1e-3?1:0;
				collisionRight += Math.abs(collisions[j].x-(mainCharBB.x+mainCharBB.w))<1e-3?1:0;
				collisionMaxX = Math.max(collisionMaxX, collisions[j].x);
				collisionMinX = Math.min(collisionMinX, collisions[j].x);
				collisionMaxY = Math.max(collisionMaxY, collisions[j].y);
				collisionMinY = Math.min(collisionMinY, collisions[j].y);
				allCollisions.push(collisions[j]);
			}
			collisionLeft -= collisionBottomLeft+collisionTopLeft;
			collisionRight -= collisionBottomRight+collisionTopRight;
			collisionTop -= collisionBottomLeft+collisionBottomRight;
			collisionBottom -= collisionTopLeft+collisionTopRight;
			
			//if(this.mainCharacter.speed.x>0)console.log(collisionBottom, collisionTop, collisionLeft, collisionRight, collisionBottomLeft, collisionBottomRight, collisionTopLeft, collisionTopRight, JSON.stringify(this.mainCharacter.position), JSON.stringify(collisions));
			if((collisionTop && collisionBottom) || (!!collisionLeft != !!collisionRight)){
				if(collisionRight || (this.mainCharacter.speed.x>0 && collisionTop && collisionBottom)){//going right and right collision
					console.log("c");
					//this.mainCharacter.speed.x = 0;
					this.mainCharacter.position.x = collisionMaxX-mainCharBB.w;	
				}else if(collisionLeft || (this.mainCharacter.speed.x<0 && collisionTop && collisionBottom)){//going left and left collision
					console.log("d");
					//this.mainCharacter.speed.x = 0;	
					this.mainCharacter.position.x = collisionMinX;			
					if(this.mainCharacter.speed.y<0){//slide on the wall
						//this.mainCharacter.speed.y -= this.gravity.y/2;
					}
				}
				if(this.mainCharacter.speed.y<0){//slide on the wall
					console.log("Subiu no nuro");
					//this.mainCharacter.speed.y -= this.gravity.y/2;
				}
				j--;
				continue;
			}
			
			if((collisionLeft && collisionRight) || (!!collisionTop != !!collisionBottom)){
				if(collisionBottom || (this.mainCharacter.speed.y>0 && collisionLeft && collisionRight)){//going down
					console.log("a");
					this.mainCharacter.speed.y = 0;
					this.mainCharacter.position.y = collisionMinY-mainCharBB.h;
				}else if(collisionTop || (this.mainCharacter.speed.y<0 && collisionLeft && collisionRight)){//going up
					console.log("b");
					this.mainCharacter.speed.y = 0;		
					this.mainCharacter.position.y = collisionMaxX;
				}
			}
		}
		//console.log("-");
	},
	render: function(gameContext){
		var backgroundImg = gameContext.images.background1c;
		var characterImg = gameContext.images.spritesheet;
		var canvas = gameContext.canvasContext;
		var rooftops = gameContext.images.background2;
		//draw background
		canvas.drawImage(rooftops, 0, 0);
		//move camera
		canvas.save();
		canvas.translate(200, 720/2);
		canvas.scale(1.5, 1.5);
		canvas.translate(-this.mainCharacter.position.x, -this.mainCharacter.position.y);
		//////////////////////////////////////////////
		canvas.strokeStyle = "#F00";
		for(var i=0; i<this.platforms.length; i++){
			canvas.fillRect(this.platforms[i].x, this.platforms[i].y, this.platforms[i].w, this.platforms[i].h);
			canvas.beginPath();
			canvas.rect(this.platforms[i].x, this.platforms[i].y, this.platforms[i].w, this.platforms[i].h);
			canvas.closePath();
			canvas.stroke();
		};
		//////////////////////
		//draw platforms
		//canvas.drawImage(backgroundImg, 0, 0, 1280, backgroundImg.height, 0, 0, 1280, 720);
		canvas.drawImage(backgroundImg, 0, 0, backgroundImg.width, backgroundImg.height);
		//draw main character
		var offsetsX = [ 190, 590, 1070, 1570, 2012 ];
		var t = (new Date().getTime()/300)%offsetsX.length<<0;
		//canvas.drawImage(characterImg, 75, 40, 280, 500, this.mainCharacter.position.x, this.mainCharacter.position.y, 120/4, 183/4);//draw main character
		if(this.mainCharacter.speed.x==0){
			t = 0;
		}
		canvas.fillStyle = "#0F0";
		canvas.fillRect(this.mainCharacter.position.x, this.mainCharacter.position.y, 120/4, 183/4);
		canvas.drawImage(characterImg, offsetsX[t], 140, 280, 500, this.mainCharacter.position.x, this.mainCharacter.position.y, 120/4, 183/4);//draw main character
		canvas.restore();
	}
}




/*******************************************************
 ********************** SETUP **************************
 *******************************************************/

document.addEventListener("DOMContentLoaded", function(){
	//init input
	keyboard.init(window);
	mouse.init(window);
	//game init
	game.init(document.getElementById("game"));
	//load images(async: the image image may not be loaded)
	game.images.load("background1", "img/L1.B.png");
	game.images.load("background1b", "img/L1.m.png");
	game.images.load("background1c", "img/L1.C.png");
	game.images.load("characters", "img/characters.jpg");//http://www.hybridlava.com/20-high-class-avatar-icon-sets-for-free-download/3/
	game.images.load("move2", "img/Move2.png");
	game.images.load("spritesheet", "img/SpriteSheet1.png");
	game.images.load("background2", "img/BuildingsRooftops.png");
	//set scene as loading image scene and start the loop
	game.currentScene = loadingScene;
	//game.currentScene = collisionTestScene;
	game.keepMainLoopRunning = true;//keep drawing
	game.mainLoop();
});


