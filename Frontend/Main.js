import { ClockWidget } from './modules/ClockWidget.js';
import { NotesWidget } from './modules/NotesWidget.js';
import { NewsWidget } from './modules/NewsWidget.js';
import { AnimeWidget } from './modules/AnimeWidget.js';
import { WeatherWidget } from './modules/WeatherWidget.js';
import { ChartWidget } from './modules/ChartWidget.js';
import { RunnerWidget } from './modules/RunnerWidget.js';

document.addEventListener('DOMContentLoaded', () => {
    const widgets = [
        () => new ClockWidget({
            city: 'Cartagena',
            country: 'Colombia',
            lat: 10.3910,
            lon: -75.4794
        }).init(),
        () => new NotesWidget(350).init(),
        () => new NewsWidget().init(),
        () => new AnimeWidget().init(),
        () => new WeatherWidget().init(),
        () => new ChartWidget().init(),
        () => new RunnerWidget().init()
    ];

    widgets.forEach((initWidget) => {
        try {
            initWidget();
        } catch (error) {
            console.error('Error iniciando un módulo:', error);
        }
    });
});