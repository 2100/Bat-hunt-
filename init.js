var context;
var queue;
var WIDTH = 1024;
var HEIGHT = 768;
var mouseXPosition;
var mouseYPosition;
var batImage;
var stage;
var animation;
var deathAnimation;
var spriteSheet;
var enemyXPos=100;
var enemyYPos=100;
var enemyXSpeed = 1.5;
var enemyYSpeed = 1.75;
var score = 0;
var scoreText;
var gameTimer;
var gameTime = 0;
var timerText;

window.onload = function()
{
    /*
     *      Set up the Canvas with Size and height
     *
     */
    var canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];
    queue.loadManifest([
        {id: 'backgroundImage', src: 'assets/background.png'},
        {id: 'crossHair', src: 'assets/crosshair.png'},
        {id: 'shot', src: 'assets/shot.mp3'},
        {id: 'background', src: 'assets/countryside.mp3'},
        {id: 'gameOverSound', src: 'assets/gameOver.mp3'},
        {id: 'tick', src: 'assets/tick.mp3'},
        {id: 'deathSound', src: 'assets/die.mp3'},
        {id: 'batSpritesheet', src: 'assets/batSpritesheet.png'},
        {id: 'batDeath', src: 'assets/batDeath.png'},
    ]);
    queue.load();

    /*
     *      Create a timer that updates once per second
     *
     */
    gameTimer = setInterval(updateTime, 1000);

}

function queueLoaded(event)
{
    // Add background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"))
    stage.addChild(backgroundImage);

    //Add Score
    scoreText = new createjs.Text("1UP: " + score.toString(), "36px Arial", "#FFF");
    scoreText.x = 10;
    scoreText.y = 10;
    stage.addChild(scoreText);

    //Ad Timer
    timerText = new createjs.Text("Time: " + gameTime.toString(), "36px Arial", "#FFF");
    timerText.x = 800;
    timerText.y = 10;
    stage.addChild(timerText);

    // Play background sound
    createjs.Sound.play("background", {loop: -1});

    // Create bat spritesheet
    spriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('batSpritesheet')],
        "frames": {"width": 198, "height": 117},
        "animations": { "flap": [0,4] }
    });

    // Create bat death spritesheet
    batDeathSpriteSheet = new createjs.SpriteSheet({
    	"images": [queue.getResult('batDeath')],
    	"frames": {"width": 198, "height" : 148},
    	"animations": {"die": [0,7, false,1 ] }
    });

    // Create bat sprite
    createEnemy();


    // Add ticker
    createjs.Ticker.setFPS(15);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tickEvent);

    window.onmousedown = handleMouseDown;
}

function createEnemy()
{
	animation = new createjs.Sprite(spriteSheet, "flap");
    animation.regX = 99;
    animation.regY = 58;
    animation.x = enemyXPos;
    animation.y = enemyYPos;
    animation.gotoAndPlay("flap");
    stage.addChildAt(animation,1);
}

function batDeath()
{
  deathAnimation = new createjs.Sprite(batDeathSpriteSheet, "die");
  deathAnimation.regX = 99;
  deathAnimation.regY = 58;
  deathAnimation.x = enemyXPos;
  deathAnimation.y = enemyYPos;
  deathAnimation.gotoAndPlay("die");
  stage.addChild(deathAnimation);
}

function tickEvent()
{

	if(enemyXPos < WIDTH && enemyXPos > 0)
	{
		enemyXPos += enemyXSpeed;
	} else 
	{
		enemyXSpeed = enemyXSpeed * (-1);
		enemyXPos += enemyXSpeed;
	}
	if(enemyYPos < HEIGHT && enemyYPos > 0)
	{
		enemyYPos += enemyYSpeed;
	} else
	{
		enemyYSpeed = enemyYSpeed * (-1);
		enemyYPos += enemyYSpeed;
	}

	animation.x = enemyXPos;
	animation.y = enemyYPos;

	
}



function handleMouseDown(event)
{
    
    //Display CrossHair
    crossHair = new createjs.Bitmap(queue.getResult("crossHair"));
    crossHair.x = event.clientX-45;
    crossHair.y = event.clientY-45;
    stage.addChild(crossHair);
    createjs.Tween.get(crossHair).to({alpha: 0},1000);
    
    //Play the gunshot
    createjs.Sound.play("shot");

    //augment la vitesse du bat kol shewya 
    enemyXSpeed *= 1.05;
    enemyYSpeed *= 1.06;

    //get the Shot position
    var shotX = Math.round(event.clientX);
    var shotY = Math.round(event.clientY);
    var spriteX = Math.round(animation.x);
    var spriteY = Math.round(animation.y);

    //calcul X et Y comme distance
    var distX = Math.abs(shotX - spriteX);
    var distY = Math.abs(shotY - spriteY);

    //if i shot anywhere in the bat body , dead ... 
    if(distX < 30 && distY < 59 )
    {
    	
    	stage.removeChild(animation);
    	batDeath();
    	score += 100;
    	scoreText.text = "1UP: " + score.toString();
    	createjs.Sound.play("deathSound");
    	
        //make it harder every time 
    	enemyYSpeed *= 1.25;
    	enemyXSpeed *= 1.3;

    	//make a new enemy
    	var timeToCreate = Math.floor((Math.random()*3500)+1);
	    setTimeout(createEnemy,timeToCreate);

    } else
    {
    	
    	score -= 10;
    	scoreText.text = "1UP: " + score.toString();

    }
}
// update time
function updateTime()
{
	gameTime += 1;
	if(gameTime > 60)
	{
		//End Game 
		timerText.text = "GAME OVER";
		stage.removeChild(animation);
		stage.removeChild(crossHair);
        createjs.Sound.removeSound("background");
        var si =createjs.Sound.play("gameOverSound");
		clearInterval(gameTimer);
	}
	else
	{
		timerText.text = "Time: " + gameTime
    createjs.Sound.play("tick");
	}
}
