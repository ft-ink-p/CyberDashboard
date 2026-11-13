export class AnimeWidget {
    constructor() {
        this.imgEl = document.getElementById('anime-img');
        this.artistEl = document.getElementById('anime-artist');
        this.refreshBtn = document.getElementById('anime-next');

        this.gifs = [
            { src: 'assets/cyber1.gif', label: 'SYS.LOOP // 01' },
            { src: 'assets/cyber2.gif', label: 'SYS.LOOP // 02' },
            { src: 'assets/cyber3.gif', label: 'SYS.LOOP // 03' },
            { src: 'assets/cyber4.gif', label: 'SYS.LOOP // 04' }
        ];
        this.currentIndex = 0;
    }

    init() {
        this.refreshBtn.addEventListener('click', () => this.nextGif());
        this.renderGif();
    }

    nextGif() {
        this.currentIndex = (this.currentIndex + 1) % this.gifs.length;
        this.imgEl.style.opacity = '0';
        setTimeout(() => {
            this.renderGif();
            this.imgEl.style.opacity = '0.85';
        }, 200);
    }

    renderGif() {
        const current = this.gifs[this.currentIndex];
        this.imgEl.src = current.src;
        this.artistEl.textContent = current.label;
    }
}