import { ClockWidget } from './modules/ClockWidget.js';
import { NotesWidget } from './modules/NotesWidget.js';
import { NewsWidget } from './modules/NewsWidget.js';
import { AnimeWidget } from './modules/AnimeWidget.js';

const clockModule = new ClockWidget({
    city: 'Cartagena',
    country: 'Colombia',
    lat: 10.3910,
    lon: -75.4794
});

const notesModule = new NotesWidget(350);
const newsModule = new NewsWidget();
const animeModule = new AnimeWidget();

clockModule.init();
notesModule.init();
newsModule.init();
animeModule.init();