export class NotesWidget{
    constructor(maxChars = 400) {
        this.maxChars = maxChars;
        this.storegeKey = 'cyberos_notebook_pages';
        this.pages = this.loadPages();
        this.currentIndex = 0;
        this.isOpen = true;

        this.toggleBtn = document.getElementById('notebook-btn');
        this.pagesBar = document.getElementById('notes-pages-bar');
        this.editor = document.getElementById('note-editor');
        this.counter = document.getElementById('note-counter');
        this.status = document.getElementById('note-status');
        this.clearBtn = document.getElementById('note-clear');
    }

    init() {
        // Desplegar hojas
        this.toggleBtn.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            this.pagesBar.classList.toggle('open', this.isOpen);
            this.toggleBtn.textContent = this.isOpen ? ' Book ▲' : ' Book ▼';
        });

        // Guardar automáticamente e
        this.editor.addEventListener('input', () => {
            this.pages[this.currentIndex] = this.editor.value;
            this.savePages();
            this.updateCounter();
        });

        // Limpiar el texto de la hoja
        this.clearBtn.addEventListener('click', () => {
            this.pages[this.currentIndex] = '';
            this.editor.value = '';
            this.savePages();
            this.updateCounter();
        });

        this.pagesBar.classList.add('open');
        this.toggleBtn.textContent = ' Book ▲';
        this.renderTabs();
        this.loadCurrentPage();
    }
    //loag
    loadPages(){
        const saved = localStorage.getItem(this.storegeKey);
        return saved ? JSON.parse(saved) : ['','',''];

    }

    //save
    savePages(){
        localStorage.setItem(this.storageKey, JSON.stringify(this.pages));
        this.status.textContent = 'SAVED ✓';
        setTimeout(() => {
            this.status.textContent = 'SYNC: LOCAL_STORAGE';
        }, 1200);
    }
    renderTabs() {
        this.pagesBar.innerHTML = '';

        this.pages.forEach((_, index) => {
            const btn = document.createElement('button');
            btn.className = `page-tab ${index === this.currentIndex ? 'active' : ''}`;
            btn.textContent = `[0${index + 1}]`;
            btn.addEventListener('click', () => {
                this.currentIndex = index;
                this.renderTabs();
                this.loadCurrentPage();
            });
            this.pagesBar.appendChild(btn);
        });

        // Botón '+' para agregar nuevas hojas (estableci un maximo de 8)
        if (this.pages.length < 8) {
            const addBtn = document.createElement('button');
            addBtn.className = 'page-tab';
            addBtn.textContent = '+';
            addBtn.title = 'Nueva hoja';
            addBtn.addEventListener('click', () => {
                this.pages.push('');
                this.currentIndex = this.pages.length - 1;
                this.savePages();
                this.renderTabs();
                this.loadCurrentPage();
            });
            this.pagesBar.appendChild(addBtn);
        }
    }

    loadCurrentPage() {
        this.editor.value = this.pages[this.currentIndex] || '';
        this.updateCounter();
    }

    updateCounter() {
        const len = this.editor.value.length;
        this.counter.textContent = `${len} / ${this.maxChars}`;
        this.counter.style.color = len >= this.maxChars - 20 ? '#ff4d6d' : '#5c7a84';
    }

}