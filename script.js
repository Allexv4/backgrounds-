let currentBackground = "constellation"; // Inicia com o background de constelação
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

// Configurações para o background de constelação
let constellationPoints = [];
const maxPoints = 100;
const connectionDistance = 150;
const mouseRadius = 150;
let mouse = { x: null, y: null, radius: mouseRadius };

// Configurações para o background de fumaça
let smokeParticles = [];
let mouseX = 0;
let mouseY = 0;
let lastX = 0;
let lastY = 0;
let mouseTrail = [];
const maxTrailLength = 20;

// Função para alternar entre os backgrounds
function toggleBackground() {
  currentBackground =
    currentBackground === "constellation" ? "smoke" : "constellation";
  if (currentBackground === "constellation") {
    setupConstellation();
  } else {
    setupSmoke();
  }
}

// Configuração inicial do background de constelação
function setupConstellation() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  constellationPoints = [];
  createConstellationPoints();
  animateConstellation();
}

// Configuração inicial do background de fumaça
function setupSmoke() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  smokeParticles = [];
  animateSmoke();
}

// Ajustar o tamanho do canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Evento de movimento do mouse para o background de constelação
window.addEventListener("mousemove", function (event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// Funções para o background de constelação
function createConstellationPoints() {
  for (let i = 0; i < maxPoints; i++) {
    constellationPoints.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
    });
  }
}

function animateConstellation() {
  if (currentBackground !== "constellation") return;

  requestAnimationFrame(animateConstellation);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < constellationPoints.length; i++) {
    const point = constellationPoints[i];

    point.x += point.speedX;
    point.y += point.speedY;

    if (point.x < 0 || point.x > canvas.width) point.speedX *= -1;
    if (point.y < 0 || point.y > canvas.height) point.speedY *= -1;

    // Interação com o cursor
    if (mouse.x !== null && mouse.y !== null) {
      let distance = Math.sqrt(
        Math.pow(mouse.x - point.x, 2) + Math.pow(mouse.y - point.y, 2)
      );
      if (distance < mouse.radius) {
        const angle = Math.atan2(mouse.y - point.y, mouse.x - point.x);
        point.x -= Math.cos(angle) * 1;
        point.y -= Math.sin(angle) * 1;
      }
    }

    // Desenhar o ponto
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fillStyle = point.color;
    ctx.fill();

    // Conectar com outros pontos próximos
    for (let j = i + 1; j < constellationPoints.length; j++) {
      const otherPoint = constellationPoints[j];
      const distance = Math.sqrt(
        Math.pow(otherPoint.x - point.x, 2) +
          Math.pow(otherPoint.y - point.y, 2)
      );

      if (distance < connectionDistance) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(otherPoint.x, otherPoint.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${
          1 - distance / connectionDistance
        })`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

// Funções para o background de fumaça
class SmokeParticle {
  constructor(x, y) {
    this.x = x + (Math.random() * 10 - 5);
    this.y = y + (Math.random() * 10 - 5);
    this.size = Math.random() * 15 + 5;
    this.initialSize = this.size;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * -1 - 0.5;
    this.lifespan = Math.random() * 50 + 40;
    this.age = 0;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = Math.random() * 0.03 - 0.015;
  }

  update() {
    this.age++;
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedX *= 0.99;
    this.speedY *= 0.99;
    this.rotation += this.rotationSpeed;

    if (this.age < this.lifespan * 0.3) {
      this.size += 0.2;
    } else {
      this.size -= 0.1;
    }

    this.opacity = Math.max(0, this.opacity - 0.5 / this.lifespan);
    return this.age < this.lifespan && this.size > 0;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
    gradient.addColorStop(
      0.5,
      `rgba(240, 240, 240, ${this.opacity * 0.6})`
    );
    gradient.addColorStop(1, `rgba(230, 230, 230, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function createSmokeParticle(x, y) {
  smokeParticles.push(new SmokeParticle(x, y));
}

function animateSmoke() {
  if (currentBackground !== "smoke") return;

  requestAnimationFrame(animateSmoke);
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  smokeParticles = smokeParticles.filter((particle) => {
    const isAlive = particle.update();
    if (isAlive) {
      particle.draw();
    }
    return isAlive;
  });
}

// Evento de movimento do mouse para o background de fumaça
document.addEventListener("mousemove", function (event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  mouseTrail.push({ x: mouseX, y: mouseY });

  if (mouseTrail.length > maxTrailLength) {
    mouseTrail.shift();
  }

  const speed = Math.sqrt(
    Math.pow(mouseX - lastX, 2) + Math.pow(mouseY - lastY, 2)
  );

  const numParticles = Math.min(5, Math.max(1, Math.floor(speed / 5)));

  for (let i = 0; i < numParticles; i++) {
    createSmokeParticle(mouseX, mouseY);
  }

  lastX = mouseX;
  lastY = mouseY;
});

// Inicializa com o background de constelação
setupConstellation();