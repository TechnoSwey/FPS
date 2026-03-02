// Класс для управления игроком (Движение + Поворот камеры)
export class PlayerControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Состояние клавиш (для тестирования на ПК)
        this.keys = {};
        // Состояние джойстика (для телефона)
        this.moveDirection = { x: 0, y: 0 }; // y - вперед/назад, x - влево/вправо

        // Параметры скорости
        this.moveSpeed = 0.15;
        this.mouseSensitivity = 0.002; // Чувствительность поворота

        // Углы поворота камеры
        this.yaw = 0; // Поворот влево-вправо (по Y)
        this.pitch = 0; // Поворот вверх-вниз (по X)

        // Для drag-поворота (правый джойстик/мышь)
        this.isMouseDown = false;
        this.previousMousePosition = { x: 0, y: 0 };

        // Биндим методы для сохранения контекста this
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchMoveAim = this.onTouchMoveAim.bind(this); // Для правой области
        this.onTouchStartAim = this.onTouchStartAim.bind(this);
        this.onTouchEndAim = this.onTouchEndAim.bind(this);
        this.onTouchMoveMove = this.onTouchMoveMove.bind(this); // Для левого джойстика
        this.onTouchStartMove = this.onTouchStartMove.bind(this);
        this.onTouchEndMove = this.onTouchEndMove.bind(this);

        this.initControls();
    }

    initControls() {
        // Клавиатура (для отладки на ПК)
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);

        // Мышь (для отладки на ПК)
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        // Touch события для мобильных устройств
        const moveJoystick = document.getElementById('move-handle');
        const aimArea = document.getElementById('aim-area');

        // Джойстик движения
        moveJoystick.addEventListener('touchstart', this.onTouchStartMove);
        moveJoystick.addEventListener('touchmove', this.onTouchMoveMove);
        moveJoystick.addEventListener('touchend', this.onTouchEndMove);

        // Область прицеливания (поворот камеры)
        aimArea.addEventListener('touchstart', this.onTouchStartAim);
        aimArea.addEventListener('touchmove', this.onTouchMoveAim);
        aimArea.addEventListener('touchend', this.onTouchEndAim);

        // Запрещаем контекстное меню на мобильных
        window.addEventListener('contextmenu', e => e.preventDefault());
    }

    // --- Обработка клавиш (WASD) ---
    onKeyDown(event) {
        this.keys[event.code] = true;
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    // --- Обработка мыши (поворот) ---
    onMouseDown(event) {
        this.isMouseDown = true;
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    onMouseMove(event) {
        if (!this.isMouseDown) return;

        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;

        this.yaw -= deltaX * this.mouseSensitivity;
        this.pitch -= deltaY * this.mouseSensitivity;

        // Ограничиваем pitch, чтобы не перевернуться
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    // --- Обработка Touch для движения (левый джойстик) ---
    onTouchStartMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const joystick = document.getElementById('move-joystick');
        const handle = document.getElementById('move-handle');
        
        // Запоминаем начальную позицию центра джойстика
        this.joystickRect = joystick.getBoundingClientRect();
        this.handleRect = handle.getBoundingClientRect();
        this.joystickCenter = {
            x: this.joystickRect.left + this.joystickRect.width / 2,
            y: this.joystickRect.top + this.joystickRect.height / 2
        };
    }

    onTouchMoveMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const handle = document.getElementById('move-handle');

        // Вычисляем смещение относительно центра джойстика
        let deltaX = touch.clientX - this.joystickCenter.x;
        let deltaY = touch.clientY - this.joystickCenter.y;

        // Ограничиваем радиус (максимум 50px)
        const maxRadius = 50;
        const distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        if (distance > maxRadius) {
            deltaX = (deltaX / distance) * maxRadius;
            deltaY = (deltaY / distance) * maxRadius;
        }

        // Двигаем ручку визуально
        handle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Сохраняем направление для движения
        this.moveDirection.x = deltaX / maxRadius; // От -1 до 1 (влево/вправо)
        this.moveDirection.y = -deltaY / maxRadius; // От -1 до 1 (вперед/назад). Инвертируем Y, т.к. вверх джойстика = вперед в игре
    }

    onTouchEndMove(e) {
        e.preventDefault();
        const handle = document.getElementById('move-handle');
        handle.style.transform = `translate(0px, 0px)`; // Возвращаем ручку в центр
        this.moveDirection.x = 0;
        this.moveDirection.y = 0;
    }

    // --- Обработка Touch для прицеливания (правая область) ---
    onTouchStartAim(e) {
        e.preventDefault();
        // Начинаем поворот
        this.isAiming = true;
        const touch = e.touches[0];
        this.previousTouchPosition = { x: touch.clientX, y: touch.clientY };
    }

    onTouchMoveAim(e) {
        e.preventDefault();
        if (!this.isAiming) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.previousTouchPosition.x;
        const deltaY = touch.clientY - this.previousTouchPosition.y;

        this.yaw -= deltaX * this.mouseSensitivity * 2; // Увеличим чувствительность для тача
        this.pitch -= deltaY * this.mouseSensitivity * 2;

        // Ограничиваем pitch
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.previousTouchPosition = { x: touch.clientX, y: touch.clientY };
    }

    onTouchEndAim(e) {
        e.preventDefault();
        this.isAiming = false;
    }

    // Метод обновления, вызывается в игровом цикле
    update() {
        // Применяем поворот к камере
        this.camera.rotation.order = 'YXZ'; // Важно: сначала Yaw, потом Pitch
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        // --- Движение ---
        // Получаем направление от клавиш (ПК) или от джойстика (телефон)
        let moveX = 0, moveZ = 0;
        
        // Приоритет у джойстика, если он активен
        if (Math.abs(this.moveDirection.x) > 0.1 || Math.abs(this.moveDirection.y) > 0.1) {
            moveX = this.moveDirection.x;
            moveZ = this.moveDirection.y;
        } else {
            // Клавиатурный ввод (WASD)
            if (this.keys['KeyW']) moveZ += 1; // Вперед
            if (this.keys['KeyS']) moveZ -= 1; // Назад
            if (this.keys['KeyA']) moveX -= 1; // Влево
            if (this.keys['KeyD']) moveX += 1; // Вправо
        }

        // Нормализуем диагональную скорость
        if (moveX !== 0 || moveZ !== 0) {
            const length = Math.sqrt(moveX*moveX + moveZ*moveZ);
            moveX /= length;
            moveZ /= length;
        }

        // Двигаем камеру (игрока) в направлении взгляда
        if (moveX !== 0) {
            this.camera.position.x += Math.sin(this.yaw) * moveX * this.moveSpeed;
            this.camera.position.z += Math.cos(this.yaw) * moveX * this.moveSpeed;
        }
        if (moveZ !== 0) {
            // Вперед относительно направления камеры
            this.camera.position.x += Math.sin(this.yaw) * moveZ * this.moveSpeed;
            this.camera.position.z += Math.cos(this.yaw) * moveZ * this.moveSpeed;
        }
    }
}
