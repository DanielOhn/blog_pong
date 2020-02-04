const canvas = document.getElementById('mycanvas');

const app = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
	resolution: window.devicePixelRatio,
	autoDensity: true
});

// Below App Function
let loader = PIXI.Loader.shared;
let player, enemy, ball, playerScore, enemyScore;
let floors = [];
let walls = [];

// Loading in all the images we need for the game
loader
  .add('bar', 'images/bar.png')
  .add('ball', 'images/ball.png')
  .add('wall', 'images/wall.png')
  .load(setup);

let up = keyboard('w');
let down = keyboard('s');

function setup() {
  // Loading each texture
  let bar_texture = loader.resources.bar.texture;
  let ball_texture = loader.resources.ball.texture;
  let wall_texture = loader.resources.wall.texture;

  let stage = new PIXI.Container();
  app.stage.addChild(stage);

  stage.x = app.screen.width / 2;
  stage.y = app.screen.height / 2;

  // Adding Player and Enemy Sprites
  player = new PIXI.Sprite(bar_texture);
  stage.addChild(player);

  player.x = -300;
  player.anchor.set(.5);

  enemy = new PIXI.Sprite(bar_texture);
  stage.addChild(enemy);

  enemy.x = 300;
  enemy.anchor.set(.5);

  // Adding the ball
  ball = new PIXI.Sprite(ball_texture);
  stage.addChild(ball);

  ball.x = 0;
  ball.anchor.set(.5);

  // Setting up the walls
  for (let i = 0; i < 75; i++) {
  	let new_wall = new PIXI.Sprite(wall_texture);
  	let new_floor = new PIXI.Sprite(wall_texture);

    walls.push(new_wall);
    stage.addChild(walls[i]);

    walls[i].y = -200;
    walls[i].x = -300 + i * 8;

    walls[i].anchor.set(.5);

    floors.push(new_floor);
    stage.addChild(floors[i]);

    floors[i].y = 200;
    floors[i].x = -300 + i * 8;
    floors[i].anchor.set(.5);
  }

  // Direction of ball and players
  ball.vx = 1;
  ball.vy = 1;

  player.vy = 0;
  enemy.vy = 0;

  // Setting Up Score

  // Size, Color, and Font of the text we are adding
  const style = new PIXI.TextStyle({
  	fontFamily: 'Roboto',
  	fill: ['#ffffff'],
  	fontSize: 32,
  });

  // Adding Score to our Player and Enemy Object
  player.score = 0;
  enemy.score = 0;

  // Creating the actual Text for the scores.
  playerScore = new PIXI.Text(player.score, style);
  enemyScore = new PIXI.Text(enemy.score, style);

  stage.addChild(playerScore);
  stage.addChild(enemyScore);

  playerScore.x = -275;
  playerScore.y = -250;

  enemyScore.x = 250;
  enemyScore.y = -250;

  up.press = () => {
  	player.vy = -1;
  };

  up.release = () => {
  	player.vy = 0;
  };

  down.press = () => {
  	player.vy = 1;
  };

  down.release = () => {
  	player.vy = 0;
  };

  app.ticker.add(delta => game(delta));
}

// Reseting the ball in the center and changes direction 
function ball_reset() {
  ball.x = 0;
  ball.y = 0;
  ball.vy = ball.vy * -1;
  ball.vx = ball.vx * -1;
}

function game(delta) {
	let speed = 3 * delta;
	let ball_speed = 5 * delta;

  if (ball.x > 325) {
	  ball_reset();
	  player.score++;
	  playerScore.text = player.score;
  } else if (ball.x < -325) {
	  ball_reset();
	  enemy.score++;
	  enemyScore.text = enemy.score;
  }

	if (ball.y > enemy.y) {
		enemy.vy = 1;
	} else if (ball.y < enemy.y) {
		enemy.vy = -1;
	} else {
		enemy.vy = 0;
	}

	// Check Collision of Walls
  for (let wall of walls) {
    if (check_collid(player, wall)) {
      if (player.vy < 0) {
        player.vy = 0;
      }
    }

    if (check_collid(enemy, wall)) {
      if (enemy.vy < 0) {
        enemy.vy = 0;
      }
    }

    if (check_collid(ball, wall)) {
      ball.vy = 1;
    }
  }

  for (let floor of floors) {
    if (check_collid(player, floor)) {
      if (player.vy > 0) {
        player.vy = 0;
      }
    }

    if (check_collid(enemy, floor)) {
      if (enemy.vy > 0) {
        enemy.vy = 0;
      }
    }

    if (check_collid(ball, floor)) {
      ball.vy = -1;
    }
  }

  // Check Collision of Ball with Player + Enemy
  if (check_collid(ball, enemy) || check_collid(ball, player)) {
    ball.vx *= -1;
  }

  // Movement for ball and players
  ball.x += ball.vx * ball_speed;
  ball.y += ball.vy * ball_speed;

  player.y += player.vy * speed;
  enemy.y += enemy.vy * speed;
}

function check_collid(r1, r2) {
  // Define variables we'll use to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  // hit will determine whether there's a collision
  hit = false;

  // Find the center points of each sprite
  r1.centerX = r1.x;
  r1.centerY = r1.y;

  r2.centerX = r2.x;
  r2.centerY = r2.y;

  // Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  // Calculate the distance vectors between sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  // Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  // Check collision on x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    // A collisoin might be occuring.  Check for it on y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      // There's definitely a collision happening
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }

  return hit;
}

function keyboard(value) {
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downHandler = event => {
    if (event.key === key.value) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  key.upHandler = event => {
    if (event.key === key.value) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  // Attach Event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);

  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);

  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };

  return key;
};