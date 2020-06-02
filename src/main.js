import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket'
import VueMeta from 'vue-meta'

import App from './App.vue'
import router from './router'
import store from './store'

import './registerServiceWorker'

require('bootstrap/dist/css/bootstrap.min.css')
require('bootstrap/dist/js/bootstrap.min.js')

Vue.config.productionTip = false

Vue.use(VueNativeSock, 'ws://exalted-justice-266607.appspot.com', {
  store,
  format: 'json',
  reconnection: true,
  reconnectionDelay: 1000
})

Vue.use(VueMeta)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
