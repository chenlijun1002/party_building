<template>
<!-- 　　<pdf :src="info"></pdf> -->
  <div class="content">   
  <iframe :src="info" style="width:100%;height:100%"></iframe>
  </div>
</template>

<script>
import Loading from '../Loading/Loading'
import Vue from 'vue'
import { BASE_URL2} from '@/assets/common/utils'
//import pdf from 'vue-pdf'

export default {
  data(){
    return {
      pageIndex:1,
      percentage:90,
      type:0,
      info:'', 
      fileList:[],
      token:'',
      loginMark:'',
      categoryId:'',
      loading:true,
      loading2:true,     
    }
  },
  mounted(){
    document.querySelector('html').classList.add('height-per100');
    document.querySelector('body').classList.add('height-per100');
    document.querySelector('#App').classList.add('height-per100');
  },
  methods:{
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
    getCourseUnderStudyList(token,callback){
      let that=this;
      this.$ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getCoursewareDetail?token=${token}&loginMark=${that.loginMark}&data=${JSON.stringify({id:this.$route.params.id})}`,       
        success:function(res){
          if(res.data.code==200){
            console.log(res.data.data)
            that.info=res.data.data;
            that.fileList=res.data.data.file.split(',');
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
  },
  created(){
    // this.token=window.localStorage.getItem('partyToken');
    // this.loginMark=window.localStorage.getItem('loginMark');
     that.info=this.$route.params.link;
  },
  activated() {   
     const that=this;
     that.info=this.$route.params.link;     
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
  },
  beforeDestory() {
    document.querySelector('#App').classList.remove('height-per100');
    document.querySelector('html').classList.remove('height-per100');
    document.querySelector('body').classList.remove('height-per100');
  },
　components: {
　　//pdf
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