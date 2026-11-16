# Arquitectura Frontend y Módulos (`Frontend/`)

La interfaz sigue una distribución tipo *tiling window manager* construida con **CSS Grid / Flexbox** y módulos nativos de **JavaScript ES6** sin frameworks externos.

---

## Ciclo de Inicialización (`Main.js`)

Al dispararse el evento `DOMContentLoaded`, `Main.js` instancia cada widget dentro de un bloque aislado `try / catch`. Este aislamiento garantiza que un fallo de red o de renderizado en un panel específico no interrumpa la ejecución del resto del espacio de trabajo.

## Estrategia Híbrida y Tolerancia a Fallos

Los módulos dependientes de datos externos (`WeatherWidget.js` y `ChartWidget.js`) implementan peticiones con límite de tiempo (`AbortController` a 2000 ms):

1. **Modo Conectado:** Consultan en primera instancia los endpoints locales de FastAPI (`http://127.0.0.1:8000/api/...`).
2. **Modo Autónomo (Fallback):** Si el backend local no responde, realizan la petición directamente contra las APIs públicas desde el navegador, manteniendo la interfaz operativa.

## Persistencia Local (`localStorage`)

El proyecto almacena estado del usuario directamente en el navegador sin requerir base de datos externa:

* **Notas (`NotesWidget.js`):** Guarda el contenido y las pestañas de hojas múltiples creadas por el usuario.
* **Puntuación Arcade (`TerminalWidget.js`):** Registra el puntaje máximo histórico del modo `snake` bajo la clave `cyber_snake_best`.

## Referencia de Comandos de la Terminal (`TerminalWidget.js`)

La consola superior derecha admite interacción mediante botonera o entrada de texto directa:

| Comando | Alias | Descripción |
| :--- | :--- | :--- |
| `neofetch` | `ascii` | Renderiza el logotipo ASCII y consulta `/api/sysinfo` para mostrar hardware real. |
| `3d` | `holo`, `3d_holo` | Inicializa una escena WebGL con **Three.js** y controles de rotación con el ratón. |
| `snake` | `game` | Ejecuta el mini-juego arcade sobre `<canvas>` controlable con flechas o `WASD`. |
| `matrix` | — | Inicia la animación generativa de caracteres en cascada. |
| `help` | — | Lista los comandos soportados dentro de la consola. |