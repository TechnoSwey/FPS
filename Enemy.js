import * as THREE from 'three';

export class Enemy {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        
        // Создаем тело врага
        const geometry = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        const material = new THREE.MeshStandardMaterial({ color: 0xff3333 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        scene.add(this.mesh);
        
        this.isAlive = true;
    }

    // Проверка попадания (простая дистанционная проверка из main.js)
    checkHit(rayOrigin, rayDirection, maxDistance = 10) {
        if (!this.isAlive) return false;
        
        // Простейшая проверка: сфера вокруг врага
        const toEnemy = new THREE.Vector3().subVectors(this.mesh.position, rayOrigin);
        const distance = toEnemy.length();
        
        if (distance > maxDistance) return false;
        
        // Проверяем, примерно ли смотрит луч на врага (dot product)
        const directionToEnemy = toEnemy.clone().normalize();
        const angle = rayDirection.dot(directionToEnemy);
        
        // Если угол маленький (примерно смотрит на врага) и дистанция маленькая
        if (angle > 0.95 && distance < 2.0) { // ~ 18 градусов
            this.die();
            return true;
        }
        return false;
    }

    die() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.scene.remove(this.mesh);
        console.log("Враг уничтожен!");
    }
}
