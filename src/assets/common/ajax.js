import Axios from 'axios';
import Vue from 'vue';
import {
  BASE_URL
} from "./utils";

Vue.prototype.$ajax = Axios;
export default function $ajax(data) {
  data.url = BASE_URL + data.url;
  data.data = data.data ? data.data : '';
  data.method = data.method ? data.method : 'POST'
  Axios({
    method: data.method,
    url: data.url,
    data: data.data
  }).then(res => {
    data.success && data.success(res.data)
  }).catch(res => {
    data.error && data.error(res)
  })
}

