<template>
  <div class="container">
    <div class="top">
      <p>正在学习的课程（{{courseInfo.length}}）</p>
      <mt-swipe :show-indicators="false" :auto="0">
        <mt-swipe-item v-for="(item,index) in courseInfo" :key="index">
         <div @click.stop="goDetail(item.id)" class="course_item">
            <div class="img-box" v-show="item.courseNum">
              <img :src="item.courseImg"/>
            </div>
            <p class="course-name" v-show="item.courseNum">{{item.courseName}}</p>
            <div class="mt16 mb16" v-show="item.courseNum">
              <Progress :height='5' :percentage='Number(item.process)' color='#FF6428'/>
            </div>
            <p class="progress-label" v-show="item.courseNum">
              <span>完成{{item.process}}% 丨 剩余{{item.remainingClassHours}}课时</span>
              <span class="right" v-show="item.dateTime">{{item.dateTime}}截止</span>
            </p>
          </div>
        </mt-swipe-item>
      </mt-swipe>

      <!-- <div @click.stop="goDetail(courseInfo.id)">
        <div class="img-box" v-show="courseInfo.courseNum">
          <img :src="courseInfo.courseImg"/>
        </div>
        <p class="course-name" v-show="courseInfo.courseNum">{{courseInfo.courseName}}</p>
        <div class="mt16 mb16" v-show="courseInfo.courseNum">
          <Progress :height='5' :percentage='courseInfo.process' color='#FF6428'/>
        </div>
        <p class="progress-label" v-show="courseInfo.courseNum">
          <span>完成{{courseInfo.process}}% 丨 剩余{{courseInfo.remainingClassHours}}课时</span>
          <span class="right" v-show="courseInfo.dateTime">{{courseInfo.dateTime}}截止</span>
        </p>
      </div> -->
      <div class="no-course" v-show="!courseInfo.length">目前未学习任何课程</div>
    </div>
    <div class="bg-f mb55">
      <div class="pt20 pl20 pr20">
      <p class="mb20 font22" @click="moreData">最新课程<span class="right-text">更多<img src="../../assets/imgs/more_icon.png" /></span></p>
     <!--   <scroll class="course_wrapper"
          :data="data"
          :pulldown="pulldown"
          @pulldown="loadData">
           <ul class="course_content">
          <li class="course-item" v-for="(item,index) in lists">
            <div class="course-item-content">
              <img src="https://img.xiaokeduo.com/Templates/t7/images/t7_25.jpg" />
              <p class="course_name text-ellipsis-2">习惯监督，光灯下显担当</p>
              <p class="num">阅读量 33333333</p>
            </div>
          </li>                               
        </ul>
          <div class="loading-wrapper">222</div>
        </scroll> -->
      <div class="course_wrapper" ref="course_wrapper">
       
       <ul class="course_content">
          <li class="course-item" v-for="(item,index) in lists" @click.stop="goDetail(item.id)">
            <div class="course-item-content">
              <img :src="item.courseImg" />
              <p class="course_name text-ellipsis-2">{{item.courseName}}</p>
              <p class="num">阅读量 {{item.ReadingNum||0}}</p>
            </div>
          </li>                               
        </ul>
          <!-- <div class="no_data">没有更多数据</div> -->
       <!--  <p v-show="!loading_false" class="no_data">数据加载中...</p> -->
        <p v-show="!lists.length" class="no_data">暂无最新课程</p>
      </div>
    </div>
    </div>
    <FootNav />
  </div>
</template>

