
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let groundImg;
let highScore = 0;

//bird
let birdWidth = 44; //width/height ratio = 408/228 = 17/12
let birdHeight = 49;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;
let imgIndex = 1;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.9;

let gameOver = false;
let score = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./birdAnim/bird1.gif";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    groundImg = new Image();
    groundImg.src = "./ground.jpg";
    groundImg.onload = function () {
        context.drawImage(groundImg, bird.x, 500, 360, bird.height);
    }


    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1350); //every 1.5 seconds
    setInterval(changeBirdImg, 100); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBirdForMobile);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    context.drawImage(groundImg, 0, 575, 360, 78);


    if (bird.y > board.height - 115) {
        gameOver = true;
    }


    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", boardWidth / 2 - 120, boardHeight / 2 - 100, 250);
        context.font = `30px Verdana`;
        context.fillText("Your score: " + score, boardWidth / 2 - 90, boardHeight / 2 - 50, 250,);
        let highScore = localStorage.getItem("HighScore");
        if (localStorage.getItem("HighScore")) {
            if (score > highScore) {
                localStorage.setItem("HighScore", score);
                context.fillStyle = "Blue";
                context.fillText("High Score: " + score, boardWidth / 2 - 95, boardHeight / 2 - 10, 250);
                context.font = "15px Verdana";
                context.fillText("New High Score!!", boardWidth / 2 - 60, boardHeight / 2 + 20, 250);
            } else {
                context.fillText("High Score: " + highScore, boardWidth / 2 - 95, boardHeight / 2 - 10, 250,);
            }
        } else {
            localStorage.setItem("HighScore", score);
        }

    }
}

function changeBirdImg() {
    if (!gameOver) {
        birdImg.src = `./birdAnim/bird${imgIndex}.gif`;
        imgIndex++;
        if (imgIndex > 3) {
            imgIndex = 1;
        }
    }
}
function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "TouchEvent" || e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -10;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function moveBirdForMobile(e) {
    e.preventDefault();
    //jump
    velocityY = -10;

    //reset game
    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
    }
}


function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}