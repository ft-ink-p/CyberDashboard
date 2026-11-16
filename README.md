# CyberDashboard (`CyberOS // Tiling Workspace`)

![Estado](https://img.shields.io/badge/Estado-Demo_1_(v1.0)-00f0ff?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.13%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=threedotjs&logoColor=white)

Entorno de escritorio web modular con estética *tiling window manager* y terminal Linux, desarrollado sobre un backend ligero en **FastAPI** y una arquitectura frontend desacoplada en **JavaScript (ES6)**.

> **Nota de versión — Demo 1:** Este repositorio corresponde a la primera demostración funcional del proyecto. Su alcance se centra en la estructura base de la interfaz, la comunicación asíncrona cliente-servidor, la lectura de telemetría local y la integración de módulos gráficos interactivos.

---

## Arquitectura y Características Principales

El sistema está diseñado bajo un esquema híbrido: el servidor Python centraliza las consultas externas y expone métricas reales del equipo anfitrión, mientras que cada widget del frontend cuenta con lógica de respaldo para operar de forma autónoma si el backend local no se encuentra activo.

### Módulos Integrados

* **Terminal Híbrida Interactiva (`TerminalWidget.js`):** Consola de comandos funcional con selector rápido de modos y entrada por teclado (`neofetch`, `3d`, `snake`, `matrix`, `help`):
  * *Telemetría de sistema (`neofetch`):* Renderiza arte ASCII junto con especificaciones reales de CPU, memoria RAM, almacenamiento y tiempo de actividad obtenidas mediante `psutil`.
  * *Visor Holográfico (`3d`):* Escena WebGL construida con **Three.js** que renderiza una malla geométrica interactiva manipulable con el cursor.
  * *Arcade Integrado (`snake`):* Implementación jugable en `<canvas>` con persistencia de puntuación máxima en `localStorage`.
  * *Flujo de datos (`matrix`):* Animación generativa en cascada sobre canvas 2D.
* **Monitor Meteorológico (`WeatherWidget.js`):** Consulta condiciones atmosféricas y clasificación térmica en tiempo real (Open-Meteo API) para ciudades principales de Colombia (Cartagena, Bogotá, Medellín, Cali y Barranquilla).
* **Comparativa de Divisas (`ChartWidget.js`):** Gráfica de barras dinámica desarrollada con **Chart.js** que expresa la equivalencia del Peso Colombiano (COP) frente a USD, EUR, GBP, BRL y MXN.
* **Reloj Analógico y Digital (`ClockWidget.js`):** Sincronización horaria en tiempo real con visualización dual en canvas y formato digital.
* **Bloc de Notas Persistente (`NotesWidget.js`):** Sistema de hojas múltiples con guardado automático en el almacenamiento local del navegador.
* **Noticias, Visuales y Mini-juego (`NewsWidget.js`, `AnimeWidget.js`, `RunnerWidget.js`):** Panel de actualidad tecnológica, visor multimedia en bucle y mini-juego *endless runner* jugable por teclado o ratón.

---

## Estructura del Proyecto

```text
CyberDashboard/
├── Backend/
│   └── app.py                  # Servidor FastAPI, endpoints REST y montaje de estáticos
├── Frontend/
│   ├── assets/                 # Recursos gráficos y multimedia locales
│   ├── modules/                # Componentes ES6 independientes por widget
│   │   ├── AnimeWidget.js
│   │   ├── ChartWidget.js
│   │   ├── ClockWidget.js
│   │   ├── NewsWidget.js
│   │   ├── NotesWidget.js
│   │   ├── RunnerWidget.js
│   │   ├── TerminalWidget.js
│   │   └── WeatherWidget.js
│   ├── Index.html              # Estructura principal del espacio de trabajo
│   ├── Main.js                 # Punto de entrada e inicialización controlada de módulos
│   └── style.css               # Sistema de rejilla, variables de tema y estilos UI
├── docs/                       # Documentación técnica del proyecto (en desarrollo)
└── README.md