<script>
var clipboard
import Progress from '@/components/progress/progress'
import FootNav from '@/components/public/courseFootNav'
//import scroll from '@/components/scroll/scroll'
import Vue from 'vue'
import { Swipe, SwipeItem } from 'mint-ui'
import { BASE_URL2} from '@/assets/common/utils'
import $ from "jquery"
import { mapGetters, mapActions } from 'vuex'
import BScroll from 'better-scroll'
Vue.component(Swipe.name, Swipe);
Vue.component(SwipeItem.name, SwipeItem);
export default {
  computed: {
  },
  name: 'Home',
  data(){
    return {
      pageIndex:1,
      percentage:90,
      courseInfo:[],
      lists:[],
      data: [],
      loading_false:true,
      pulldown: true,
      token:'',
      loginMark:''
    }
  },
  mounted() {
    //      this.copy_text();
  },
  methods: {
    goDetail(id){
      this.$router.push(`/courseDetail/${id}`);
    },
    getCourseInfo(token,callback){
      let that=this;
      console.log(BASE_URL2)
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getCourseUnderStudy?token=${token}&loginMark=${that.loginMark}`,       
        success:function(res){
          if(res.code==200){
            that.courseInfo=res.data;
            if(callback && typeof callback === 'function') callback();
          }
        }
      })
        // this.$http.get(BASE_URL2+`/partyCourse/getCourseUnderStudy?token=${token}&loginMark=api`)
        // .then(res=>{
        //   if(res.data.code==200){
        //     that.courseInfo=res.data.data;
        //     if(callback && typeof callback === 'function') callback();
        //   }
        // })
    },
    getNewCourseList(token,pull,callback){
      let that=this;
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getLatestCoursesList?token=${token}&loginMark=${that.loginMark}&data=${JSON.stringify({pageSize:10,pageIndex:this.pageIndex})}`,       
        success:function(res){
          if(res.code==200){
            that.lists=res.data.courseList;
            if(callback && typeof callback === 'function') callback();
          }
        }
      })
        // this.$http.get(BASE_URL2+`/partyCourse/getLatestCoursesList?token=${token}&loginMark=api&data=${JSON.stringify({pageSize:10,pageIndex:this.pageIndex})}`)
        // .then(res=>{
        //   if(res.data.code==200){
        //     that.lists=res.data.data.courseList;
        //     if(callback && typeof callback === 'function') callback();
        //   }
        // })
    },
     moreData() {
        this.$router.push(`/latestCourse`);
    }   
  },
  created() {
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    //this.loadData();
    // let that=this;
    // this.$nextTick(()=>{
    //   if (!this.course_wrapper) {
    //     this.course_wrapper = new BScroll(this.$refs.course_wrapper, {
    //       probeType: 2, // 加这个属性才能监听到滑动
    //       bounce: true,
    //       click: true,
    //       startX: 0,
    //       startY: 0,
    //       pullUpLoad: {
    //         threshold: 20, // 负值是当上拉到超过低部 70px；正值是距离底部距离时，
    //       }
    //     })
    //     this.course_wrapper.on('pullingUp', () => {
    //     this.pageIndex++;  
    //     console.log(1); 
    //     that.loading_false=false,   
    //     this.getNewCourseList(that.token,'pull')
    //   })
    //   } else {
    //     this.course_wrapper.refresh();
    //   }
      
    // })
  },
  activated() {
      const that=this; 
     // that.token=window.localStorage.getItem('partyToken');   
      that.getCourseInfo(that.token,function(){
          that.getNewCourseList(that.token,'',function(){
            that.loading=false;
          })
        }) 
    // that.$ajax.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
    // .then(res => {      
    //   if(res.data.code==200){
    //     that.token=res.data.data.baseinfo.token;        
    //     that.getCourseInfo(that.token,function(){
    //       that.getNewCourseList(that.token,'',function(){
    //         that.loading=false;
    //       })
    //     })
    //   }
    // })
    // .catch(e => console.log(e))
  },
  deactivated() {
    
  },
  beforeDestory() {

  },
  update() {
    
  },
  components: {
    Progress,
   // scroll,
    FootNav
  }
}
</script>

<style>
  /*#App{
  margin-bottom: 55px;
  height: auto;
   
  }*/
</style>
<style scoped>
.mint-swipe{
  height:300px;
}
.container{
  background-color: #F4F5FA;
}
.top{
  /*height: 330px;*/
  padding:20px;
  box-sizing: border-box;
  min-height: 180px;
}
.top > p,.course_item p{
  text-align: center;
  font-size: 18px;
  color: #000;
}
.top .course_item .img-box{
  padding:26px 0;
  text-align: center;
  /*line-height: 145px;*/
}
.top .course_item .img-box img{
  width: 235px;
  height: 145px;
  border-radius: 10px;
}
.course_item .course-name{
  font-size: 18px;
  color: #666;
  text-align: center;
}
.no-course{
  text-align: center;
  font-size: 18px;
  color: #999;
  line-height: 110px;
}
.mt16{
  margin-top:16px;
}
.mb16{
  margin-bottom:16px;
}
.top .course_item .progress-label{
  text-align: left;
  color: #999999;
  margin-bottom: 20px;
}
.course_item .progress-label .right{
  float:right;
}
.course_wrapper{
 /* height: 504px;*/
  background: #fff;
  /*overflow: hidden;*/
}
.right-text{
  float:right;
  font-size: 15px;
}
.right-text img{
  width: 10px;
    height: 15px;
    vertical-align: middle;
    margin-top: -3px;
    margin-left: 8px;
}
.course-item{
  /*width: 50%*/;
  width: 164px;
  display: inline-block;
  box-sizing: border-box;
  overflow: hidden;
}
.course-item-content{
  margin: 0 auto;
  width: 160px;
}
.course-item-content >.course_name{
  font-size: 14px;
  color: #000;
  height: 38px;
}
.course-item-content >.num{
  font-size: 14px;
  color: #999;  
}
.course-item-content >img{
  width: 160px;
  height: 100px;
}
.no_data{
  font-size:16px;
  line-height:40px;
  text-align:center;
  margin-top:20px;
  color:#999;
}
.font22{
  font-size: 22px;
}
.mb20{
  margin-bottom: 20px !important;
}
.mb55{
  margin-bottom: 55px !important;
}
.pt20{
  padding-top:20px !important;
}
.pl20{
  padding-left:20px !important;
}
.pr20{
  padding-right:20px !important;
}
.bg-f{
  background-color:#fff; 
}
.pt0{
  padding-top:0 !important;
}
.pr4{
  padding-right:4px !important;
}
.left-line{
  position:relative;
}
.left-line::before{
  content:'';
  position:absolute;
  left: 0;
  top: -2px;
  height:24px;
  width:1px;
  border-left:2px solid #CB373F;
}
.pb0{
  padding-bottom:0 !important;
}
</style>
