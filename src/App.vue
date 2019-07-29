<template>
  <div id="App">
    <!--<router-view></router-view>-->
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive" />
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive" />
  </div>
</template>

<script>
import wx from 'weixin-js-sdk'
import {mapGetters, mapActions} from 'vuex'
import { BASE_URL, BASE_URL2, HOST_URL, identify, cloneObj } from '@/assets/common/utils'
import signalR from 'signalr'
import jq from 'jquery'
let timeclock

export default {
  name: 'App',
  beforeCreate(){
    // jq.ajax({
    //   method: 'post',
    //   url:BASE_URL2 + '/user/login',
    //   data:{
    //     data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),
    //     token: "",
    //     loginMark: "api",        
    //   },
    //   async:false,
    //   success:function(res){
    //       console.log(res)
    //       window.localStorage.setItem("partyToken",res.data.baseinfo.token);
    //        window.localStorage.setItem("loginMark",res.data.baseinfo.loginMark);
    //       window.localStorage.setItem('partyUserId',res.data.baseinfo.userId);
    //   }
    //  })
  },
  created: function () {
   
  },
  methods: {

  },  
}
</script>

<style lang="scss">
@import './assets/font/font.css';
</style>
