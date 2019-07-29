<template>
  <div class="container"> 
    <div class="tab_list_panel">
      <div class="tab_item" :class="{'active':type === 0}" @click="changeType(0)">学习中</div>
      <div class="tab_item" :class="{'active':type === 1}" @click="changeType(1)">已完成</div>
    </div>
    <div class="pl20 pr20 box">
      <div class="mycourse_wrapper" ref="mycourse_wrapper">      
        <ul class="categoryCourse_content">
          <li class="categoryCourse-item" v-for="(item,index) in lists" @click.stop="lookDetail(item.id)">
            <div class="img-box">
              <img :src="item.courseImg" />
            </div>
            <div class="text-box">              
              <h6 class="course-title text-ellipsis-1">{{item.courseName}}</h6>
              <!-- <p class="descript text-ellipsis-1">{{"item.intervalpublishtime"}}</p>
              <p class="num">阅读<span class="ml10">{{111222}}</span></p> -->
              <div class="mt26 mb15">
                <Progress :height='5' :percentage='Number(item.process)' color='#FF6428'/>
              </div>
              <p class="progress-label">
                <span>完成{{Number(item.process)}}%</span>
                <span class="right" v-if="item.dateTime">{{item.dateTime?item.dateTime.substr(0,11):''}}截止</span>
              </p>
            </div>
          </li> 
           <div class="bottom-tip" v-show="lists.length">
              <span class="loading-hook">{{pullupMsg}}</span>
          </div>                               
        </ul>          
         <div v-show="!total" class="empty">
          <img src='../../assets/imgs/empty.png'/>
          <p class='text'>暂无内容</p>
        </div>
        <Loading v-show="loading2" top="center" position='absolute'></Loading>       
      </div>     
    </div>   
    <FootNav />       
    <Loading v-show="loading" ></Loading>
  </div>
</template>

<script>
var clipboard
import FootNav from '@/components/public/courseFootNav'
import Progress from '@/components/progress/progress'
// import scroll from '@/components/scroll/scroll'
import Loading from '../Loading/Loading'
import Vue from 'vue'
import { BASE_URL2} from '@/assets/common/utils'
import $ from "jquery"
import Bscroll from 'better-scroll'
import { mapGetters, mapActions } from 'vuex'
// import BScroll from 'better-scroll'

