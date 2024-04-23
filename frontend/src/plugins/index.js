import { loadFonts } from './webfontloader';

import Notifications from '@kyvg/vue3-notification';
import vuetify from './vuetify';
import router from './router';
import store from './store';

import errorHandler from './errorHandler';
import api from './../api/index.js';

export function registerPlugins(app) {
  loadFonts();
  app
    .use(Notifications)
    .use(store)
    .use(vuetify)
    .use(router)
    .use({
      install: (app) => {
        app.provide('errorHandler', errorHandler);
        app.provide('api', api);
      },
    });
}
