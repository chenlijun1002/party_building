import * as types from './mutation-types';
import {
  cloneObj
} from "../assets/common/utils";
import {
  perSortList,
  dateSortList,
  genjinSortList
} from '@/assets/common/utils';

let currentType = 0

export const changeNewsId = function ({
  commit
}, newsId) {
  commit(types.CHANGE_NEWSID, newsId)
}
export const changeTab = function ({
  commit
}, type) {
  commit(types.CHANGE_TAB, type)
}

