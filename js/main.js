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
		var menubackground = gameContext.images.menubackground;
		gameContext.canvasContext.drawImage(menubackground, 0, 0, 1280, 720);
		gameContext.currentScene = gameScene;
	}
};


var gamePauseScene = {
	mainWindow: { x:1280/2-500/2, y:720/2-300/2, w:500, h:300 },
	buttonBack: { x:1280/2-100/2, y:720/2-50/2, w:100, h:50, c:"#0F0", text:"Unpause" },
	processInput: function(gameContext, keyboard, mouse){
		if(keyboard.getKeyDown("p")){//pause
			gameContext.currentScene = gameScene;
		}
		this.buttonBack.c = checkBoxPointCollision(this.buttonBack, mouse.getMousePosition())?"#F00":"#0F0";
		if(mouse.getMouseDown() && this.buttonBack.c=="#F00"){//mouse has been pressed down right now and the color is hover
			gameContext.currentScene = gameScene;
		}
	},
	update: function(gameContext, deltaTime){
	},
	render: function(gameContext){
		var canvas = gameContext.canvasContext;
		//print the game in background
		gameScene.render(gameContext);
		//turn the game in the blackground darker by drawind a non-opaque black square on the canvas
		canvas.fillStyle = "rgba(0, 0, 0, 0.8)";
		canvas.beginPath();
		canvas.rect(0, 0, 1280, 720);
		canvas.closePath();
		canvas.fill();
		//draw the main window
		canvas.fillStyle = "#FFF";
		canvas.beginPath();
		canvas.rect(this.mainWindow.x, this.mainWindow.y, this.mainWindow.w, this.mainWindow.h);
		canvas.closePath();
		canvas.fill();
		//draw the button
		canvas.fillStyle = this.buttonBack.c;
		canvas.beginPath();
		canvas.rect(this.buttonBack.x, this.buttonBack.y, this.buttonBack.w, this.buttonBack.h);
		canvas.closePath();
		canvas.fill();
		//draw the text inside the button
		canvas.textAlign = "center";
    	canvas.textBaseline = "top";
		canvas.font = "bold 15px Arial";
		canvas.fillStyle = "#00F";
		canvas.fillText(this.buttonBack.text, this.buttonBack.x+this.buttonBack.w/2, this.buttonBack.y, this.buttonBack.w);
	}
}

