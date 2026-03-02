import * as THREE from 'three';
import { PlayerControls } from './PlayerControls.js';
import { World } from './World.js';
import { Enemy } from './Enemy.js';

// --- Инициализация сцены, камеры, рендера ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Голубое небо

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5); // Ставим камеру на высоту глаз

const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false }); // Отключаем сглаживание для производительности
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Ограничим pixel ratio для производительности

// --- Свет ---
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// --- Создаем мир ---
const world = new World(scene);

// --- Создаем врага ---
const enemy = new Enemy(scene, new THREE.Vector3(3, 1, 3));

// --- Управление ---
const controls = new PlayerControls(camera, renderer.domElement);

// --- Обработка выстрелов (по нажатию на правую область) ---
const aimArea = document.getElementById('aim-area');
aimArea.addEventListener('click', (e) => {
    // В реальном шутере лучше использовать touchstart, но для простоты click
    shoot();
});

function shoot() {
    if (!enemy.isAlive) return;

    // Направление выстрела - прямо по направлению камеры
    const rayDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const hit = enemy.checkHit(camera.position, rayDirection);
    
    if (hit) {
        console.log("Попадание!");
    } else {
        console.log("Мимо");
    }
}

// --- Обработка ресайза окна ---
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Игровой цикл ---
function animate() {
    requestAnimationFrame(animate);

    // Обновляем управление (движение и поворот)
    controls.update();

    // Рендерим сцену
    renderer.render(scene, camera);
}

animate();

console.log("Игра запущена!");
