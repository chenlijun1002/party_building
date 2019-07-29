<template>
<div style="height:100%">
  <div class="content" v-if="fileList.length>1">
    <h1 class="title">{{info.title}}：</h1>
    <ul class="file-box">
		<li v-for="(item,index) in fileList">
			<span class="text-ellipsis" style="width:55%;display:inline-block">{{splitFileName(item)}}</span>
			<button class="btn mr15" @click="open(item)">打开</button>
			<a :href="item" :download="splitFileName(item)"><button class="btn">下载</button></a>
		</li>
    </ul>
  </div>
  <iframe :src="fileList[0]" style="width:100%;height:100%" v-if="fileList.length==1"></iframe>
  <Loading v-show="loading" ></Loading>   
</div>  
</template>

<script>
import Loading from '../Loading/Loading'
import Vue from 'vue'
import { BASE_URL2} from '@/assets/common/utils'
import $ from "jquery"
//import pdf from 'vue-pdf'

export default {
  data(){
    return {
      pageIndex:1,
      percentage:90,
      type:0,
      info:{}, 
      fileList:[],
      token:'',
      categoryId:'',
      loading:true,
      loading2:true, 
      stadyTime:0,
      loginMark:'',
      chapterId:'',
      studyId:'',
      coursewareId:''  
    }
  },
  methods:{
    getQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.hash.substr(window.location.hash.indexOf('?')+1).match(reg);
      if (r != null) return unescape(r[2]); return null;
    },
  	splitFileName(text) {
  		let arr=text.split('/');
  		let txt = arr[arr.length-1];
	    var pattern = /\.{1}[a-z]{1,}$/;
	    if (pattern.exec(txt) !== null) {
	        return (txt.slice(0, pattern.exec(txt).index));
	    } else {
	        return txt;
	    }
	},
	open(src){
		this.$router.push(`/pdf/index/${encodeURIComponent(src)}`);
	},
    getCourseUnderStudyList(token,callback){
      let that=this;
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getCoursewareDetail?token=${token}&loginMark=${that.loginMark}&data=${JSON.stringify({id:this.$route.params.id})}`,       
        success:function(res){
          if(res.code==200){
            console.log(res.data.data)
            that.info=res.data;
            that.fileList=res.data.file.split(',');
            //this.categoryId=this.firstCategory[0].id;
            if(callback && typeof callback === 'function') callback(res);
          }
        }
      })
       // this.$http.get(BASE_URL2+`/partyCourse/getCoursewareDetail?token=${token}&loginMark=api&data=${JSON.stringify({id:this.$route.params.id})}`)
       //  .then(res=>{
       //    if(res.data.code==200){
       //      console.log(res.data.data)
       //      that.info=res.data.data;
       //      that.fileList=res.data.data.file.split(',');
       //      //this.categoryId=this.firstCategory[0].id;
       //      if(callback && typeof callback === 'function') callback(res);
       //    }
       //  })
    },
    post(){
      let that=this;
      if(!this.studyId){
        return;
      }     
      $.ajax({
        method:'post',
        url:BASE_URL2+`/partyCourse/postStudyInfo`, 
        data:{
          token:that.token,
          loginMark:this.loginMark,
          data:JSON.stringify({studyId:that.studyId,chapterId:that.chapterId,coursewareId:that.coursewareId,studyTime:this.stadyTime})
        },
        success:function(res){
          if(res.code==200){
            // console.log(res.data.data)
            // that.info=res.data;
            // that.fileList=res.data.file.split(',');
            // //this.categoryId=this.firstCategory[0].id;
            // if(callback && typeof callback === 'function') callback(res);
          }
        }
      })
    	// this.$http.post(BASE_URL2+`/partyCourse/postStudyInfo?token=${token}&loginMark=api&data=${{studyId:'',chapterId:'',coursewareId:this.$route.params.id,studyTime:this.stadyTime}}`)
     //    .then(res=>{
     //      if(res.data.code==200){
     //        console.log(res.data.data)
     //        that.info=res.data.data;
     //        that.fileList=res.data.data.file.split(',');
     //        //this.categoryId=this.firstCategory[0].id;
     //        if(callback && typeof callback === 'function') callback(res);
     //      }
     //    })
    }
  },
  mounted(){
  	document.querySelector('html').classList.add('height-per100');
  	document.querySelector('body').classList.add('height-per100');
  	document.querySelector('#App').classList.add('height-per100');
  },
  created(){
    this.stadyTime=0;
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    this.chapterId=this.getQueryString("chapterId");
    this.studyId=this.getQueryString("studyId");
    this.coursewareId=this.$route.params.id;
  	this.stadyTime=Date.now();
  },
  activated() {
   // this.loadData();
     const that=this;
     this.stadyTime=0;
      this.chapterId=this.getQueryString("chapterId");
    this.studyId=this.getQueryString("studyId");
    this.coursewareId=this.$route.params.id;
     this.stadyTime=Date.now();
     that.token=window.localStorage.getItem('partyToken');
      that.getCourseUnderStudyList(that.token,function(res1){
          //that.categoryId=res1.data.data.classificationList[0].id;
          //let id=res1.data.data.classificationList[0].id;
          that.loading2=false;
          that.loading=false;
       
        })
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
    document.querySelector('#App').classList.remove('height-per100');
    document.querySelector('html').classList.remove('height-per100');
  	document.querySelector('body').classList.remove('height-per100');
    this.stadyTime=parseInt((Date.now()-this.stadyTime)/1000);
    this.post();
  },
  beforeDestory() {
    document.querySelector('#App').classList.remove('height-per100');
    document.querySelector('html').classList.remove('height-per100');
  	document.querySelector('body').classList.remove('height-per100');
  	
  },
// 　components: {
// 　//　pdf
// 　}
  components: {
    Loading,   
  }
}
</script>
<style>
.height-per100{
	height: 100%;
}
</style>
<style scoped>
.content{
  padding: 14px;
  height: 100%;
}
iframe{
	width:100%;
	height: 100%;
}
.title{
  font-size: 20px;
}
.file-box{
	margin-top: 20px;
}
.btn{
	height: 28px;
	vertical-align: top;
	background: #C10710;
	border: 0;
	color:#fff;
}
.mr15{
	margin-right: 15px;
}
</style>