export default {
  computed: {
  },
  name: 'Home',
  data(){
    return {
      pageIndex:1,
      percentage:90,
      total:0,
      type:0,
      lists:[], 
      token:'',
      loginMark:'',
      categoryId:'',
      loading:true,
      loading2:true, 
      loadingData:false,
      pullupMsg: '没有更多数据',    
    }
  },
  mounted() {
    //      this.copy_text();
  },
  methods: {
    changeType(type){
      this.type=type;
      this.pageIndex=1;
      this.loading2=true;
      let that=this;
      if(type==0){
        this.getCourseUnderStudyList(this.token,'',function(res1){
          //that.categoryId=res1.data.data.classificationList[0].id;
          //let id=res1.data.data.classificationList[0].id;
          that.loading2=false;
          that.loading=false;
       
        });
      }else{
        this.getCompletedCourses(this.token,'',function(res1){
          //that.categoryId=res1.data.data.classificationList[0].id;
          //let id=res1.data.data.classificationList[0].id;
          that.loading2=false;
          that.loading=false;
       
        });
      }
    },
    getCompletedCourses(token,pull,callback){
       let that=this;      
      if(that.loadingData){
        return
      }
      that.loadingData=true;
       $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getCompletedCourses?token=${token}&loginMark=${that.loginMark}&data=${JSON.stringify({pageSize:10,pageIndex:this.pageIndex})}`,       
        success:function(res){
          if(res.code==200){            
            that.total=res.data.total;                       
            if(pull!=='pull'){
              that.lists=res.data.courseList;
              that.loadingData=false;
              that.loading=false;
              that.loading2=false;
             }else{
              that.pullupMsg = '加载中...';
             }
            if(callback && typeof callback === 'function') callback(res.data.courseList);
          }
        }
      })
       // this.$http.get(BASE_URL2+`/partyCourse/getCompletedCourses?token=${token}&loginMark=api&data=${JSON.stringify({pageSize:10,pageIndex:this.pageIndex})}`)
       //  .then(res=>{
       //    if(res.data.code==200){
       //      console.log(res.data.data)
       //      that.lists=res.data.data.courseList;
       //      that.total=res.data.data.total;
       //      //this.categoryId=this.firstCategory[0].id;
       //      if(callback && typeof callback === 'function') callback(res);
       //    }
       //  })
    },
    getCourseUnderStudyList(token,pull,callback){
       let that=this;      
      if(that.loadingData){
        return
      }
      if(pull ==='pull'){
        that.pageIndex++;
      }
      that.loadingData=true;
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getCourseUnderStudyList?token=${token}&loginMark=${that.loginMark}&data=${JSON.stringify({pageSize:10,pageIndex:this.pageIndex})}`,       
        success:function(res){
          if(res.code==200){            
            that.total=res.data.total;
            
            if(pull!=='pull'){
              that.lists=res.data.courseList;
              that.loadingData=false;
              that.loading=false;
              that.loading2=false;
             }else{
              that.pullupMsg = '加载中...';
             }
            if(callback && typeof callback === 'function') callback(res.data.courseList);
          }
        }
      })
       // this.$http.get(BASE_URL2+`/partyCourse/getCourseUnderStudyList?token=${token}&loginMark=api&data=${JSON.stringify({pageSize:10,pageIndex:this.pageIndex})}`)
       //  .then(res=>{
       //    if(res.data.code==200){
       //      console.log(res.data.data)
       //      that.lists=res.data.data.courseList;
       //      that.total=res.data.data.total;
       //      //this.categoryId=this.firstCategory[0].id;
       //      if(callback && typeof callback === 'function') callback(res);
       //    }
       //  })
    },
    lookDetail(id){
      this.$router.push(`/courseDetail/${id}`);
    },
    
  },
  created() {    
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    // this.$nextTick(()=>{      
    //   if (!this.mycourse_wrapper) {
    //     this.mycourse_wrapper = new BScroll(this.$refs.mycourse_wrapper, {
    //       click: true,
    //     })       
    //   }
    // })
    this.getCourseUnderStudyList(this.token,'')
    let that=this;
    that.$nextTick(() => {
      if (!that.scroll) {
        that.scroll = new Bscroll(that.$refs.mycourse_wrapper, {
          probeType: 1, // 加这个属性才能监听到滑动
          bounce: true,
          click: true,
          startX: 0,
          startY: 0,
          pullUpLoad: {
            threshold: 30, // 负值是当上拉到超过低部 70px；正值是距离底部距离 时，
          }
        })
        that.scroll.on('scroll', (pos) => {                    
          if(pos.y<(this.scroll.maxScrollY - 30)){
            that.pageIndex++;
            if(that.type==0){
              that.getCourseUnderStudyList(that.token,'pull',function(res){              
                setTimeout(()=>{
                      if(res.length){
                        that.pullupMsg = '加载中...';
                        that.lists = that.lists.concat(res);                                    
                          that.scroll.refresh();
                         that.loadingData=false;
                      }else{
                        that.pullupMsg = '没有更多数据';
                        //that.scroll.finishPullUp();
                      }
                          
              },1000)
            })
          }else{
            that.getCompletedCourses(that.token,'pull',function(res){
              //that.loadingData=true;
                setTimeout(()=>{
                      if(res.length){
                        that.pullupMsg = '加载中...';
                        that.lists = that.lists.concat(res);                                    
                          that.scroll.refresh();
                         that.loadingData=false;
                      }else{
                        that.pullupMsg = '没有更多数据';
                        //that.scroll.finishPullUp();
                      }
                          
              },1000)
            })
          }
        }
      })
    } else {
        that.scroll.refresh()
    }
    })
  },
  activated() {
   // this.loadData();
     const that=this;
     //that.token=window.localStorage.getItem('partyToken');
      // that.getCourseUnderStudyList(that.token,function(res1){
      //     //that.categoryId=res1.data.data.classificationList[0].id;
      //     //let id=res1.data.data.classificationList[0].id;
      //     that.loading2=false;
      //     that.loading=false;
       
      //   })
    // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
    // .then(res => {
    //   if(res.data.code==200){
    //     that.token=res.data.data.baseinfo.token;        
    //     that.getCourseUnderStudyList(that.token,function(res1){
    //       //that.categoryId=res1.data.data.classificationList[0].id;
    //       //let id=res1.data.data.classificationList[0].id;
    //       that.loading2=false;
    //       that.loading=false;
       
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
    Loading,
    FootNav
  }
}
</script>

