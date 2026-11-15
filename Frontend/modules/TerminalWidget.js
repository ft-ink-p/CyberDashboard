export class TerminalWidget {
    constructor() {
        this.stage = document.getElementById('terminal-stage');
        this.cmdLabel = document.getElementById('term-active-cmd');
        this.input = document.getElementById('terminal-input');
        this.buttons = document.querySelectorAll('.term-btn');

        this.apiUrl = 'http://127.0.0.1:8000/api/sysinfo';
        this.currentMode = 'neofetch';
        this.animId = null;
        this.keyHandler = null;
        this.snakeBest = Number(localStorage.getItem('cyber_snake_best') || 0);
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => this.runCommand(btn.dataset.cmd));
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const raw = this.input.value.trim().toLowerCase();
                this.input.value = '';
                if (raw) this.runCommand(raw);
            }
        });

        this.runCommand('neofetch');
    }

    cleanup() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        this.stage.innerHTML = '';
    }

    setActiveButton(cmd) {
        this.buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cmd === cmd);
        });
    }

    async runCommand(cmd) {
        this.cleanup();
        this.cmdLabel.textContent = cmd;

        if (cmd === 'neofetch' || cmd === 'ascii') {
            this.currentMode = 'neofetch';
            this.setActiveButton('neofetch');
            await this.renderNeofetch();
        } else if (cmd === '3d' || cmd === 'holo' || cmd === '3d_holo') {
            this.currentMode = '3d';
            this.setActiveButton('3d');
            this.render3DHologram();
        } else if (cmd === 'snake' || cmd === 'game') {
            this.currentMode = 'snake';
            this.setActiveButton('snake');
            this.renderSnakeGame();
        } else if (cmd === 'matrix') {
            this.currentMode = 'matrix';
            this.setActiveButton('matrix');
            this.renderMatrixRain();
        } else if (cmd === 'help') {
            this.currentMode = 'help';
            this.setActiveButton('');
            this.renderHelp();
        } else {
            this.currentMode = 'error';
            this.setActiveButton('');
            this.stage.innerHTML = `
                <div class="sys-specs">
                    <div style="color:#ff0055;">bash: ${cmd}: comando no encontrado</div>
                    <div style="color:var(--text-dim);">Comandos disponibles: <span style="color:var(--neon-cyan);">neofetch, 3d, snake, matrix, help</span></div>
                </div>
            `;
        }
    }

    /* =========================================
       MODO 1: NEOFETCH + PSUTIL PYTHON
       ========================================= */
    async renderNeofetch() {
        let specs = {
            os: navigator.platform || 'Windows NT',
            arch: 'x86_64',
            python: '3.13 (Offline)',
            cpu_cores: `${navigator.hardwareConcurrency || 8} hilos`,
            cpu_usage: '12%',
            ram: '4.0GB / 16.0GB',
            disk_free: '13GB FREE',
            uptime: 'Activo'
        };

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(this.apiUrl, { signal: controller.signal });
            clearTimeout(timer);
            if (res.ok) {
                specs = await res.json();
            }
        } catch {
            // Usa datos del navegador si Python no está corriendo
        }

        const asciiLogo = [
            '   .---.   ',
            '  /     \\  ',
            ' | () () | ',
            '  \\  ^  /  ',
            '   |||||   ',
            '  //|||\\\\  ',
            ' // ||| \\\\ ',
            '   CYBER   '
        ].join('\n');

        this.stage.innerHTML = `
            <div class="neofetch-grid">
                <pre class="ascii-art">${asciiLogo}</pre>
                <div class="sys-specs">
                    <div class="spec-title">by_Ink_dev@CyberOS</div>
                    <div><span class="spec-key">OS:</span> <span class="spec-val">${specs.os} (${specs.arch})</span></div>
                    <div><span class="spec-key">KERNEL:</span> <span class="spec-val">Python ${specs.python} // FastAPI</span></div>
                    <div><span class="spec-key">CPU:</span> <span class="spec-val">${specs.cpu_cores} núcleos (${specs.cpu_usage})</span></div>
                    <div><span class="spec-key">MEMORIA:</span> <span class="spec-val">${specs.ram}</span></div>
                    <div><span class="spec-key">DISCO:</span> <span class="spec-val">${specs.disk_free}</span></div>
                    <div><span class="spec-key">UPTIME:</span> <span class="spec-val">${specs.uptime}</span></div>
                    <div class="color-palette-bar">
                        <span class="color-swatch" style="background:#00f0ff;"></span>
                        <span class="color-swatch" style="background:#00ff66;"></span>
                        <span class="color-swatch" style="background:#ff0080;"></span>
                        <span class="color-swatch" style="background:#ffcc00;"></span>
                        <span class="color-swatch" style="background:#9d4edd;"></span>
                    </div>
                </div>
            </div>
        `;
    }

    /* =========================================
       MODO 2: HOLOGRAMA 3D INTERACTIVO (THREE.JS)
       ========================================= */
    render3DHologram() {
        if (typeof THREE === 'undefined') {
            this.stage.innerHTML = `<div class="placeholder-text">Cargando motor 3D Three.js...</div>`;
            return;
        }

        const width = this.stage.clientWidth || 420;
        const height = this.stage.clientHeight || 165;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 4.2;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.stage.appendChild(renderer.domElement);

        const hud = document.createElement('div');
        hud.className = 'stage-hud-overlay';
        hud.textContent = 'ARRASTRA CON EL MOUSE // CORE 3D';
        this.stage.appendChild(hud);

        const coreGeo = new THREE.IcosahedronGeometry(1.15, 1);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        scene.add(coreMesh);

        // Anillo orbital exterior
        const ringGeo = new THREE.TorusGeometry(1.65, 0.03, 8, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 3;
        scene.add(ringMesh);

        // Interacción con el mouse
        let isDragging = false;
        let prevX = 0, prevY = 0;

        renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        });
        window.addEventListener('mouseup', () => { isDragging = false; });
        renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - prevX;
            const dy = e.clientY - prevY;
            coreMesh.rotation.y += dx * 0.012;
            coreMesh.rotation.x += dy * 0.012;
            prevX = e.clientX;
            prevY = e.clientY;
        });

        const animate = () => {
            if (this.currentMode !== '3d') return;
            this.animId = requestAnimationFrame(animate);

            if (!isDragging) {
                coreMesh.rotation.y += 0.01;
                coreMesh.rotation.x += 0.004;
            }
            ringMesh.rotation.z -= 0.015;
            renderer.render(scene, camera);
        };
        animate();
    }

    /* =========================================
       MODO 3: CYBER-SNAKE ARCADE JUGABLE
       ========================================= */
    renderSnakeGame() {
        const canvas = document.createElement('canvas');
        canvas.className = 'terminal-canvas';
        canvas.width = this.stage.clientWidth || 420;
        canvas.height = this.stage.clientHeight || 165;
        this.stage.appendChild(canvas);

        const hud = document.createElement('div');
        hud.className = 'stage-hud-overlay';
        this.stage.appendChild(hud);

        const ctx = canvas.getContext('2d');
        const box = 11;
        const cols = Math.floor(canvas.width / box);
        const rows = Math.floor(canvas.height / box);

        let snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
        let dir = { x: 1, y: 0 };
        let food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        let score = 0;
        let lastTime = 0;

        const updateHud = () => {
            hud.textContent = `PTS: ${score} | HI: ${this.snakeBest} (FLECHAS / WASD)`;
        };
        updateHud();

        this.keyHandler = (e) => {
            if (document.activeElement === this.input || document.activeElement.tagName === 'TEXTAREA') return;
            const key = e.key.toLowerCase();
            if ((key === 'arrowup' || key === 'w') && dir.y === 0) {
                e.preventDefault();
                dir = { x: 0, y: -1 };
            } else if ((key === 'arrowdown' || key === 's') && dir.y === 0) {
                e.preventDefault();
                dir = { x: 0, y: 1 };
            } else if ((key === 'arrowleft' || key === 'a') && dir.x === 0) {
                e.preventDefault();
                dir = { x: -1, y: 0 };
            } else if ((key === 'arrowright' || key === 'd') && dir.x === 0) {
                e.preventDefault();
                dir = { x: 1, y: 0 };
            }
        };
        window.addEventListener('keydown', this.keyHandler);

        const step = (timestamp) => {
            if (this.currentMode !== 'snake') return;
            this.animId = requestAnimationFrame(step);

            if (timestamp - lastTime < 95) return;
            lastTime = timestamp;

            const head = {
                x: (snake[0].x + dir.x + cols) % cols,
                y: (snake[0].y + dir.y + rows) % rows
            };

            // Choque consigo mismo reinicia partida
            if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
                snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
                dir = { x: 1, y: 0 };
                score = 0;
                updateHud();
            } else {
                snake.unshift(head);
                if (head.x === food.x && head.y === food.y) {
                    score += 10;
                    if (score > this.snakeBest) {
                        this.snakeBest = score;
                        localStorage.setItem('cyber_snake_best', String(this.snakeBest));
                    }
                    updateHud();
                    food = {
                        x: Math.floor(Math.random() * cols),
                        y: Math.floor(Math.random() * rows)
                    };
                } else {
                    snake.pop();
                }
            }

            // Dibujar tablero
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Comida (nodo magenta)
            ctx.fillStyle = '#ff0080';
            ctx.fillRect(food.x * box + 1, food.y * box + 1, box - 2, box - 2);

            // Serpiente neón
            snake.forEach((seg, idx) => {
                ctx.fillStyle = idx === 0 ? '#00ff66' : '#00f0ff';
                ctx.fillRect(seg.x * box + 1, seg.y * box + 1, box - 2, box - 2);
            });
        };
        this.animId = requestAnimationFrame(step);
    }

    /* =========================================
       MODO 4
       ========================================= */
    renderMatrixRain() {
        const canvas = document.createElement('canvas');
        canvas.className = 'terminal-canvas';
        canvas.width = this.stage.clientWidth || 420;
        canvas.height = this.stage.clientHeight || 165;
        this.stage.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const fontSize = 12;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);
        const chars = '01アイウエオカキクケコサシスセソCYBEROS';

        let lastTime = 0;
        const draw = (timestamp) => {
            if (this.currentMode !== 'matrix') return;
            this.animId = requestAnimationFrame(draw);

            if (timestamp - lastTime < 45) return;
            lastTime = timestamp;

            ctx.fillStyle = 'rgba(3, 6, 10, 0.16)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff66';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        this.animId = requestAnimationFrame(draw);
    }

    renderHelp() {
        this.stage.innerHTML = `
            <div class="sys-specs" style="width:100%; padding:0 8px;">
                <div class="spec-title">MANUAL DE COMANDOS // CYBER_SHELL</div>
                <div><span class="spec-key">neofetch</span> : Muestra arte ASCII y hardware real vía Python (psutil)</div>
                <div><span class="spec-key">3d</span>       : Inicia núcleo holográfico interactivo en Three.js</div>
                <div><span class="spec-key">snake</span>    : Inicia juego arcade Cyber-Snake con récord guardado</div>
                <div><span class="spec-key">matrix</span>   : Activa flujo de datos en cascada</div>
            </div>
        `;
    }
}