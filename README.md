# ⚡ CyberOS // Tiling Dashboard

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Architecture](https://img.shields.io/badge/Architecture-Modular_OOP-00f0ff?style=flat-square)

Panel de control web interactivo con estética **Cyberpunk** e inspiración en gestores de ventanas en mosaico (*Tiling Window Managers* de Linux como `i3wm` y `bspwm`). Diseñado bajo una arquitectura modular orientada a objetos y optimizado para consumir mínimos recursos de memoria RAM.

---

## 🧩 Arquitectura del Proyecto

Cada ventana (*tile*) del dashboard funciona como un módulo independiente encapsulado en su propia clase dentro de `Frontend/modules/`, controlado desde un punto de entrada central (`Main.js`).

```text
CyberDashboard/
├── Frontend/
│   ├── modules/
│   │   └── ClockWidget.js    # Reloj analógico (Canvas), hora digital y clima en vivo
│   ├── Index.html            # Maqueta estructural en mosaico (CSS Grid)
│   ├── style.css             # Estilos neón, transparencias y scroll personalizado
│   └── Main.js               # Orquestador principal de módulos ES6
├── .gitignore
└── README.md
```

---

## 🚀 Módulos y Estado de Desarrollo

- [x] **Maqueta Tiling UI:** Cuadrícula asimétrica con barras de estado superior e inferior (`sticky`), transparencias y scroll vertical.
- [x] **ClockWidget (`ClockWidget.js`):** Reloj analógico dibujado mediante trigonometría en HTML5 `<canvas>`, reloj digital sincronizado, fecha localizada y consulta meteorológica en tiempo real mediante la API de **Open-Meteo** (sin necesidad de API Key).
- [ ] **TerminalWidget:** Simulación de consola estilo `neofetch` con arte ASCII y especificaciones del sistema.
- [ ] **NotesWidget:** Bloc de notas rápido con persistencia local (`localStorage`).
- [ ] **ChartWidget:** Gráfica de telemetría dinámica en `<canvas>`.
- [ ] **PacmanWidget:** Mini animación retro integrada en ventana.
- [ ] **News & Media Widgets:** Feed de noticias y visor visual personalizado.

---

## 🛠️ Ejecución Local

No requiere instalación de dependencias pesadas ni servidores externos:

1. Clona o descarga este repositorio.
2. Abre la carpeta `Frontend/Index.html` en cualquier navegador moderno o mediante el servidor integrado de **PyCharm / Live Server** (necesario para cargar módulos ES6 con `type="module"`).

---

## 👨‍💻 Autor

Desarrollado por **[@ft-ink-p](https://github.com/ft-ink-p)**
