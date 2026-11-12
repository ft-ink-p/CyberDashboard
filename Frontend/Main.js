import { ClockWidget } from './modules/ClockWidget.js';

const clockModule = new ClockWidget({
    city: 'Cartagena',
    country: 'Colombia',
    lat: 10.3910,
    lon: -75.4794
});

clockModule.init();