export class WeatherWidget {
    constructor() {
        this.apiBase = 'http://127.0.0.1:8000/api/weather';
        this.selector = document.getElementById('city-selector');
        this.tempEl = document.getElementById('w-temp');
        this.skyIconEl = document.getElementById('w-sky-icon');
        this.skyTextEl = document.getElementById('w-sky-text');
        this.thermIconEl = document.getElementById('w-therm-icon');
        this.thermTextEl = document.getElementById('w-therm-text');

        this.cities = {
            cartagena: { name: 'Cartagena', lat: 10.3910, lon: -75.4794 },
            bogota: { name: 'Bogotá', lat: 4.7110, lon: -74.0721 },
            medellin: { name: 'Medellín', lat: 6.2442, lon: -75.5812 },
            cali: { name: 'Cali', lat: 3.4516, lon: -76.5320 },
            barranquilla: { name: 'Barranquilla', lat: 10.9685, lon: -74.7813 }
        };
    }

    init() {
        this.selector.addEventListener('change', () => this.loadWeather(this.selector.value));
        this.loadWeather(this.selector.value);

        // Actualización automática cada 15 minutos
        setInterval(() => this.loadWeather(this.selector.value), 900000);
    }

    async fetchWithTimeout(url, ms = 2000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error('HTTP error');
            return await res.json();
        } finally {
            clearTimeout(timer);
        }
    }

    classifyWeather(temp, humidity, code) {
        let sky_icon = '☀️', sky_label = 'DESPEJADO';
        if ([95, 96, 99].includes(code)) {
            sky_icon = '⛈️'; sky_label = 'TORMENTA ELÉCTRICA';
        } else if ([80, 81, 82].includes(code)) {
            sky_icon = '🌩️'; sky_label = 'TORMENTA';
        } else if ([51, 53, 55, 61, 63, 65].includes(code)) {
            sky_icon = '🌧️'; sky_label = 'LLUVIA';
        } else if ([1, 2, 3, 45, 48].includes(code)) {
            sky_icon = '☁️'; sky_label = 'NUBLADO';
        }

        let thermal_icon = '🍃', thermal_label = `CONFORT ${humidity}%`;
        if (temp >= 34) {
            thermal_icon = '🔥'; thermal_label = 'CALOR EXCESIVO';
        } else if (temp >= 27) {
            thermal_icon = '🌡️'; thermal_label = 'CALOR';
        } else if (temp <= 8) {
            thermal_icon = '🥶'; thermal_label = 'FRÍO EXCESIVO';
        } else if (temp <= 15) {
            thermal_icon = '❄️'; thermal_label = 'FRÍO';
        } else if (humidity >= 80) {
            thermal_icon = '💧'; thermal_label = `HUMEDAD ${humidity}%`;
        }

        return { sky_icon, sky_label, thermal_icon, thermal_label };
    }

    async loadWeather(cityKey) {
        this.skyTextEl.textContent = 'SYNC...';

        try {
            // 1. Intenta primero con el Backend en Python (máx. 2 segundos)
            const data = await this.fetchWithTimeout(`${this.apiBase}/${cityKey}`, 2000);
            this.renderWeather(data);
        } catch {
            // 2. Respaldo directo desde JS si Python está apagado
            try {
                const city = this.cities[cityKey] || this.cities.cartagena;
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code`;
                const raw = await this.fetchWithTimeout(url, 5000);

                const temp = Number(raw.current.temperature_2m.toFixed(1));
                const humidity = Math.round(raw.current.relative_humidity_2m);
                const code = Number(raw.current.weather_code);
                const status = this.classifyWeather(temp, humidity, code);

                this.renderWeather({ temp, ...status });
            } catch {
                this.tempEl.textContent = 'ERR';
                this.skyIconEl.textContent = '⚠️';
                this.skyTextEl.textContent = 'SIN RED';
                this.thermIconEl.textContent = '🔌';
                this.thermTextEl.textContent = 'REINTENTANDO';
            }
        }
    }

    renderWeather(data) {
        this.tempEl.textContent = `${data.temp}°C`;
        this.skyIconEl.textContent = data.sky_icon;
        this.skyTextEl.textContent = data.sky_label;
        this.thermIconEl.textContent = data.thermal_icon;
        this.thermTextEl.textContent = data.thermal_label;
    }
}