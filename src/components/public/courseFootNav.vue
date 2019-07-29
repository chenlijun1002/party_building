<template>
  <footer class="home_footer" @touchmove.prevent>
    <div @click.stop="changeHomeTab('/',1)" replace>
      <img v-show="type!=='/'" class="iconfont" src="../../assets/imgs/back.jpg" />
      <img v-show="type==='/'" class="iconfont" src="../../assets/imgs/back.jpg" height="40" width="48" />
      <p :class="{'curr_tab':type === '/'}">首页</p>
    </div>   
    <div class="nav-box">
      <div @click.stop="changeHomeTab('/partyCourse',3)" replace>
      <img v-show="type!=='/partyCourse'" class="iconfont" src="../../assets/imgs/course.jpg" />
      <img v-show="type==='/partyCourse'" class="iconfont" src="../../assets/imgs/course_s.jpg" />
      <p :class="{'curr_tab':type === '/partyCourse'}">课程</p>
    </div>
    <div @click.stop="changeHomeTab('/courseCategroy',4)" replace>
      <img v-show="type!=='/courseCategroy'" class="iconfont" src="../../assets/imgs/category.jpg" />
      <img v-show="type==='/courseCategroy'" class="iconfont" src="../../assets/imgs/category_s.jpg" />
      <p :class="{'curr_tab':type === '/courseCategroy'}">分类</p>
    </div>
    <div @click.stop="changeHomeTab('/myCourse',5)" replace>
      <img v-show="type!=='/myCourse'" class="iconfont" src="../../assets/imgs/my.jpg" height="48" width="48" />
      <img v-show="type==='/myCourse'" class="iconfont" src="../../assets/imgs/my_s.jpg" />
      <p :class="{'curr_tab':type === '/myCourse'}">我的</p>
    </div>
    </div>
  </footer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'homeFooter',
 
  created(){
    console.log(this.$router,999)
    //this.type=this.$router.history.current.fullPath;
  },
  computed: {
    ...mapGetters([
      'getHomeTab'
    ]),
    type:function(){
      return this.$router.history.current.fullPath;
    }
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

<style scoped>
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
.home_footer .nav-box {
  display: table;
  width: 70%;
}
.home_footer .nav-box div {
  display: table-cell;
  width: 33.333333%;
}
.home_footer >div {
  text-decoration: none;
  /* flex: 1; */
  width: 30%;
  float: left;
  height: 60px;
  text-align: center;
  position: relative;
  font-size: 0;
  border-right: 1px solid #DBDBDB;
  box-sizing: border-box;
}
.home_footer >div p {
  font-size: 12px;
  margin-top: 3px;
  color: #888;
}
.home_footer >div p.curr_tab{
  color:#C10710;
}
.home_footer >div .iconfont {
  display:block;
  width: 23px;
  height:23px;
  margin: 7px auto 0;
}
</style>