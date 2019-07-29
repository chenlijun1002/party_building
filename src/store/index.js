import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import * as actions from './actions'
import * as getters from './getters'

Vue.use(Vuex)

const state = {
  newsId: '',
  homeTab:1
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
