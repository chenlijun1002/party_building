import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import lazyload from 'vue-lazyload'
import VueScroller from 'vue-scroller'
import webim from '@/assets/common/webim'
import VueDND from 'awe-dnd'
import 'signalr'

import 'amfe-flexible'
import 'styles/common.scss'
import 'styles/iconfont.css'
import { BASE_URL, BASE_URL2, HOST_URL, identify, cloneObj } from '@/assets/common/utils'
import moment from 'moment'
Vue.prototype.$moment = moment

import axios from 'axios'
import jq from 'jquery'
// jq.ajax({
//       method: 'post',
//       url:BASE_URL2 + '/user/login',
//       data:{
//         data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),
//         token: "",
//         loginMark: "api",        
//       },
//       async:false,
//       success:function(res){
//           console.log(res)
//           window.localStorage.setItem("partyToken",res.data.baseinfo.token);
//           window.localStorage.setItem('partyUserId',res.data.baseinfo.userId);
//           alert(1)
//       }
//      })
//axios.defaults.timeout = 30000
Vue.prototype.$http = axios
Vue.prototype.$ajax =jq;
// Vue.prototype.$ajax = {
//   get:function(url,data,success,error){
//     jq.ajax({
//       method:'get',
//       url:url,
//       data:data,
//       success:function(res){
//         if(success&& typeof success ==='function') success(res)
//       },
//       error:function(res){
//         if(error&& typeof error ==='function') error(res)
//       }
//     })
//   },
//   post:function(url,data,success,error){
//     jq.ajax({
//       method:'post',
//       url:url,
//       data:data,
//       success:function(res){
//         if(success&& typeof success ==='function') success(res)
//       },
//       error:function(res){
//         if(error&& typeof error ==='function') error(res)
//       }
//     })
//   }
// }
axios.interceptors.response.use(data => {
  // 响应成功关闭loading
  if (data.data.status == 500) {
    router.push({
      name: 'notweb'
    })
  } else if (data.data.status == 3) {
    router.replace({
      name: 'stop'
    })
  } else if (data.data.status == 5) {
    router.replace({
      name: 'logOutUser'
    })
  } else {
    return data
  }
})

Vue.use(lazyload, {
  error: '',
  loading: ''
})
Vue.use(VueScroller)
Vue.use(webim)
Vue.use(VueDND)

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  if (to.meta.totop) {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }
  next()
})

Vue.directive('title', {
  inserted: function (el, binding) {
    document.title = el.innerText
    el.remove()
  }
})
Vue.filter('date_edit', function (val) {
  return val.split(':')[0] + ':' + val.split(':')[1]
})

Vue.filter('dateformat', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  template: '<App/>'
})