<style>
 /* html,body{
  height: 100%;
}
#App{
   height: calc(100% - 55px);
}*/
</style>
<style scoped> 
.bottom-tip{
        width: 100%;
        height: 35px;
        line-height: 35px;
        text-align: center;
        color: #777;
        font-size: 14px;
        /*background: #f2f2f2;
        position: absolute;
        bottom: -35px;
        left: 0;*/
    }
.container{
  background-color: #fff;
  /*height: 100%;*/
  position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 55px;
}
.container >div.box{
  position: relative;
  height: calc(100% - 55px);
  padding-top: 15px;
  box-sizing: border-box;  
}
.mycourse_wrapper{
    height: 100%;
  /*height: calc(100% - 35px);*/
   /*margin-bottom: 120px;*/
}
.categoryCourse-item{
  padding:15px 0;
  display: table;
  width: 100%;
}
.img-box{
  display: table-cell;
  width:120px;
  height:75px;
  font-size: 0;
  vertical-align: middle;
  /*background:#C10710;*/
}
.img-box>img{
  width: 100%;
  /*height: 100%;*/
  height: 86px;
}
.text-box{
  display: table-cell;
  padding-left: 15px;
  box-sizing: border-box;
  width: calc(100% - 120px);
  overflow: hidden;  
}
.text-box .course-title{
  color: #000;
  font-size: 16px;
  width: 200px;  
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.text-box .descript{
  padding-top:14px;
  padding-bottom:16px;
  color: #999;
  font-size: 14px;
  width: 200px;  
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.text-box .num{
  color: #999;
  font-size: 14px;
}
.ml10{
  margin-left: 10px;
}

.tab_list_panel{
  display:table;
  width:100%;
  height:52px;
  line-height:52px;
  border-bottom:1px solid #DBDBDB;
  position:relative;
  z-index:10;
  background:#fff;
}
.tab_list_panel .tab_item{
  display:table-cell;
  width:25%;
  text-align:center;
  font-size:15px;
  color:#666;
}
.tab_list_panel .tab_item.active{
  color:#C10710;
  border-bottom:3px solid #C10710;
}
.progress-label{
  text-align: left;
  color: #999999;
 /* margin-bottom: 20px;*/
  font-size: 14px;
}
.progress-label .right{
  float:right;
}
.mt26{
  margin-top: 26px;
}
.mb15{
  margin-bottom: 15px;
}
.empty{
  text-align:center;
  margin-top:80px;
}
.empty  img{  
  max-width:227px;
  max-height:216px;
}
.text{
  text-align:center;
  font-size:20px;
  color:#999;
  margin-top:20px;
}
.no_data{
  font-size:16px;
  line-height:40px;
  text-align:center;
  margin-top:20px;
  color:#999;
}
/*.category-item.active{
  background-color: #fff;
  color: #C10710;
}
.left{
  width:127px;
  height: 100%;
}
.fl{
  float: left;
}
.right{
  margin-left: 127px;
  height: 100%;
}
.right>div{
  position: relative;
  height: calc(100% - 20px);
}
.right>div>.course_wrapper{
  height: 100%;
}
.course-item{
  display: inline-block;
  width: 50%;
  margin-bottom: 10px;
}
.course-item-content{
  width:100px;
  height:100px;
  background:#C10710;
  border-radius:12px;
  margin: 0 auto;
  text-align: center;
  line-height: 100px;
  color: #fff;
  font-size: 18px;
}*/
.bg-FF6428{
  background:#FF6428;
}
.mt16{
  margin-top:16px;
}
.mb16{
  margin-bottom:16px;
}
/*.top .progress-label{
  text-align: left;
  color: #999999;
  margin-bottom: 20px;
}
.progress-label .right{
  float:right;
}
.course_wrapper{
  height: 504px;
  background: #fff;
  overflow: hidden;
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
}
.course-item{
  width: 50%;
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
}*/
.mb20{
  margin-bottom: 20px !important;
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
