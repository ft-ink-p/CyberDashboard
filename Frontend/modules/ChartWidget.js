export class ChartWidget {
    constructor() {
        this.apiUrl = 'http://127.0.0.1:8000/api/currency';
        this.canvas = document.getElementById('currency-chart');
        this.usdRefEl = document.getElementById('chart-usd-ref');
        this.chartInstance = null;
    }

    async init() {
        await this.loadRates();
        setInterval(() => this.loadRates(), 900000);
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

    async loadRates() {
        try {
            // 1. Intenta con el Backend en Python
            const data = await this.fetchWithTimeout(this.apiUrl, 2000);
            this.usdRefEl.textContent = `1 USD = $${data.usd_cop.toLocaleString('es-CO')} COP`;
            this.renderChart(
                data.currencies.map(c => c.code),
                data.currencies.map(c => c.value_cop)
            );
        } catch {
            // 2. Respaldo directo desde JS si Python está apagado
            try {
                const raw = await this.fetchWithTimeout('https://open.er-api.com/v6/latest/USD', 5000);
                const rates = raw.rates;
                const cop = rates.COP;

                const currencies = [
                    { code: 'USD', value_cop: Number(cop.toFixed(1)) },
                    { code: 'EUR', value_cop: Number((cop / rates.EUR).toFixed(1)) },
                    { code: 'GBP', value_cop: Number((cop / rates.GBP).toFixed(1)) },
                    { code: 'BRL (x5)', value_cop: Number(((cop / rates.BRL) * 5).toFixed(1)) },
                    { code: 'MXN (x10)', value_cop: Number(((cop / rates.MXN) * 10).toFixed(1)) }
                ];

                this.usdRefEl.textContent = `1 USD = $${cop.toLocaleString('es-CO', { maximumFractionDigits: 1 })} COP`;
                this.renderChart(
                    currencies.map(c => c.code),
                    currencies.map(c => c.value_cop)
                );
            } catch {
                this.usdRefEl.textContent = 'SIN CONEXIÓN DE DIVISAS';
            }
        }
    }

    renderChart(labels, values) {
        if (typeof Chart === 'undefined') {
            this.usdRefEl.textContent = 'CARGANDO CHART.JS...';
            return;
        }

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = this.canvas.getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Valor en COP',
                    data: values,
                    backgroundColor: [
                        'rgba(0, 240, 255, 0.65)',
                        'rgba(0, 255, 102, 0.65)',
                        'rgba(255, 0, 128, 0.65)',
                        'rgba(255, 204, 0, 0.65)',
                        'rgba(157, 78, 221, 0.65)'
                    ],
                    borderColor: [
                        '#00f0ff',
                        '#00ff66',
                        '#ff0080',
                        '#ffcc00',
                        '#9d4edd'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` $${Number(ctx.raw).toLocaleString('es-CO')} COP`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#9bb8c2', font: { family: 'monospace', size: 10 } },
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            color: '#5c7a84',
                            font: { family: 'monospace', size: 10 },
                            callback: (val) => `$${val}`
                        },
                        grid: { color: 'rgba(0, 240, 255, 0.08)' }
                    }
                }
            }
        });
    }
}