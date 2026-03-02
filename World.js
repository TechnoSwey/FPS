import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.createFloor();
        this.createWalls();
    }

    createFloor() {
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshStandardMaterial({ color: 0x3a6ea5, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = Math.PI / 2; // Поворачиваем горизонтально
        floor.position.y = -0.5;
        this.scene.add(floor);

        // Добавим сетку для красоты
        const gridHelper = new THREE.GridHelper(20, 20, 0xffffff, 0x444444);
        gridHelper.position.y = -0.49;
        this.scene.add(gridHelper);
    }

    createWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Коричневый
        const wallHeight = 3;

        // Стена 1 (задняя)
        const wall1 = new THREE.Mesh(new THREE.BoxGeometry(20, wallHeight, 0.5), wallMaterial);
        wall1.position.set(0, wallHeight/2 - 0.5, -10);
        this.scene.add(wall1);

        // Стена 2 (передняя)
        const wall2 = new THREE.Mesh(new THREE.BoxGeometry(20, wallHeight, 0.5), wallMaterial);
        wall2.position.set(0, wallHeight/2 - 0.5, 10);
        this.scene.add(wall2);

        // Стена 3 (левая)
        const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallHeight, 20), wallMaterial);
        wall3.position.set(-10, wallHeight/2 - 0.5, 0);
        this.scene.add(wall3);

        // Стена 4 (правая)
        const wall4 = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallHeight, 20), wallMaterial);
        wall4.position.set(10, wallHeight/2 - 0.5, 0);
        this.scene.add(wall4);
    }
}
