import * as types from './mutation-types'

const mutations = {
  [types.CHANGE_NEWSID](state, newsId) {
    state.newsId=newsId;
  },
  [types.CHANGE_TAB](state, type) {
    state.homeTab=type;
  }
}

export default mutations
