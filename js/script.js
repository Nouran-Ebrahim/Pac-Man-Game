
var correctImg = '<div class="showAnswerTickMark showAns"><img src="assets/images/tikMark.png" /></div>';
var incorrectImg = '<div class="showAnswerCrossMark showAns"><img src="assets/images/crossMark.png" /></div>';
var $corr = $("#corr");
var $incorr = $("#incorr");
var lastAudio = 0;
//  generate canvas
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 460;
canvas.height = 520;

var words = []     //empty array to push object of words
const comp = document.getElementsByClassName('compelete'); // add class with correct answer
const lifeEl = document.querySelectorAll('.heart');
var arr = 0;      // to arrange the sentence 

class Boundary {
  static width = 40;
  static height = 40;
  constructor({ position, image }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.start = 0.2;
    this.end = 2 * Math.PI - 0.2;
    this.openRate = 0.11;
    this.rotation = 0; // to rotate player according to keys
    this.life = 3;
  }

  draw() {
    c.save();
    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x, -this.position.y);
    c.beginPath();
    c.arc(
      this.position.x,
      this.position.y,
      this.radius,
      this.start,
      this.end
    );
    c.lineTo(this.position.x, this.position.y);
    c.fillStyle = "yellow";
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.start < 0 || this.start > 0.75) this.openRate = -this.openRate;

    this.start += this.openRate;
    this.end -= this.openRate;
  }
}

class Ghost {
  static speed = 1.5;
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color;
    this.prevCollisions = [];
    this.speed = 1.5;
    this.scared = false;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.scared ? "blue" : this.color;
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Pellet {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "white";
    c.fill();
    c.closePath();
  }
}

//make player scared
class PowerUp {
  constructor({ position }) {
    this.position = position;
    this.radius = 8;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "white";
    c.fill();
    c.closePath();
  }
}

class Word {
  constructor({ position, word }) {
    this.position = position
    this.radius = 5
    this.word = word
  }
  draw() {
    c.font = "20px Comic Sans MS";
    c.fillStyle = "white";
    c.textAlign = "center";
    c.fillText(this.word, this.position.x + 20, this.position.y + 25)
  }
}

const pellets = [];
const boundaries = [];
const powerUps = [];

const ghosts = [
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height * 3 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: "pink",
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height * 9 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: "green",
  }),

];

const player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});

const keys = {
  ArrowUp: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowDown: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

let lastKey = "";

// drow the boundries and put words randomly
const array = ['w1', 'w2', 'w3', 'w4'];
const shuffledArray = array.sort((a, b) => 0.5 - Math.random()); // make words random
const map = [
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
  ["|", "", ".", ".", ".", shuffledArray[0], ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
  ["|", ".", shuffledArray[1], ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", shuffledArray[3], ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", shuffledArray[2], ".", ".", ".", "p", "|"],
  ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "3"],
];


function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeHorizontal.png"),
          })
        );
        break;
      case "|":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeVertical.png"),
          })
        );
        break;
      case "1":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner1.png"),
          })
        );
        break;
      case "2":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner2.png"),
          })
        );
        break;
      case "3":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner3.png"),
          })
        );
        break;
      case "4":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner4.png"),
          })
        );
        break;
      case "b":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/block.png"),
          })
        );
        break;
      case "[":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capLeft.png"),
          })
        );
        break;
      case "]":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capRight.png"),
          })
        );
        break;
      case "_":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capBottom.png"),
          })
        );
        break;
      case "^":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capTop.png"),
          })
        );
        break;
      case "+":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeCross.png"),
          })
        );
        break;
      case "5":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorTop.png"),
          })
        );
        break;
      case "6":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorRight.png"),
          })
        );
        break;
      case "7":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorBottom.png"),
          })
        );
        break;
      case "8":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeConnectorLeft.png"),
          })
        );
        break;
      case ".":
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
          })
        );
        break;

      case "p":
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
          })
        );
        break;
      case 'w1':
        words.push(
          new Word({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            word: "this"
          })
        )
        break
      case 'w2':
        words.push(

          new Word({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            word: "is"
          })
        )
        break
      case 'w3':
        words.push(
          new Word({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            word: "my"
          })
        )
        break
      case 'w4':
        words.push(
          new Word({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            word: "sister"
          })
        )
        break
    }
  });
});

