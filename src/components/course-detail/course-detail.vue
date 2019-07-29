<template>
  <div class="container" ref="chapter_wrapper"> 
    <div class="img-box">
      <img :src="detail.courseImg"/>
      <div class="mask" v-show="detail.inMyPlan&&detail.progress!=100"></div>
      <button v-show="detail.inMyPlan&&detail.progress!=100" @click.stop="goplay()">继续上一次学习</button>
    </div>
    <div class="tab_list_panel">
      <div class="tab_item" :class="{'active':type === 0}" @click="changeType(0)">目录{{detail.test1}}</div>
      <div class="tab_item" :class="{'active':type === 1}" @click="changeType(1)">简介</div>
    </div>
    <div class="chapter_wrapper" ref="chapter_wrapper">      
      <div class="chapter_content">
        <div class="chapter-item" :class="{'active':selectedIds.indexOf(item.chapterId)>-1}" v-for="(item,index) in detail.chapterList" @click.stop="expandChildren(item.chapterId)" v-show="type==0">    
          <p class="chapter-title">
            <span class="text-ellipsis" style="width:85%;display:inline-block"><i class="circle-icon"></i>{{item.chapterName}}</span>            
            <img src="../../assets/imgs/more_icon.png" />
          </p>      
          <ul class="courseware" v-if="selectedIds.indexOf(item.chapterId)>-1">
            <li class="children-item" v-for="(val,idex) in item.coursewareList" @click.stop="play(val.coursewareType,val.coursewareId,item.chapterId,detail.currentsStudyId)">
              <div class="font17 relative"><img src="../../assets/imgs/file.png" class="file-icon"/><p class="text-ellipsis" style="width:70%">{{val.coursewareName}}</p></div>
              <span class="font15">{{formatSeconds(val.studyTime)}}/{{formatSeconds(val.coursewareTime)}}</span>
              <span class="status" :class="{'finished':val.isFinished}">{{val.isFinished?'已完成':'未完成'}}</span>
            </li>
          </ul>
        </div> 
        <button class="join-btn" v-if="!detail.inMyPlan&&type==0" @click="join">加入学习计划</button> 
    <button class="remove-btn" v-if="detail.inMyPlan&&type==0" @click="move">从计划中移除</button>  
        <div v-show="type==1" class="introduction">{{detail.courseIntroduction}}</div>                     
      </div>          
    </div> 
         
    <Loading v-show="loading" ></Loading>
    <Toast :show="show" v-on:hide="hideToast">{{toastText}}</Toast>
  </div>
</template>

<script>
var clipboard
import FootNav from '@/components/public/courseFootNav'
// import scroll from '@/components/scroll/scroll'
import Loading from '../Loading/Loading'
import Toast from '../Toast/Toast'
import Vue from 'vue'
import { BASE_URL2} from '@/assets/common/utils'
import $ from "jquery"
import BScroll from 'better-scroll'
import { mapGetters, mapActions } from 'vuex'
// import BScroll from 'better-scroll'

