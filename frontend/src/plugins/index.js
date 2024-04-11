import Notifications from '@kyvg/vue3-notification';

import { loadFonts } from './webfontloader';
import vuetify from './vuetify';
import router from './router';
import store from './store';


export function registerPlugins(app) {
  loadFonts();
  app
    .use(Notifications)
    .use(store)
    .use(vuetify)
    .use(router);
}
