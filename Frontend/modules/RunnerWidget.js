export class RunnerWidget {
    constructor() {
        this.canvas = document.getElementById('runner-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.modeEl = document.getElementById('runner-mode');
        this.scoreEl = document.getElementById('runner-score');

        this.groundY = 74;
        this.player = { x: 28, y: 54, w: 14, h: 20, vy: 0, jumping: false };
        this.obstacles = [];
        this.score = 0;
        this.highScore = 0;
        this.frame = 0;
        this.autoPilot = true;
    }

    init() {
        const triggerJump = () => {
            this.autoPilot = false;
            this.modeEl.textContent = 'MANUAL // ESPACIO O CLICK';
            this.jump();
        };

        this.canvas.parentElement.addEventListener('click', triggerJump);
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                triggerJump();
            }
        });

        this.loop();
    }

    jump() {
        if (!this.player.jumping) {
            this.player.vy = -7.8;
            this.player.jumping = true;
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        this.frame++;
        this.score += 0.15;
        if (this.score > this.highScore) this.highScore = Math.floor(this.score);
        this.scoreEl.textContent = `HI ${String(this.highScore).padStart(4, '0')}`;

        // Física de gravedad
        this.player.y += this.player.vy;
        if (this.player.y < this.groundY - this.player.h) {
            this.player.vy += 0.45;
        } else {
            this.player.y = this.groundY - this.player.h;
            this.player.vy = 0;
            this.player.jumping = false;
        }

        // Generar obstáculos periódicamente
        if (this.frame % 95 === 0) {
            this.obstacles.push({
                x: this.canvas.width + 10,
                y: this.groundY - 14,
                w: 10,
                h: 14
            });
        }

        // Mover obstáculos y detectar piloto automático o colisión
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= 2.8;

            // Salto automático si el usuario no está jugando manualmente
            if (this.autoPilot && obs.x - this.player.x < 42 && obs.x > this.player.x) {
                this.jump();
            }

            // Colisión en modo manual reinicia el contador actual
            const hit =
                this.player.x < obs.x + obs.w &&
                this.player.x + this.player.w > obs.x &&
                this.player.y < obs.y + obs.h &&
                this.player.y + this.player.h > obs.y;

            if (hit) {
                this.score = 0;
                this.obstacles = [];
                break;
            }

            if (obs.x + obs.w < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Suelo digital
        ctx.strokeStyle = '#1e6b7b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.canvas.width, this.groundY);
        ctx.stroke();

        // Puntos móviles en el suelo para sensación de velocidad
        ctx.fillStyle = '#00f0ff';
        for (let x = -(this.frame * 2.8) % 24; x < this.canvas.width; x += 24) {
            ctx.fillRect(x, this.groundY + 4, 6, 1.5);
        }

        // Monigote corredor (cabeza, visor neón, torso y piernas animadas)
        const px = this.player.x;
        const py = this.player.y;
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(px + 3, py, 8, 7);       // Cabeza
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(px + 7, py + 2, 4, 2);   // Visor ciberpunk
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(px + 4, py + 8, 6, 7);   // Cuerpo

        // Animación alterna de piernas
        const legOffset = Math.floor(this.frame / 6) % 2 === 0 ? 0 : 3;
        ctx.fillRect(px + 3, py + 15, 2.5, 5 - legOffset);
        ctx.fillRect(px + 8, py + 15, 2.5, 2 + legOffset);

        // Obstáculos (Firewalls rojos/magenta)
        ctx.fillStyle = '#ff0055';
        this.obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            ctx.strokeStyle = '#ff80aa';
            ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        });
    }
}