// function to protect the player from collision
function circleCollidesWithRectangle2({ circle, rectangle }) {
  return (
    circle.position.y - circle.radius + circle.velocity.y <=
    rectangle.position.y + rectangle.height &&
    circle.position.x + circle.radius + circle.velocity.x >=
    rectangle.position.x &&
    circle.position.y + circle.radius + circle.velocity.y >=
    rectangle.position.y &&
    circle.position.x - circle.radius + circle.velocity.x <=
    rectangle.position.x + rectangle.width
  );
}
// function to protect the ghosts from collision
function circleCollidesWithRectangle({ circle, rectangle }) {
  const padding = Boundary.width / 2 - circle.radius - 1;
  return (
    circle.position.y - circle.radius + circle.velocity.y <=
    rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >=
    rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >=
    rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <=
    rectangle.position.x + rectangle.width + padding
  );
}

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  document.querySelector('.titleImg').style.display = 'block'
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.ArrowUp.pressed && lastKey === "ArrowUp") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle2({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: -2,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -2;
      }
    }
  } else if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle2({
          circle: {
            ...player,
            velocity: {
              x: -2,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -2;
      }
    }
  } else if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle2({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: 2,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = 2;

      }
    }
  } else if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle2({
          circle: {
            ...player,
            velocity: {
              x: 2,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = 2;
      }
    }
  }

  // detect collision between ghosts and player
  for (let i = ghosts.length - 1; 0 <= i; i--) {
    const ghost = ghosts[i];
    // ghost touches player
    if (
      Math.hypot(
        ghost.position.x - player.position.x,
        ghost.position.y - player.position.y
      ) <
      ghost.radius + player.radius
    ) {
      if (ghost.scared) {
        ghosts.splice(i, 1);
      } else {
// add player in random places in the map
        const motions = [{ x: 3, y: 6 }, { x: 6, y: 3 }, { x: 6, y: 9 }, { x: 9, y: 6 }, { x: 1, y: 11 }, { x: 5, y: 4 }, { x: 7, y: 10 }]
        var motionIndex = Math.floor(Math.random() * motions.length)
        var obj = motions[motionIndex]
        player.life-- // decrease life when player attacked
        lifeEl[player.life].style.visibility = "hidden"
        player.position.x = Boundary.width * obj.x + Boundary.width / 2
        player.position.y = Boundary.height * obj.y + Boundary.height / 2

        if (player.life === 0) {
          document.querySelector('#lose-img').classList.add("yp-animate")
          document.querySelector('#lose-img').classList.remove("yp-u-hide")
          document.querySelector('#feed').classList.remove("yp-u-hide")
          cancelAnimationFrame(animationId); //stop the game when losing
        }
      }
    }
  }

  // win the game
  if (comp.length === $('.ans').length) {
    cancelAnimationFrame(animationId);
    document.querySelector('#win-img').classList.add("yp-animate")
    document.querySelector('#feed').classList.remove("yp-u-hide")
    document.querySelector('#win-img').classList.remove("yp-u-hide")
  }

  // power ups go
  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i];
    powerUp.draw();

    // player collides with powerup
    if (
      Math.hypot(
        powerUp.position.x - player.position.x,
        powerUp.position.y - player.position.y
      ) <
      powerUp.radius + player.radius
    ) {
      powerUps.splice(i, 1);
      // make ghosts scared
      ghosts.forEach((ghost) => {
        ghost.scared = true;

        setTimeout(() => {
          ghost.scared = false;
        }, 10000);
      });
    }
  }

  //  remove the correct word from the array and check the arrange 
  words.forEach((word, i) => {
    word.draw()
    if (Math.hypot(
      word.position.x + 20 - player.position.x,
      word.position.y + 25 - player.position.y
    ) <
      word.radius + player.radius) {
      if ($(`#${word.word}`).attr("data-ans") == arr) {
        $(`#${word.word}`).text(`${word.word}`)
        $(`#${word.word}`).addClass('compelete')
        $(`#${word.word}`).addClass('dis')
        words.splice(i, 1)
        arr++
        $corr[0].play()
      }
      else {
        $incorr[0].play()
      }
    }
  })


  // touch pellets here
  for (let i = pellets.length - 1; 0 <= i; i--) {
    const pellet = pellets[i];
    pellet.draw();

    if (
      Math.hypot(
        pellet.position.x - player.position.x,
        pellet.position.y - player.position.y
      ) <
      pellet.radius + player.radius
    ) {
      pellets.splice(i, 1);
    }
  }

  boundaries.forEach((boundary) => {
    boundary.draw();

    if (
      circleCollidesWithRectangle2({
        circle: player,
        rectangle: boundary,
      })
    ) {
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  });
  player.update();
  player.velocity.x = 0;
  player.velocity.y = 0;

  // make freedom motion to the ghosts
  ghosts.forEach((ghost) => {
    ghost.update();

    const collisions = [];
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes("right") &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: ghost.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("right");
      }

      if (
        !collisions.includes("left") &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: -ghost.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("left");
      }

      if (
        !collisions.includes("up") &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: -ghost.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("up");
      }

      if (
        !collisions.includes("down") &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: ghost.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("down");
      }
    });

    if (collisions.length > ghost.prevCollisions.length)
      ghost.prevCollisions = collisions;

    if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {

      if (ghost.velocity.x > 0) ghost.prevCollisions.push("right");
      else if (ghost.velocity.x < 0) ghost.prevCollisions.push("left");
      else if (ghost.velocity.y < 0) ghost.prevCollisions.push("up");
      else if (ghost.velocity.y > 0) ghost.prevCollisions.push("down");

      const pathways = ghost.prevCollisions.filter((collision) => {
        return !collisions.includes(collision);
      });

      const direction = pathways[Math.floor(Math.random() * pathways.length)];
      switch (direction) {
        case "down":
          ghost.velocity.y = ghost.speed;
          ghost.velocity.x = 0;
          break;

        case "up":
          ghost.velocity.y = -ghost.speed;
          ghost.velocity.x = 0;
          break;

        case "right":
          ghost.velocity.y = 0;
          ghost.velocity.x = ghost.speed;
          break;

        case "left":
          ghost.velocity.y = 0;
          ghost.velocity.x = -ghost.speed;
          break;
      }

      ghost.prevCollisions = [];
    }
  });

} // end of animate()
//function to start the game
function go() {
  setTimeout(() => {
    animate();
    document.querySelector('.words').style.display = 'flex'
    document.querySelector('.cd-wrapper').style.display = 'none'
    document.querySelector('.canv').style.display = 'block'
    document.querySelector('.bg-canva').style.display = 'block'
    document.querySelector('.name').style.display = 'none'
  }, 4000);
}

function start() {
  document.querySelector('.cd-wrapper').style.display = 'block'
  document.querySelector('.bg-canva').style.display = 'none'
  document.querySelector('.start-btn').style.display = 'none'
  document.querySelector('.name').style.display = 'none'
  go()
}

function fnReloadAll() {
  window.location.reload()
}

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "ArrowUp":
      keys.ArrowUp.pressed = true;
      //  to rotate mouse of player up
      player.rotation = Math.PI * 1.5
      lastKey = "ArrowUp";
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      //  to rotate mouse of player left
      player.rotation = Math.PI;
      lastKey = "ArrowLeft";
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = true;
      //  to rotate mouse of player down
      player.rotation = Math.PI / 2;
      lastKey = "ArrowDown";
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true;

      player.rotation = 0;
      lastKey = "ArrowRight";
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "ArrowUp":
      keys.ArrowUp.pressed = false;

      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;

      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = false;

      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;

      break;
  }
});
