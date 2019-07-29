<template>
  <footer class="home_footer" @touchmove.prevent>
    <div @click.stop="changeHomeTab('/',1)" replace>
      <img v-show="getHomeTab!==1" class="iconfont" src="../../assets/imgs/home_footer_icon_a.png" />
      <img v-show="getHomeTab===1" class="iconfont" src="../../assets/imgs/home_footer_icon_a_s.png" />
      <p :class="{'curr_tab':getHomeTab === 1}">首页</p>
    </div>
    <div @click.stop="changeHomeTab('/focus_news',2)" replace>
      <img v-show="getHomeTab!==2" class="iconfont" src="../../assets/imgs/home_footer_icon_b.png" />
      <img v-show="getHomeTab===2" class="iconfont" src="../../assets/imgs/home_footer_icon_b_s.png" />
      <p :class="{'curr_tab':getHomeTab === 2}">新闻</p>
    </div>
    <div @click.stop="changeHomeTab('/partyCourse',3)" replace>
      <img v-show="getHomeTab!==3" class="iconfont" src="../../assets/imgs/home_footer_icon_c.png" />
      <img v-show="getHomeTab===3" class="iconfont" src="../../assets/imgs/home_footer_icon_c_s.png" />
      <p :class="{'curr_tab':getHomeTab === 3}">党校</p>
    </div>
    <div @click.stop="changeHomeTab('/archives',4)" replace>
      <img v-show="getHomeTab!==4" class="iconfont" src="../../assets/imgs/home_footer_icon_d.png" />
      <img v-show="getHomeTab===4" class="iconfont" src="../../assets/imgs/home_footer_icon_d_s.png" />
      <p :class="{'curr_tab':getHomeTab === 4}">组织</p>
    </div>
    <div @click.stop="changeHomeTab('/my',5)" replace>
      <img v-show="getHomeTab!==5" class="iconfont" src="../../assets/imgs/home_footer_icon_e.png" />
      <img v-show="getHomeTab===5" class="iconfont" src="../../assets/imgs/home_footer_icon_e_s.png" />
      <p :class="{'curr_tab':getHomeTab === 5}">个人</p>
    </div>
  </footer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'homeFooter',
  computed: {
    ...mapGetters([
      'getHomeTab'
    ])
  },
  mounted() {
  },
  methods: {
    changeHomeTab(router,type){
      if(router) this.$router.replace(router)
      this.changeTab(type)
    },
    ...mapActions([
      'changeTab'
    ])
  }
}
</script>

<style>
.home_footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55px;
  z-index: 77;
  background-color: white;
  box-shadow: 0 -2px 8px 0 rgba(0, 0, 0, 0.05);
}
.home_footer div {
  text-decoration: none;
  /* flex: 1; */
  width: 20%;
  float: left;
  height: 60px;
  text-align: center;
  position: relative;
  font-size: 0;
}
.home_footer div p {
  font-size: 12px;
  margin-top: 3px;
  color: #888;
}
.home_footer div p.curr_tab{
  color:#C10710;
}
.home_footer div .iconfont {
  display:block;
  width: 23px;
  height:23px;
  margin: 7px auto 0;
}
</style>