//Game
var gameScene = {
	gravity: { x:0, y:0.3 },
	mainCharacter: {
		position: { x:10, y:150 },
		size: { w:30, h:45 },
		speed: { x:0, y:0 },
		acceleration: { x:0, y:0 },
		state: "",
		points: 0,
		timeStart: 0,
		lifes: 2.5,
		jumpAllowed: true,
		checkpoint: null,
	},
	mainCamera: {
		position: { x:10, y:0 },
		zoomRatio: 1.,
		differential: { x:0, y:0 },
	},
	platforms: [//ok
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
	ropes_ladders_pipes: [//ok
		{ x0:1430, y0:245, x1:1610, y1:355 },//rope
		{ x0:2060, y0:380, x1:2090, y1:305 },//ladder
		{ x0:2290, y0:305, x1:2290, y1:220 }//pipe
	],
	poles: [
		{ x:2530, y:190 }
	],
	billboards: [//ok
		{ x:1770, y:330, w:160, h:80 }
	],
	coinWidth: 20,
	coins: [
		{ x:570, y:200 },
		{ x:1170, y:190 },
		{ x:1220, y:220 },
		{ x:1270, y:260 },
		{ x:2720, y:215 },
		{ x:2710, y:215 },
		{ x:2715, y:220 }
	],
	other_objects: [],
	processInput: function(gameContext, keyboard, mouse){
		var jumpAcceleration = 5;
		var runSpeed = 4;
		if(keyboard.getKeyDown("w") && this.mainCharacter.jumpAllowed){//jump
			this.mainCharacter.speed.y -= jumpAcceleration;
		}
		if(keyboard.getKeyDown("a")){//run left, start
			this.mainCharacter.speed.x -= runSpeed;
		}
		if(keyboard.getKeyUp("a")){//run left, start
			this.mainCharacter.speed.x += runSpeed;
		}
		if(keyboard.getKeyDown("d")){//run right, start
			this.mainCharacter.speed.x += runSpeed;
		}
		if(keyboard.getKeyUp("d")){//run right, end
			this.mainCharacter.speed.x -= runSpeed;
		}
		if(keyboard.getKeyDown("p")){//pause
			gameContext.currentScene = gamePauseScene;
		}
		if(keyboard.getKeyDown(" ")){//pause
			alert("aaa");
		}
	},
	update: function(gameContext, deltaTime){
		{//Update main Character
			this.mainCharacter.jumpAllowed = false;
			//update mainCharacter.speed: discrete integrate acceleration and gravity
			this.mainCharacter.speed.x += this.mainCharacter.acceleration.x + this.gravity.x;
			this.mainCharacter.speed.y += this.mainCharacter.acceleration.y + this.gravity.y;
			if(this.mainCharacter.speed.y>5)this.mainCharacter.speed.y=5;//limit falling speed
			//get new position: discrete integrate speed
			var newPosition = { x:this.mainCharacter.position.x, y:this.mainCharacter.position.y };
			var oldPosition = { x:this.mainCharacter.position.x, y:this.mainCharacter.position.y };
			var overrideSpeed = false;
			//check for ropes,ladders,pipes and update position
			for(var i=0; i<this.ropes_ladders_pipes.length; i++){
				var mainCharacterBoundingBox = { x:this.mainCharacter.position.x, y:this.mainCharacter.position.y, w:this.mainCharacter.size.w, h:this.mainCharacter.size.h };
				var rlp = this.ropes_ladders_pipes[i];
				if(checkBoxLineSegmentIntersections(mainCharacterBoundingBox, rlp).length>0){
					overrideSpeed = true;
					var vectl = { x:rlp.x1-rlp.x0, y:rlp.y1-rlp.y0 };
					var modv = Math.sqrt(vectl.x*vectl.x+vectl.y*vectl.y);
					var nvectl = { x:vectl.x/modv*this.mainCharacter.speed.x/2, y:vectl.y/modv*this.mainCharacter.speed.x/2 };
					this.mainCharacter.speed.y = 0;
					newPosition.x += nvectl.x;
					newPosition.y += nvectl.y;
				}
			}
			if(overrideSpeed==false){
				newPosition.x += this.mainCharacter.speed.x;
				newPosition.y += this.mainCharacter.speed.y;
			};
			//Check for platform collision and fix newPosition
			for(var i=0; i<this.platforms.length; i++){
				var platform = this.platforms[i];
				if(newPosition.y+this.mainCharacter.size.h>=platform.y && platform.y+platform.h>=newPosition.y){
					if(oldPosition.x<newPosition.x && oldPosition.x+this.mainCharacter.size.w<=platform.x && newPosition.x+this.mainCharacter.size.w>platform.x){//going right, check for collision on left side
						newPosition.x = platform.x-this.mainCharacter.size.w;//limit the move
						this.mainCharacter.speed.y -= this.gravity.y/2;//slide/climb the wall, reduce the gravity by half
					}else if(oldPosition.x>newPosition.x && oldPosition.x>=platform.x+platform.w && newPosition.x<platform.x+platform.w){//going left, check for collision on right side
						newPosition.x = platform.x+platform.w;//limit the move
						this.mainCharacter.speed.y -= this.gravity.y/2;//slide/climb the wall, reduce the gravity by half
					}
				}
				if(newPosition.x+this.mainCharacter.size.w>=platform.x && platform.x+platform.w>=newPosition.x){
					if(oldPosition.y<newPosition.y && oldPosition.y+this.mainCharacter.size.h<=platform.y && newPosition.y+this.mainCharacter.size.h>platform.y){//going down, check for collision on top side
						newPosition.y = platform.y-this.mainCharacter.size.h;//limit the move
						this.mainCharacter.speed.y = 0;
						this.mainCharacter.jumpAllowed = true;//is tanding on something: jump allowed
					}else if(oldPosition.y>newPosition.y && oldPosition.y>=platform.y+platform.h && newPosition.y<platform.y+platform.h){//going up, check for collision on bottom side
						newPosition.y = platform.y+platform.h;//limit the move
						this.mainCharacter.speed.y = 0;
					}
				}
			}
			//check for billboards and update speed
			for(var i=0; i<this.billboards.length; i++){
				var mainCharacterBoundingBox = { x:newPosition.x, y:newPosition.y, w:this.mainCharacter.size.w, h:this.mainCharacter.size.h };
				if(checkBoxBoxCollision(mainCharacterBoundingBox, this.billboards[i])){
					this.mainCharacter.speed.y -= this.gravity.y/2;
				}
			}
			//update mainCharacter.position
			this.mainCharacter.position.x = newPosition.x;
			this.mainCharacter.position.y = newPosition.y;
		};
		{//update camera
			var defaultZoom = 1.5;
			var mainCharacterSpeedVectorLength = Math.sqrt(this.mainCharacter.speed.x*this.mainCharacter.speed.x+this.mainCharacter.speed.y*this.mainCharacter.speed.y);
			this.mainCamera.differential.x = (7*this.mainCamera.differential.x+1*this.mainCharacter.speed.x)/8;
			this.mainCamera.differential.y = (7*this.mainCamera.differential.y+1*this.mainCharacter.speed.y)/8;
			this.mainCamera.zoomRatio = (3*(this.mainCamera.zoomRatio)+1*(defaultZoom-mainCharacterSpeedVectorLength/30))/4;
			this.mainCamera.position.x = 200-(this.mainCharacter.position.x-this.mainCharacter.size.w/2)*this.mainCamera.zoomRatio-5*this.mainCamera.differential.x;
			this.mainCamera.position.y = 720/2-(this.mainCharacter.position.y-this.mainCharacter.size.h/2)*this.mainCamera.zoomRatio-5*this.mainCamera.differential.y;
		}
		{//Check for coins
			for(var i=0; i<this.coins.length; i++){
				var mainCharacterBoundingBox = { x:newPosition.x, y:newPosition.y, w:this.mainCharacter.size.w, h:this.mainCharacter.size.h };
				var coinBoundingBox = { x:this.coins[i].x-this.coinWidth/2, y:this.coins[i].y-this.coinWidth/2, w:this.coinWidth, h:this.coinWidth };
				if(checkBoxBoxCollision(mainCharacterBoundingBox, coinBoundingBox)){
					this.coins.splice(i, 1);
					i--;
					this.mainCharacter.points++;
				}
			};
		}
		if(this.mainCharacter.position.y>1000){
			this.mainCharacter.lifes--;
			game.currentScene = gamePlayerDieScene;
		}
		if(this.mainCharacter.lifes<=0){
			game.currentScene = menuScene;
		}
	},
	render: function(gameContext){
		var backgroundImg = gameContext.images.background1c;
		var characterImg = gameContext.images.spritesheet;
		var canvas = gameContext.canvasContext;
		var rooftops = gameContext.images.background2;
		var coinImg = gameContext.images.coin;
		//draw background
		canvas.drawImage(rooftops, 0, 0);
		//move camera
		canvas.save();
		canvas.translate(this.mainCamera.position.x, this.mainCamera.position.y);
		canvas.scale(this.mainCamera.zoomRatio, this.mainCamera.zoomRatio);
		//Draw Ropes,Ladders,Pipes
		canvas.strokeStyle = "#00F";
		for(var i=0; i<this.ropes_ladders_pipes.length; i++){
			canvas.beginPath();
			canvas.moveTo(this.ropes_ladders_pipes[i].x0, this.ropes_ladders_pipes[i].y0);
			canvas.lineTo(this.ropes_ladders_pipes[i].x1, this.ropes_ladders_pipes[i].y1);
			canvas.closePath();
			canvas.stroke();
		};
		//Draw Platforms
		/*canvas.strokeStyle = "#F00";
		for(var i=0; i<this.platforms.length; i++){
			canvas.fillRect(this.platforms[i].x, this.platforms[i].y, this.platforms[i].w, this.platforms[i].h);
			canvas.beginPath();
			canvas.rect(this.platforms[i].x, this.platforms[i].y, this.platforms[i].w, this.platforms[i].h);
			canvas.closePath();
			canvas.stroke();
		};*/
		//canvas.drawImage(backgroundImg, 0, 0, 1280, backgroundImg.height, 0, 0, 1280, 720);
		canvas.drawImage(backgroundImg, 0, 0, backgroundImg.width, backgroundImg.height);
		//Draw coins
		for(var i=0; i<this.coins.length; i++){
			canvas.drawImage(coinImg, this.coins[i].x-this.coinWidth/2, this.coins[i].y-this.coinWidth/2, this.coinWidth, this.coinWidth);
		};
		//draw main character
		var offsetsX = [ 190, 590, 1070, 1570, 2012 ];
		var t = (new Date().getTime()/300)%offsetsX.length<<0;
		if(this.mainCharacter.speed.x==0){
			t = 0;
		}
		//canvas.fillStyle = "#FFF";
		//canvas.fillRect(this.mainCharacter.position.x, this.mainCharacter.position.y, this.mainCharacter.size.w, this.mainCharacter.size.h);//Draw character
		canvas.drawImage(characterImg, offsetsX[t], 140, 280, 500, this.mainCharacter.position.x, this.mainCharacter.position.y, this.mainCharacter.size.w, this.mainCharacter.size.h);//draw main character
		canvas.restore();
		
		for(var i=0; i<this.mainCharacter.lifes; i++){
			var healthp = Math.min(this.mainCharacter.lifes-i, 1);
			canvas.drawImage(game.images.hearth, 0, (1-healthp)*game.images.hearth.height, game.images.hearth.width, healthp*game.images.hearth.height, 10+i*35, 10+(1-healthp)*30, 30, healthp*30);
		}
	}
};
var gamePlayerDieScene = {
	t0: 0,
	dt: 0,
	processInput: function(gameContext, keyboard, mouse){
	},
	update: function(gameContext, deltaTime){
		var nt = new Date().getTime();
		this.dt = nt-this.t0;
		if(this.dt>5000){
			this.t0 = nt;
			this.dt = 0;
		}
		if(this.dt>3000){
			if(gameScene.mainCharacter.lifes>0){
				game.currentScene = gameScene;
			}else{
				game.currentScene = menuScene;
			}
		}
	},
	render: function(gameContext){
		var canvas = gameContext.canvasContext;
		if(this.dt<1000){
			//print the game in background
			gameScene.render(gameContext);
			//turn the game in the blackground darker by drawind a non-opaque black square on the canvas
			canvas.fillStyle = "rgba(0, 0, 0, "+((this.dt-0)/1000)+")";
			canvas.beginPath();
			canvas.rect(0, 0, 1280, 720);
			canvas.closePath();
			canvas.fill();
		}else{
			//
			canvas.fillStyle = "#000";
			canvas.beginPath();
			canvas.rect(0, 0, 1280, 720);
			canvas.closePath();
			canvas.fill();
			//draw the text inside the button
			canvas.textAlign = "center";
			canvas.textBaseline = "top";
			canvas.font = "bold 15px Arial";
			canvas.fillStyle = "#00F";
			var text = "";
			if(gameScene.mainCharacter.lifes>0){
				text = gameScene.mainCharacter.lifes + " lifes\nRestoring checkpoing(in the future)";
			}else{
				text = "GAME OVER";
			}
			canvas.fillText(text, 1280/2, 720/2);
		}
	}
}

var gunHand = {
	img: null,
	sound: "sound.mp3",
	fire: function(){
		
	}
}
var gunBat = {
	
}
var gunPistol = {
	
}
var gunSMG = {
	
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
	game.images.load("menubackground", "img/LOFMainMenu.png");
	game.images.load("coin", "img/1Real.png");
	game.images.load("bullet", "img/Glenos-G_160_bullet.png");
	game.images.load("hearth", "img/Health.svg");
	//set scene as loading image scene and start the loop
	game.currentScene = loadingScene;
	//game.currentScene = collisionTestScene;
	game.keepMainLoopRunning = true;//keep drawing
	game.mainLoop();
});


