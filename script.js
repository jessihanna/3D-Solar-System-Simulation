// Scene & Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 100;

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Start in dark mode
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const light = new THREE.PointLight(0xffffff, 2, 500);
light.position.set(0, 0, 0);
scene.add(light);

const sunGeometry = new THREE.SphereGeometry(10, 64, 64);
const sunMaterial = new THREE.MeshStandardMaterial({
  emissive: 0xffcc00,
  emissiveIntensity: 1.5,
  color: 0xff9900,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const textureLoader = new THREE.TextureLoader();
const spriteMaterial = new THREE.SpriteMaterial({
  map: textureLoader.load(
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/glow.png"
  ),
  color: 0xff9900,
  transparent: true,
  opacity: 0.6,
});
const sunGlow = new THREE.Sprite(spriteMaterial);
sunGlow.scale.set(40, 40, 1);
sun.add(sunGlow);

const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const starVertices = [];
for (let i = 0; i < starCount; i++) {
  starVertices.push(
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000
  );
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const planetData = [
  { name: "Mercury", color: 0xaaaaaa, size: 1, dist: 15, speed: 0.04 },
  { name: "Venus", color: 0xffaa00, size: 1.5, dist: 22, speed: 0.03 },
  { name: "Earth", color: 0x2233ff, size: 1.7, dist: 30, speed: 0.025 },
  { name: "Mars", color: 0xff3300, size: 1.4, dist: 37, speed: 0.02 },
  { name: "Jupiter", color: 0xffcc99, size: 4, dist: 50, speed: 0.01 },
  { name: "Saturn", color: 0xffeeaa, size: 3.5, dist: 63, speed: 0.008 },
  { name: "Uranus", color: 0x66ffff, size: 2.5, dist: 75, speed: 0.006 },
  { name: "Neptune", color: 0x3366ff, size: 2.5, dist: 85, speed: 0.005 },
];

const controlsDiv = document.getElementById("controls");
const tooltip = document.getElementById("tooltip");
const planets = [];
planetData.forEach((data) => {
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const planet = {
    mesh: mesh,
    dist: data.dist,
    speed: data.speed,
    angle: Math.random() * Math.PI * 2,
    name: data.name,
  };
  planets.push(planet);

  const label = document.createElement("label");
  label.innerText = `${data.name} Speed:`;
  controlsDiv.appendChild(label);

  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "0.1";
  input.step = "0.001";
  input.value = data.speed;
  input.addEventListener("input", () => {
    planet.speed = parseFloat(input.value);
  });
  controlsDiv.appendChild(input);
});

let isPaused = false;
const toggleBtn = document.getElementById("toggleBtn");
toggleBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  toggleBtn.innerText = isPaused ? "Resume" : "Pause";
});

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-mode");
  renderer.setClearColor(isLight ? 0xffffff : 0x000000);
  themeToggle.innerText = isLight ? "☀️ Light Mode" : "🌙 Dark Mode";
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map((p) => p.mesh));

  if (intersects.length > 0) {
    tooltip.style.display = "block";
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
    const planet = planets.find((p) => p.mesh === intersects[0].object);
    tooltip.innerText = planet ? planet.name : "";
  } else {
    tooltip.style.display = "none";
  }
}
window.addEventListener("mousemove", onMouseMove);

const earth = planetData.find((p) => p.name === "Earth");
window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map((p) => p.mesh));
  const earthPlanet = planets.find((p) => p.name === "Earth");
  if (intersects.length > 0 && intersects[0].object === earthPlanet.mesh) {
    const target = earthPlanet.mesh.position
      .clone()
      .add(new THREE.Vector3(5, 5, 10));
    camera.position.lerp(target, 0.2);
  }
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (!isPaused) {
    planets.forEach((planet) => {
      planet.angle += planet.speed * delta * 60;
      planet.mesh.position.x = planet.dist * Math.cos(planet.angle);
      planet.mesh.position.z = planet.dist * Math.sin(planet.angle);
    });
  }

  renderer.render(scene, camera);
}
animate();
// Reset Zoom Logic
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
  camera.position.set(0, 0, 100); // Reset to original camera position
  camera.lookAt(0, 0, 0);
});
