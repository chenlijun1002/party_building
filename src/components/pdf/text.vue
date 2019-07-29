<template>
<!-- 　　<pdf :src="info"></pdf> -->
  <div class="content"> 
    <h1 class="title">{{info.title}}</h1>
    <div v-html="textContent"></div>
    <ul class="file-box">
      <li v-for="(item,index) in fileList">
        <span class="text-ellipsis" style="width:55%;display:inline-block">{{splitFileName(item)}}</span>
        <!-- <button class="btn mr15" @click="open(item)">打开</button> -->
        <a :href="item" :download="splitFileName(item)"><button class="btn">下载</button></a>
      </li>
    </ul> 
    <Loading v-show="loading" ></Loading>     
  </div>
</template>

<script>
import Loading from '../Loading/Loading'
import Vue from 'vue'
import $ from "jquery"
import { BASE_URL2} from '@/assets/common/utils'
//import pdf from 'vue-pdf'

export default {
  data(){
    return {      
      textContent:'',      
      token:'', 
      loginMark:'',    
      loading:true, 
      info:{},
      fileList:[],
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
    getInfo(token,callback){
      let that=this;
       $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getCoursewareDetail?token=${token}&loginMark=${that.loginMark}&data=${JSON.stringify({id:this.$route.params.id})}`,       
        success:function(res){
          if(res.code==200){
            console.log(res.data.data)
            that.textContent=that.replace_html_tag_attr(res.data.textContent,'iframe','width','100%');  
            that.info=res.data
            if(res.data.file) that.fileList=res.data.file.split(',');         
            if(callback && typeof callback === 'function') callback(res);
          }
        }
      })
       // this.$http.get(BASE_URL2+`/partyCourse/getCoursewareDetail?token=${token}&loginMark=api&data=${JSON.stringify({id:this.$route.params.id})}`)
       //  .then(res=>{
       //    if(res.data.code==200){
       //      console.log(res.data.data)
       //      that.textContent=res.data.data.textContent;           
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
          data:JSON.stringify({studyId:that.studyId,chapterId:that.chapterId,coursewareId:that.coursewareId,studyTime:that.stadyTime})
        },
        success:function(res){
          // if(res.code==200){
          //   console.log(res.data.data)
          //   that.info=res.data
          //   that.fileList=res.data.file.split(',');
          //   //this.categoryId=this.firstCategory[0].id;
          //   if(callback && typeof callback === 'function') callback(res);
          // }
        }
      })
      // this.$http.post(BASE_URL2+`/partyCourse/postStudyInfo?token=${token}&loginMark=api&data=${{studyId:'',chapterId:'',coursewareId:this.$route.params.id,studyTime:this.stadyTime}}`)
      //   .then(res=>{
      //     if(res.data.code==200){
      //       console.log(res.data.data)
      //       that.info=res.data.data;
      //       that.fileList=res.data.data.file.split(',');
      //       //this.categoryId=this.firstCategory[0].id;
      //       if(callback && typeof callback === 'function') callback(res);
      //     }
      //   })
    },
     replace_html_tag_attr(src_str, tag, attr, val) {
      if(typeof src_str === 'undefined' || typeof tag === 'undefined' || typeof attr === 'undefined' || typeof val === 'undefined') {
        return '';
      }
    
      var reg = new RegExp('<' + tag + '[^>]*(' + attr + '=[\'\"](\\w*%?)[\'\"])?[^>]*>', 'gi');
      return src_str.replace(reg, function (match) {
        if(match.indexOf(attr) > 0) {
          //包含attr属性,替换attr
          var sub_reg = new RegExp(attr + '=[\'\"](\\w*%?)[\'\"]', 'gi');
          return match.replace(sub_reg, attr +'=' + val);
        }else{
          //不包含attr属性,添加attr
          return match.substr(0, tag.length + 1) + ' ' + attr + '=' + val + ' ' + match.substr(tag.length + 2, match.length);
        }
      });
    }
  },
  created(){
    const that=this; 
    this.stadyTime=0;
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    this.chapterId=this.getQueryString("chapterId");
    this.studyId=this.getQueryString("studyId");
    this.coursewareId=this.$route.params.id;
    this.stadyTime=Date.now();
    this.getInfo(this.token,function(res1){
          //that.categoryId=res1.data.data.classificationList[0].id;
          //let id=res1.data.data.classificationList[0].id;
          //that.loading2=false;
          that.loading=false;
       
        })  
  },
  mounted(){
    //var deptObjs=document.getElementById("IFRAMEID").contentWindow.document.getElementById("TAGID");
    let iframe=document.querySelectorAll("iframe");
    console.log(iframe)
    for(let i=0;i<iframe.length;i++){
      iframe[i].contentWindow.setAttribute('width',"100%");
    }
    
    //判断此元素是否存在

    // if(deptObjs!=null){
    //     //设置该元素的样式或其他属性
    //     deptObjs.setAttribute('style',' height: 20px !important;'); //!important用来提升指定样式条目的应用优先权
    // }
  },
  activated() {
   // this.loadData();
     const that=this; 
     this.stadyTime=0;
     this.chapterId=this.getQueryString("chapterId");
    this.studyId=this.getQueryString("studyId");
    this.coursewareId=this.$route.params.id;
    this.stadyTime=Date.now();
     //that.token=window.localStorage.getItem('partyToken');
     // that.getInfo(that.token,function(res1){
     //      //that.categoryId=res1.data.data.classificationList[0].id;
     //      //let id=res1.data.data.classificationList[0].id;
     //      that.loading2=false;
     //      that.loading=false;
       
     //    })   
    // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
    // .then(res => {
    //   if(res.data.code==200){
    //     that.token=res.data.data.baseinfo.token;        
    //     that.getInfo(that.token,function(res1){
    //       //that.categoryId=res1.data.data.classificationList[0].id;
    //       //let id=res1.data.data.classificationList[0].id;
    //       that.loading2=false;
    //       that.loading=false;
       
    //     })
    //   }
    // })
    // .catch(e => console.log(e))   
  }, 
  deactivated(){
    this.stadyTime=parseInt((Date.now()-this.stadyTime)/1000);
    this.post();
  },
  components: {
    Loading,   
  }
}
</script>
<style scoped>
.content{
  padding: 14px;
 
}
.content video,.content iframe{
  max-width: 100%;
}
iframe{
  max-width: 100% !important;
}
.title{
  font-size: 20px;
  text-align: center;
  margin-bottom: 20px;
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