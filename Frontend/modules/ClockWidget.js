export class ClockWidget {
    constructor({ city, country, lat, lon }) {
        this.city = city;
        this.country = country;
        this.lat = lat;
        this.lon = lon;

        this.canvas = document.getElementById('analog-clock');
        this.ctx = this.canvas.getContext('2d');
        this.timeEl = document.getElementById('clock-hours'); // Corregido: timeEl con 'l' minúscula
        this.miniClockEl = document.getElementById('mini-clock');
        this.dateEl = document.getElementById('clock-date');
        this.locationEl = document.getElementById('clock-location');
        this.weatherEl = document.getElementById('clock-weather');
    }

    // Proceso de temporizador
    init() {
        this.locationEl.textContent = `📍 ${this.city.toUpperCase()}, ${this.country.toUpperCase()}`;

        // Actualizamos hora inmediatamente y luego cada segundo
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Consultar clima al iniciar y cada 15 minutos
        this.fetchWeather();
        setInterval(() => this.fetchWeather(), 900000);
    }

    updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        const sStr = String(seconds).padStart(2, '0');

        this.timeEl.textContent = `${hStr}:${mStr}:${sStr}`;
        if (this.miniClockEl) {
            this.miniClockEl.textContent = `${hStr}:${mStr}`;
        }

        const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
        this.dateEl.textContent = now.toLocaleDateString('es-CO', opcionesFecha);

        this.drawAnalogClock(hours, minutes, seconds);
    }

    drawAnalogClock(hours, minutes, seconds) {
        const ctx = this.ctx;
        const radius = this.canvas.width / 2;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.translate(radius, radius);

        // Aro exterior neón
        ctx.beginPath();
        ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#1e6b7b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Marcar las 12 horas
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * (radius - 14), Math.sin(angle) * (radius - 14));
            ctx.lineTo(Math.cos(angle) * (radius - 8), Math.sin(angle) * (radius - 8));
            ctx.strokeStyle = i % 3 === 0 ? '#00f0ff' : '#5c7a84';
            ctx.lineWidth = i % 3 === 0 ? 2.5 : 1;
            ctx.stroke();
        }

        // Ángulos de las manecillas
        const secAngle = (seconds * Math.PI) / 30 - Math.PI / 2;
        const minAngle = (minutes * Math.PI) / 30 + (seconds * Math.PI) / 1800 - Math.PI / 2;
        const hourAngle = ((hours % 12) * Math.PI) / 6 + (minutes * Math.PI) / 360 - Math.PI / 2;

        this.drawHand(hourAngle, radius * 0.45, 3.5, '#00f0ff'); // Hora (Cyan)
        this.drawHand(minAngle, radius * 0.68, 2.5, '#ffffff');  // Minutos (Blanco)
        this.drawHand(secAngle, radius * 0.78, 1.2, '#00ff66');  // Segundos (Verde neón)

        // Eje central
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff66';
        ctx.fill();

        ctx.restore();
    }

    // Método auxiliar que faltaba para dibujar cada manecilla
    drawHand(angle, length, width, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }

    // Consulta la API gratuita de Open-Meteo sin necesidad de servidor ni API Key
    async fetchWeather() {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current=temperature_2m,weather_code`;
            const response = await fetch(url);
            const data = await response.json();

            const temp = Math.round(data.current.temperature_2m);
            const desc = this.translateWeatherCode(data.current.weather_code);
            this.weatherEl.textContent = `🌡️ ${temp}°C ${desc}`;
        } catch (error) {
            this.weatherEl.textContent = '🌡️ OFFLINE';
        }
    }

    translateWeatherCode(code) {
        if (code === 0) return 'DESPEJADO';
        if (code <= 3) return 'PARCIALMENTE NUBLADO';
        if (code >= 51 && code <= 67) return 'LLUVIA';
        if (code >= 80) return 'TORMENTA';
        return 'NUBLADO';
    }
}