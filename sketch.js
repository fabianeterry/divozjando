let fondo;
let grilla;

class Fondo {
    constructor() {
        this.offset = 0; // Offset para animar el degradado
        this.speed = 0.01; // Velocidad del cambio del degradado
        this.redGradient = true; // Control para el color de inicio del degradado (rojo/rosa)
        this.moveUp = false; // Indicador para mover el degradado hacia arriba
        this.moveDown = false; // Indicador para mover el degradado hacia abajo
    }

    update() {
        if (this.moveUp) {
            this.offset -= this.speed;
        } else if (this.moveDown) {
            this.offset += this.speed;
        }

        if (this.offset > 1) {
            this.offset = 0;
        } else if (this.offset < 0) {
            this.offset = 1;
        }
    }

    draw() {
        if (this.redGradient) {
            this.drawGradient(color(152, 1, 20), color(255, 204, 204));
        } else {
            this.drawGradient(color(255, 204, 204), color(152, 1, 20));
        }
    }

    drawGradient(startColor, endColor) {
        for (let y = 0; y < height; y++) {
            let inter = map(y + this.offset * height, 0, height, 0, 1);
            let c = lerpColor(startColor, endColor, inter);
            stroke(c);
            line(0, y, width, y);
        }
    }

    toggleColor() {
        this.redGradient = !this.redGradient;
    }

    setMoveUp(state) {
        this.moveUp = state;
    }

    setMoveDown(state) {
        this.moveDown = state;
    }
}

class Grilla {
    constructor(imagePath) {
        this.img = loadImage(imagePath);
        this.imgScale = 1.0;
        this.rotationAngle = 0;
    }

    draw() {
        let scaledWidth = this.img.width * this.imgScale;
        let scaledHeight = this.img.height * this.imgScale;
        push();
        translate(width / 2, height / 2);
        rotate(this.rotationAngle);
        image(this.img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        pop();
    }

    scaleUp() {
        this.imgScale *= 1.1;
    }

    scaleDown() {
        this.imgScale *= 0.9;
    }

    rotateLeft() {
        this.rotationAngle -= radians(10);
    }

    rotateRight() {
        this.rotationAngle += radians(10);
    }
}

function setup() {
    createCanvas(345, 457);
    fondo = new Fondo();
    grilla = new Grilla('data/grilla.png');
}

function draw() {
    fondo.update();
    fondo.draw();
    grilla.draw();
}

function keyPressed() {
    if (key == 'c' || key == 'C') {
        fondo.toggleColor();
    } else if (key == 'w' || key == 'W') {
        grilla.scaleUp();
    } else if (key == 's' || key == 'S') {
        grilla.scaleDown();
    } else if (key == 'a' || key == 'A') {
        grilla.rotateLeft();
    } else if (key == 'd' || key == 'D') {
        grilla.rotateRight();
    } else if (key == 'u' || key == 'U') {
        fondo.setMoveUp(true);
    } else if (key == 'j' || key == 'J') {
        fondo.setMoveDown(true);
    }
}

function keyReleased() {
    if (key == 'u' || key == 'U') {
        fondo.setMoveUp(false);
    } else if (key == 'j' || key == 'J') {
        fondo.setMoveDown(false);
    }
}