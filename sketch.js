// Clase para manejar el fondo con un degradado que se mueve
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
      this.drawGradient(color(148, 2, 25), color(220, 149, 140)); // Rojo fuerte a rosa pastel
    } else {
      this.drawGradient(color(220, 149, 140), color(148, 2, 25)); // Rosa pastel a rojo fuerte
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

// Clase para manejar los óvalos que pueden vibrar
class Oval {
  constructor(x, y, isPink = false) {
    this.x = x;
    this.y = y;
    this.vibrate = false; // Añadimos una propiedad para la vibración
    this.isPink = isPink; // Propiedad para determinar si es rosa claro
    this.color = isPink ? color(255, 182, 193, 128) : color(200, 200, 200, 128); // Rosa claro transparente o gris medio transparente
    this.vibrationAmplitude = 0; // Amplitud de la vibración basada en la amplitud del sonido
  }

  draw() {
    noFill();
    
    let vx = this.vibrate ? random(-this.vibrationAmplitude, this.vibrationAmplitude) : 0; // Amplitud de la vibración
    let vy = this.vibrate ? random(-this.vibrationAmplitude, this.vibrationAmplitude) : 0; // Amplitud de la vibración
    ellipse(this.x + vx, this.y + vy, 7, 10);
    fill(this.color);
    noStroke();
    ellipse(this.x + vx, this.y + vy, 7, 10);
  }

  changeColor(newColor) {
    this.color = newColor;
  }

  setVibrationAmplitude(amplitude) {
    this.vibrationAmplitude = amplitude;
  }
}

let fondo; // Variable global para el fondo
let ovals = []; // Array de óvalos
let mic; // Objeto para manejar la entrada de audio
let fft; // Objeto para manejar el análisis de la frecuencia
let bassHighDuration = 0; // Duración de alta energía de bajos
let bassHighThreshold = 100; // Umbral para considerar que la energía de bajos es alta
let bassHighTime = 60; // Tiempo que debe mantenerse la energía de bajos alta para cambiar el color (en frames)

function setup() {
  createCanvas(345, 457); // Tamaño del lienzo
  fondo = new Fondo(); // Inicializar el fondo
  populateOvals(); // Llenar el canvas con óvalos

  mic = new p5.AudioIn(); // Crear objeto de entrada de audio
  mic.start(); // Iniciar la captura de audio

  fft = new p5.FFT(); // Crear objeto para el análisis de la frecuencia
  fft.setInput(mic); // Conectar el análisis de la frecuencia con la entrada del micrófono
}

function draw() {
  fondo.update(); // Actualizar el fondo
  fondo.draw(); // Dibujar el fondo
  drawOvals(); // Dibujar los óvalos
  checkMicInput(); // Comprobar la entrada del micrófono
}

// Función para dibujar los óvalos
function drawOvals() {
  for (let i = 0; i < ovals.length; i++) {
    ovals[i].draw();
  }
}

// Función para llenar el canvas con óvalos
function populateOvals() {
  let numOvals = 65000;
  let margin = 15;
  let maxAttempts = 6000; // Limitar el número de intentos para evitar bucles infinitos
  let attempts = 0;

  while (ovals.length < numOvals && attempts < maxAttempts) {
    let x = random(margin, width - margin);
    let y = random(margin, height - margin);
    let isPink = ovals.length % 2 === 0; // Alternar entre rosa y gris
    let newOval = new Oval(x, y, isPink);

    if (!isTouching(newOval)) {
      ovals.push(newOval);
    }
    attempts++;
  }
}

// Función para verificar si un óvalo está tocando otro
function isTouching(newOval) {
  for (let oval of ovals) {
    let d = dist(newOval.x, newOval.y, oval.x, oval.y);
    if (d < 10) { // Si la distancia es menor que el diámetro, están tocando
      return true;
    }
  }
  return false;
}

// Función para manejar la entrada de audio
function checkMicInput() {
  let micLevel = mic.getLevel(); // Obtener el nivel de audio actual
  let spectrum = fft.analyze(); // Analizar el espectro de frecuencias
  let trebleEnergy = fft.getEnergy("treble"); // Obtener la energía de las frecuencias altas
  let bassEnergy = fft.getEnergy("bass"); // Obtener la energía de las frecuencias bajas
  let midEnergy = fft.getEnergy("mid"); // Obtener la energía de las frecuencias medias

  // Manejar los controles por separado
  handleMicLevel(micLevel);
  handleBassEnergy(bassEnergy);
  handleTrebleEnergy(trebleEnergy);
  handleMidEnergy(midEnergy); // Nuevo manejo para frecuencias medias
}

// Función para manejar el nivel de micrófono
function handleMicLevel(micLevel) {
  // Ajustar el mapeo para mayor sensibilidad
  let mappedVibration = map(micLevel, 0, 0.1, 0, 5); // Reducir el rango de entrada para mayor sensibilidad

  if (micLevel > 0.01) { // Reducir el umbral para activar efectos
    activateEffects(mappedVibration);
  } else {
    deactivateEffects();
  }
}

// Función para manejar la energía de los bajos
function handleBassEnergy(bassEnergy) {
  // Ajustar el mapeo para mayor sensibilidad
  let mappedVibration = map(bassEnergy, 0, 255, 0, 5); // Reducir el rango de entrada para mayor sensibilidad

  if (bassEnergy > 150) { // Umbral para activar la vibración, ajustado a 150 para mayor sensibilidad
    activateVibration(mappedVibration);
    bassHighDuration++;
    if (bassHighDuration > bassHighTime) {
      changeOvalsColor(color(0, 0, 255, 128)); // Cambiar el color a azul transparente
      bassHighDuration = 0; // Resetear el contador después de cambiar el color
    }
  } else {
    deactivateVibration();
    bassHighDuration = 0; // Resetear el contador si la energía de bajos baja
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
    // Generar un color aleatorio entre gris y rosa claro
    let newColor;
    if (random(1) < 0.5) {
      newColor = color(200, 200, 200, 128); // Gris
    } else {
      newColor = color(255, 182, 193); // Rosa claro
    }
    
    changeOvalsColor(newColor); // Cambiar el color
  }
}

// Activar efectos cuando se detecta un sonido
function activateEffects(mappedVibration) {
  fondo.setMoveUp(true); // Activar movimiento del degradado
}

// Desactivar efectos cuando no se detecta un sonido
function deactivateEffects() {
  fondo.setMoveUp(false); // Desactivar movimiento del degradado
}

// Activar vibración de los óvalos
function activateVibration(mappedVibration) {
  for (let oval of ovals) {
    oval.vibrate = true; // Activar vibración
    oval.setVibrationAmplitude(mappedVibration); // Ajustar la amplitud de la vibración
  }
}

// Desactivar vibración de los óvalos
function deactivateVibration() {
  for (let oval of ovals) {
    oval.vibrate = false; // Desactivar vibración
  }
}

// Cambiar el color de los óvalos
function changeOvalsColor(newColor) {
  for (let oval of ovals) {
    oval.color = newColor; // Cambiar el color según el nuevo color
  }
}



