import { initializeDatabase } from './src/data/database.js';
import { app, BrowserWindow } from 'electron/main';

initializeDatabase(app);
