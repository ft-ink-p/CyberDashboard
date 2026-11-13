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
        // Consultamos artículos populares de programación, tecnología y ciencia de Dev.to
        const devResult = await this.fetchWithTimeout('https://dev.to/api/articles?per_page=6&top=1');

        const devItems = devResult && Array.isArray(devResult)
            ? devResult.map(item => ({
                category: item.tag_list[0] ? `DEV // ${item.tag_list[0].toUpperCase()}` : 'DEV // TECH',
                type: 'dev',
                title: item.title,
                description: item.description || 'Explora este artículo técnico en la red...',
                image: item.cover_image || item.social_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
                date: new Date(item.published_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
                url: item.url
            }))
            : [];

        this.items = devItems;

        if (this.items.length === 0) {
            this.items = [
                {
                    category: 'SYS // LOCAL',
                    type: 'dev',
                    title: 'Sin conexión a feeds externos. Verifique su enlace de red.',
                    description: 'Sistema operando en modo desconectado.',
                    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
                    date: 'HOY',
                    url: '#'
                }
            ];
        }

        this.render();
    }

    render() {
        this.track.innerHTML = '';
        this.dotsContainer.innerHTML = '';

        this.items.forEach((item, idx) => {
            const card = document.createElement('article');
            card.className = 'news-card-visual';
            card.innerHTML = `
                <div class="news-thumb-container">
                    <img src="${item.image}" alt="News thumb" class="news-thumb" loading="lazy">
                    <span class="news-badge ${item.type}">${item.category}</span>
                </div>
                <div class="news-info">
                    <div class="news-meta">
                        <span class="news-date">${item.date}</span>
                    </div>
                    <h4 class="news-title-v2">${item.title}</h4>
                    <p class="news-desc">${item.description}</p>
                </div>
                <a class="news-link-btn" href="${item.url}" target="_blank" rel="noopener">LEER_ARTÍCULO ↗</a>
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