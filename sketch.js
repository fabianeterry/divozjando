



let fondo; // Variable global para el fondo
let mic; // Objeto para manejar la entrada de audio
let fft; // Objeto para manejar el análisis de la frecuencia
let pincel; // Variable para la imagen del pincel
let positions = []; // Arreglo para almacenar posiciones aleatorias de las imágenes
let colorChangePosition = 0; // Posición para cambiar el color de las imágenes

function preload() {
  pincel = loadImage('data/pincel.png'); // Cargar la imagen del pincel desde la carpeta data
}

function setup() {
  createCanvas(345, 457); // Tamaño del lienzo (ajustado según tus especificaciones)
  fondo = new Fondo(); // Inicializar el fondo

  mic = new p5.AudioIn(); // Crear objeto de entrada de audio
  mic.start(); // Iniciar la captura de audio

  fft = new p5.FFT(); // Crear objeto para el análisis de la frecuencia
  fft.setInput(mic); // Conectar el análisis de la frecuencia con la entrada del micrófono

  generateRandomPositions(); // Generar posiciones aleatorias
}

function draw() {
  background(255); // Fondo blanco para cada frame
  fondo.update(); // Actualizar el fondo
  fondo.draw(); // Dibujar el fondo
  let micLevel = mic.getLevel(); // Obtener el nivel de audio actual
  let mappedVibration = map(micLevel, 0, 0.1, 0, 10); // Ajustar mapeo para mayor amplitud de vibración
  colorChangePosition = map(micLevel, 0, 0.1, 0, height); // Mapear el nivel de amplitud a una posición en el lienzo
  drawFlowerCycles(mappedVibration); // Dibujar ciclos de flores con amplitud controlada
  checkMicInput(); // Comprobar la entrada del micrófono
}

// Función para generar posiciones aleatorias
function generateRandomPositions() {
  let margin = 10; // Margen del borde y espacio entre las imágenes
  let imgWidth = pincel.width;
  let imgHeight = pincel.height;

  // Limpiar el arreglo de posiciones
  positions = [];

  // Generar posiciones aleatorias dentro del lienzo
  for (let i = 0; i < 400; i++) {
    let x, y;
    let overlapping;

    do {
      x = random(margin, width - imgWidth - margin);
      y = random(margin, height - imgHeight - margin);
      overlapping = positions.some(pos => dist(x, y, pos.x, pos.y) < imgWidth + margin);
    } while (overlapping);

    let colored = random(1) < 0.1; // 10% de probabilidad de ser coloreada
    positions.push({ x: x, y: y, colored: colored });
  }
}

// Función para dibujar ciclos de flores
function drawFlowerCycles(mappedVibration) {
  positions.forEach(pos => {
    let jitterX = random(-mappedVibration, mappedVibration);
    let jitterY = random(-mappedVibration, mappedVibration);
    if (pos.y < colorChangePosition) {
      tint(255, 182, 193); // Tono rosa claro
    } else {
      noTint(); // Sin tinte
    }
    image(pincel, pos.x + jitterX, pos.y + jitterY);
  });
}

// Función para manejar la entrada de audio
function checkMicInput() {
  let spectrum = fft.analyze(); // Analizar el espectro de frecuencias
  let trebleEnergy = fft.getEnergy("treble"); // Obtener la energía de las frecuencias altas
  let bassEnergy = fft.getEnergy("bass"); // Obtener la energía de las frecuencias bajas
  let midEnergy = fft.getEnergy("mid"); // Obtener la energía de las frecuencias medias

  // Manejar los controles por separado
  handleBassEnergy(bassEnergy);
  handleTrebleEnergy(trebleEnergy);
  handleMidEnergy(midEnergy); // Nuevo manejo para frecuencias medias
}

// Función para manejar la energía de los bajos
function handleBassEnergy(bassEnergy) {
  // Ajustar el mapeo para mayor sensibilidad
  let mappedVibration = map(bassEnergy, 0, 255, 0, 10); // Reducir el rango de entrada para mayor sensibilidad

  if (bassEnergy > 150) { // Umbral para activar la vibración, ajustado a 150 para mayor sensibilidad
    activateVibration(mappedVibration);
  } else {
    deactivateVibration();
  }
}

// Función para manejar la energía de los agudos
function handleTrebleEnergy(trebleEnergy) {
  // Ajustar el mapeo para mayor sensibilidad
  let mappedSpeed = map(trebleEnergy, 0, 255, 0.01, 0.1); // Mapear la frecuencia a un rango adecuado para la velocidad del degradado

  if (trebleEnergy > 150) { // Umbral para activar el cambio de degradado, ajustado a 150 para mayor sensibilidad
    fondo.changeGradient();
    fondo.setMappedSpeed(mappedSpeed); // Ajustar la velocidad del degradado
  } else {
    fondo.setMappedSpeed(0.01); // Resetear la velocidad del degradado a su valor por defecto
  }
}

// Función para manejar la energía de las frecuencias medias
function handleMidEnergy(midEnergy) {
  if (midEnergy > 150) { // Umbral para activar el cambio de color
    fondo.changeGradient(); // Cambiar el color del degradado
  }
}

// Activar vibración de los óvalos
function activateVibration(mappedVibration) {
  // Puedes implementar aquí alguna acción específica si se activa la vibración de los óvalos
}

// Desactivar vibración de los óvalos
function deactivateVibration() {
  // Puedes implementar aquí alguna acción específica si se desactiva la vibración de los óvalos
}

class Fondo {
  constructor() {
    this.offset = 0; // Offset para animar el degradado
    this.speed = 0.01; // Velocidad del cambio del degradado
    this.redGradient = true; // Control para el color de inicio del degradado
    this.moveUp = false; // Indicador para mover el degradado hacia arriba
    this.mappedSpeed = 0.01; // Velocidad mapeada basada en la amplitud del sonido
  }

  update() {
    // Mueve el degradado hacia arriba según el indicador
    if (this.moveUp) {
      this.offset -= this.mappedSpeed;
    }

    // Ajusta el offset para mantener el bucle continuo
    if (this.offset > 1) {
      this.offset = 0;
    } else if (this.offset < 0) {
      this.offset = 1;
    }
  }

  draw() {
    if (this.redGradient) {
      this.drawGradient(color(148, 2, 25), color(255, 230, 230)); // Rojo fuerte a rosa pastel
    } else {
      this.drawGradient(color(255, 230, 230), color(148, 2, 25)); // Rosa pastel a rojo fuerte
    }
  }

  drawGradient(startColor, endColor) {
    noStroke();
    for (let y = 0; y < height; y++) {
      let inter = map(y + this.offset * height, 0, height, 0, 1); // Ajuste para un degradado normal
      let c = lerpColor(startColor, endColor, inter);
      fill(c);
      rect(0, y, width, 1);
    }
  }

  setMoveUp(state) {
    this.moveUp = state;
  }

  setMappedSpeed(speed) {
    this.mappedSpeed = speed;
  }

  changeGradient() {
    this.redGradient = !this.redGradient;
  }
}