export default { 
  name: 'detail',
  data(){
    return {     
      type:0,
      detail:{}, 
      selectedIds:[],
      childrenCategory:[],
      categoryId:'',
      show:false,
      loading:true,
      loading2:true,
      toastText:'',
      token:'',
      loginMark:''     
    }
  },  
  methods: {    
    formatSeconds(value) {
	        var secondTime = parseInt(value);// 秒
	        var minuteTime = 0;// 分
	        var hourTime = 0;// 小时
	        if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
	            //获取分钟，除以60取整数，得到整数分钟
	            minuteTime = parseInt(secondTime / 60);
	            //获取秒数，秒数取佘，得到整数秒数
	            secondTime = parseInt(secondTime % 60);
	            //如果分钟大于60，将分钟转换成小时
	            if(minuteTime > 60) {
	                //获取小时，获取分钟除以60，得到整数小时
	                hourTime = parseInt(minuteTime / 60);
	                //获取小时后取佘的分，获取分钟除以60取佘的分
	                minuteTime = parseInt(minuteTime % 60);
	            }
	        }
	        var result = "" + parseInt(secondTime) + "秒";
 
	        if(minuteTime > 0) {
	        	result = "" + parseInt(minuteTime) + "分" + result;
	        }
	        if(hourTime > 0) {
	        	result = "" + parseInt(hourTime) + "小时" + result;
	        }
	        return result;
	  },
     hideToast(val){
      let that=this;
      this.show=val;
      this.hasClick=false;
      console.log(555,val); 
      if(this.detail.inMyPlan){              
        $.ajax({
          method:'get',
          url:BASE_URL2+`/partyCourse/getCourseDetailById?token=${that.token}&loginMark=${that.loginMark}&data=${JSON.stringify({"id":this.$route.params.id})}`,
          success:function(res){
            if(res.code==200){
             //that.detail=JSON.parse(JSON.stringify(res.data.data));
              that.detail.currentsStudyId=res.data.currentsStudyId;
              that.detail.inMyPlan=false;
            }
          }
        })
      }else{        
        $.ajax({
          method:'get',
          url:BASE_URL2+`/partyCourse/getCourseDetailById?token=${that.token}&loginMark=${that.loginMark}&data=${JSON.stringify({"id":this.$route.params.id})}`,
          success:function(res){
            if(res.code==200){
             //that.detail=JSON.parse(JSON.stringify(res.data.data));
              that.detail.currentsStudyId=res.data.currentsStudyId;
              that.detail.inMyPlan=true;
            }
          }
        })
      }
           
      //  this.$http.get(BASE_URL2+`/partynews/data?data=${this.$route.params.id}&token=${this.token}&loginMark=api`)
      //   .then(res1=>{
      //     that.newsDetailInfo=res1.data.data[0]||{};
      //     this.loading=false;
      // })
    },
    move(){
      let that=this;
      $.ajax({
        method:'post',
        url:BASE_URL2+`/partyCourse/MoveLearningPlan`,
        data:{
          token:that.token,
          loginMark:that.loginMark,
          data:JSON.stringify({id:this.$route.params.id})
        },
        success:function(res){
          if(res.code==200){
           //that.detail=JSON.parse(JSON.stringify(res.data.data));
            that.toastText='已移除学习计划';
            that.show=true;
          }
        }
      })
        // this.$http.post(BASE_URL2+`/partyCourse/MoveLearningPlan?token=${token}&loginMark=api&data=${{"id":this.$route.params.id}}`)
        // .then(res=>{         
        //   if(res.data.code==200){
        //    //that.detail=JSON.parse(JSON.stringify(res.data.data));
        //     this.toastText='已移除学习计划';
        //     this.show=true;
        //   }
        // })
    },
    join(){
      let that=this;
      $.ajax({
        method:'post',
        url:BASE_URL2+`/partyCourse/joinLearningPlan`,
        data:{
          token:that.token,
          loginMark:that.loginMark,
          data:JSON.stringify({id:this.$route.params.id})
        },
        success:function(res){
          if(res.code==200){
           //that.detail=JSON.parse(JSON.stringify(res.data.data));
            that.toastText='已加入学习计划';
            that.show=true;
          }
        }
      })
        // this.$http.post(BASE_URL2+`/partyCourse/joinLearningPlan?token=${token}&loginMark=api&data=${{"id":this.$route.params.id}}`)
        // .then(res=>{         
        //   if(res.data.code==200){
        //    //that.detail=JSON.parse(JSON.stringify(res.data.data));
        //     this.toastText='已加入学习计划';
        //     this.show=true;
        //   }
        // })
    },
    changeType(type){
      this.type=type;
      // this.loading2=true;
      // this.getChildrenCategory(id);
    },
    goplay(){
      let type='';
      let that=this;
     if(!that.detail.viewed.currentCoursewareId){
      //   for(let i=0;i<this.detail.chapterList.length;i++){
      //   if(this.detail.chapterList[i].chapterId==that.detail.viewed.currentChapterId){
      //     for(let j=0;j<this.detail.chapterList[i].coursewareList.length;j++){
      //       if(this.detail.chapterList[i].coursewareList[j].coursewareId==that.detail.viewed.currentCoursewareId){
      //         type=this.detail.chapterList[i].coursewareList[j].coursewareType;
      //       }
      //     }
      //   }
      // }
      type=this.detail.chapterList[0].coursewareList[0].coursewareType;
       if(type=='文件'){
        this.$router.push(`/pdf/${this.detail.chapterList[0].coursewareList[0].coursewareId}?chapterId=${this.detail.chapterList[0].chapterId}&studyId=${that.detail.currentsStudyId}`);
      }else if(type=='图文'){
        this.$router.push(`/text/${this.detail.chapterList[0].coursewareList[0].coursewareId}?chapterId=${this.detail.chapterList[0].chapterId}&studyId=${that.detail.currentsStudyId}`);
      }
     }else{
       type=that.detail.viewed.currentCourwareType;
        if(type=='文件'){
        this.$router.push(`/pdf/${that.detail.viewed.currentCoursewareId}?chapterId=${that.detail.viewed.currentChapterId}&studyId=${that.detail.currentsStudyId}`);
      }else if(type=='图文'){
        this.$router.push(`/text/${that.detail.viewed.currentCoursewareId}?chapterId=${that.detail.viewed.currentChapterId}&studyId=${that.detail.currentsStudyId}`);
      }
     }
     

    },
    play(type,id,chapterId,currentsStudyId){
      if(type=='文件'){
        this.$router.push(`/pdf/${id}?chapterId=${chapterId}&studyId=${currentsStudyId}`);
      }else if(type=='图文'){
        this.$router.push(`/text/${id}?chapterId=${chapterId}&studyId=${currentsStudyId}`);
      }else{
        this.$router.push(`/play/${id}`);
      }     
    },
    getCourseDetail(token,pull,callback){
      let that=this;
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getCourseDetailById?token=${token}&loginMark=${that.loginMark}&data=${JSON.stringify({"id":this.$route.params.id})}`,
        success:function(res){
          if(res.code==200){
           //that.detail=JSON.parse(JSON.stringify(res.data.data));
           that.detail=res.data;           
            console.log(res.data.data,41415)           
            if(callback && typeof callback === 'function') callback();
          }
        }
      })
        // this.$http.get(BASE_URL2+`/partyCourse/getCourseDetailById?token=${token}&loginMark=api&data=${JSON.stringify({"id":this.$route.params.id})}`)
        // .then(res=>{         
        //   if(res.data.code==200){
        //    //that.detail=JSON.parse(JSON.stringify(res.data.data));
        //    that.detail=res.data.data;           
        //     console.log(res.data.data,41415)           
        //     if(callback && typeof callback === 'function') callback();
        //   }
        // })
    },   
    lookDetail(id){
      this.$router.push(`/courseDetail/${id}`);
    },    
    expandChildren(id){
      if(this.selectedIds.indexOf(id)>-1){
        let index=this.selectedIds.findIndex((item)=>item==id);
        this.selectedIds.splice(index,1);
      }else{
        this.selectedIds.push(id);
      }
    }
  },
  created() { 
    const that=this;
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');  
    setTimeout(()=>{
      that.getCourseDetail(that.token,'',function(){
           that.loading=false;
        })
    },1000) 
    // this.$nextTick(()=>{      
    //   if (!this.chapter_wrapper) {
    //     this.chapter_wrapper = new BScroll(this.$refs.chapter_wrapper, {
    //       click: true,
    //     })       
    //   }      
    // })
  },
  activated() {
    //this.loadData();
     const that=this;  
     //that.token=window.localStorage.getItem('partyToken');
     that.getCourseDetail(that.token,'',function(){
           that.loading=false;
        })  
    // that.$http.post(BASE_URL2 + '/user/login',{ 
    //   data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),
    //   token: "",
    //   loginMark: "api"
    // })
    // .then(res => {
    //   console.log(res)
    //   if(res.data.code==200){
    //     console.log(res.data.data,456)
    //     that.token=res.data.data.baseinfo.token;        
    //     that.getCourseDetail(that.token,'',function(){
    //        that.loading=false;
    //     })
    //   }
    // })
    // .catch(e => console.log(e))
  },
  deactivated() {
    document.querySelector('#App').classList.remove('course-list');
  },
  beforeDestory() {
    document.querySelector('#App').classList.remove('course-list');
  },
  update() {
    
  },
  components: {
    // Progress,
    // scroll,
    Toast,
    Loading,
    FootNav
  }
}
</script>

<style scoped>
.container{
  background-color: #F4F5FA;
  /*height: 100%;*/
  /*padding-bottom: 24px;*/
}
.container .img-box{
  position: relative;
  height: 234px;
 overflow: hidden;
}
.container .img-box>img{
  width: 100%;
  /*height: 100%;*/
  height: 100%;
}
.container .img-box >.mask{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height:234px;
  background:rgba(0,0,0,0.55);  
}
.container .img-box>button{
  outline: 0;
  border: 0;
  width: 215px;
  /*height: 100%;*/
  height: 44px;
  border-radius: 22px;
  background-color: #fff;
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translate(-50%,0);
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


.chapter_wrapper{
  height: 100%;
}
/*.chapter-item{
  display: table;
  width: 100%;
}
*/
.chapter-title{ 
  height:55px;
  line-height: 55px;
  background:#fff;
  padding: 0 20px;
  font-size: 18px;
  border-bottom: 1px solid #dbdbdb;
}
.chapter-title img{
  width: 12px;
  float: right;
  margin-top: 16px;
  transform: rotate(90deg);
  transition: transform 0.3s;
}
.active .chapter-title img{
  width: 12px;
  float: right;
  margin-top: 16px;
  transform: rotate(-90deg);
}
.children-item{
  height: 84px;
  padding: 20px 0;
  box-sizing: border-box;
  /*line-height: 84px;*/
  padding-left: 80px;
  padding-right: 20px;
}
.circle-icon{
  display: inline-block;
  width: 12px;
  height: 12px;
  border:2px solid #CB373F;
  border-radius: 50%;
  margin-right: 12px;
}
.children-item .status{
  float: right;
  margin-top: -16px;
  font-size: 15px;
}
.finished{
  color: #C10710;
}
.font15{
  font-size: 15px;
}
.font17{
  font-size: 17px;
}
.ml10{
  margin-left: 10px;
}

.courseware{
  background-color: #fff;  
}
.courseware li{
  font-size: 17px;
}

.category-item.active{
  background-color: #fff;
  color: #C10710;
}
.relative{
  position: relative;
}
.file-icon{
  width: 20px;
  position: absolute;
  top: 0;
  left: -32px;
}
.fl{
  float: left;
}

.course_wrapper{
  height: 100%;
}
.introduction{
  background-color: #fff;
  padding: 32px 16px;
  font-size: 18px;
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
}
.bg-FF6428{
  background:#FF6428;
}
.mt16{
  margin-top:16px;
}
.mb16{
  margin-bottom:16px;
}
.join-btn{
  background-color: #C10710;
  height: 55px;
  border-radius: 6px;
  width: calc(100% - 32px);
  border:0;
  display: block;
  margin:24px auto;
  font-size: 17px;
  color: #fff;
}
.remove-btn{
  background-color: #DBDBDB;
  height: 55px;
  border-radius: 6px;
  width: calc(100% - 32px);
  border:0;
  display: block;
  margin:24px auto;
  font-size: 17px;
  color: #fff;
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
