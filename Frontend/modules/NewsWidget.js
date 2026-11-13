export class NewsWidget {
    constructor() {
        this.track = document.getElementById('news-track');
        this.dotsContainer = document.getElementById('news-dots');
        this.prevBtn = document.getElementById('news-prev');
        this.nextBtn = document.getElementById('news-next');
        this.items = [];
        this.currentIndex = 0;
    }

    async init() {
        this.prevBtn.addEventListener('click', () => this.goTo(this.currentIndex - 1));
        this.nextBtn.addEventListener('click', () => this.goTo(this.currentIndex + 1));

        this.track.addEventListener('scroll', () => {
            const width = this.track.clientWidth;
            if (width > 0) {
                const newIndex = Math.round(this.track.scrollLeft / width);
                if (newIndex !== this.currentIndex) {
                    this.currentIndex = newIndex;
                    this.updateDots();
                }
            }
        });

        await this.fetchFeeds();
    }

    async fetchWithTimeout(url, ms = 5000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
            const res = await fetch(url, { signal: controller.signal });
            return await res.json();
        } finally {
            clearTimeout(timer);
        }
    }

    async fetchFeeds() {
        const [animeResult, devResult] = await Promise.allSettled([
            this.fetchWithTimeout('https://api.jikan.moe/v4/seasons/now?limit=4'),
            this.fetchWithTimeout('https://dev.to/api/articles?per_page=4&top=7')
        ]);

        const animeItems = animeResult.status === 'fulfilled' && animeResult.value.data
            ? animeResult.value.data.map(item => ({
                category: 'ANIME // MAL',
                type: 'anime',
                title: `${item.title} ${item.score ? `★ ${item.score}` : ''}`,
                url: item.url
            }))
            : [];

        const devItems = devResult.status === 'fulfilled' && Array.isArray(devResult.value)
            ? devResult.value.map(item => ({
                category: 'DEV // TECH',
                type: 'dev',
                title: item.title,
                url: item.url
            }))
            : [];

        const max = Math.max(animeItems.length, devItems.length);
        for (let i = 0; i < max; i++) {
            if (animeItems[i]) this.items.push(animeItems[i]);
            if (devItems[i]) this.items.push(devItems[i]);
        }

        // Respaldo por si ambas APIs fallan o no hay internet
        if (this.items.length === 0) {
            this.items = [
                { category: 'SYS // LOCAL', type: 'dev', title: 'Sin conexión a feeds externos. Revisa tu red.', url: '#' }
            ];
        }

        this.render();
    }

    render() {
        this.track.innerHTML = '';
        this.dotsContainer.innerHTML = '';

        this.items.forEach((item, idx) => {
            const card = document.createElement('article');
            card.className = 'news-card';
            card.innerHTML = `
                <span class="news-badge ${item.type}">${item.category}</span>
                <p class="news-title">${item.title}</p>
                <a class="news-link" href="${item.url}" target="_blank" rel="noopener">ABRIR_ENLACE ↗</a>
            `;
            this.track.appendChild(card);

            const dot = document.createElement('span');
            dot.className = `news-dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goTo(idx));
            this.dotsContainer.appendChild(dot);
        });
    }

    goTo(index) {
        if (this.items.length === 0) return;
        const total = this.items.length;
        this.currentIndex = (index + total) % total;
        this.track.scrollTo({
            left: this.currentIndex * this.track.clientWidth,
            behavior: 'smooth'
        });
        this.updateDots();
    }

    updateDots() {
        const dots = this.dotsContainer.querySelectorAll('.news-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }
}