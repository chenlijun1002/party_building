<template>
  <div class="container"> 
    <div class="fl left">
      <div class="category_wrapper" ref="category_wrapper">      
        <ul class="category_content">
          <li class="category-item" :class="{'active':categoryId === item.id}" v-for="(item,index) in firstCategory" @click.stop="changeCategory(item.id)">
            {{item.name}}
          </li>                               
        </ul>          
      </div>
    </div>   
    <div class="bg-f right">
      <div class="pt20 pl20 pr20"> 
        <div class="course_wrapper" ref="course_wrapper">             
          <ul class="course_content">
            <li class="course-item" v-for="(item,index) in childrenCategory">
              <div class="course-item-content" :class="{'bg-FF6428':(index+1)%2==0||(index+1)%3==0}" @click="gonList(item.id)">
               {{item.name}}
              </div>
            </li>                               
          </ul>         
          <p class='text' v-show="!childrenCategory.length">暂无二级分类</p>        
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
// import scroll from '@/components/scroll/scroll'
import Loading from '../Loading/Loading'
import Vue from 'vue'
import { BASE_URL2} from '@/assets/common/utils'
import $ from "jquery"
import BScroll from 'better-scroll'
import { mapGetters, mapActions } from 'vuex'
// import BScroll from 'better-scroll'

export default {
  computed: {
  },
  name: 'Home',
  data(){
    return {
      page:1,
      percentage:90,
      firstCategory:[], 
      childrenCategory:[],
      categoryId:'',
      loading:true,
      loading2:true,
      token:'',
      loginMark:''    
    }
  },
  mounted() {
    //      this.copy_text();
  },
  methods: {
    changeCategory(id){
      this.categoryId=id;
      this.loading2=true;
      this.getChildrenCategory(this.token,id,()=>{
        this.loading2=false;
      });
    },
    getFirstCategoryList(token,callback){
      let that=this;
       $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getPrimaryClassificationList?token=${token}&loginMark=${that.loginMark}`,
        success:function(res){
          if(res.code==200){
            console.log(res.data.data)
            that.firstCategory=res.data.classificationList;
            //this.categoryId=this.firstCategory[0].id;
            if(callback && typeof callback === 'function') callback(res);
          }
        }
      })      
    },
    getChildrenCategory(token,id,callback){
      let that=this;
        $.ajax({
        method:'get',
        url:BASE_URL2+`/partyCourse/getSecondaryClassificationList?token=${this.token}&loginMark=${that.loginMark}&data=${JSON.stringify({parentId:id})}`,
        success:function(res){
          if(res.code==200){
            that.childrenCategory=res.data.classificationList;
            if(callback && typeof callback === 'function') callback(res);
          }
        }
      })
      // this.$http.get(BASE_URL2+`/partyCourse/getSecondaryClassificationList?token=${this.token}&loginMark=api&data=${JSON.stringify({parentId:id})}`)
      //   .then(res=>{
      //     if(res.data.code==200){
      //       that.childrenCategory=res.data.data.classificationList;
      //       if(callback && typeof callback === 'function') callback(res);
      //     }
      // })
    },
    gonList(id){
      this.$router.push(`/courseList/${id}`);
    },    
    
  },
  created() {  
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');  
    this.$nextTick(()=>{
      if (!this.course_scroll) {
        this.course_scroll = new BScroll(this.$refs.course_wrapper, {
          click: true,
        })       
      }
      if (!this.category_wrapper) {
        this.category_wrapper = new BScroll(this.$refs.category_wrapper, {
          click: true,
        })       
      }
    })
  },
  activated() {
    const that=this;
    //that.token=window.localStorage.getItem('partyToken');        
        that.getFirstCategoryList(that.token,function(res1){
          that.categoryId=res1.data.classificationList[0].id;
          let id=res1.data.classificationList[0].id;
          that.getChildrenCategory(that.token,id,function(){
            that.loading=false;
            that.loading2=false;
          })
        })
    // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
    // .then(res => {
    //   if(res.data.code==200){
    //     that.token=res.data.data.baseinfo.token;        
    //     that.getFirstCategoryList(that.token,function(res1){
    //       that.categoryId=res1.data.data.classificationList[0].id;
    //       let id=res1.data.data.classificationList[0].id;
    //       that.getChildrenCategory(that.token,id,function(){
    //         that.loading=false;
    //         that.loading2=false;
    //       })
    //     })
    //   }
    // })
    // .catch(e => console.log(e))
    //this.loadData();
  },
  deactivated() {
    
  },
  beforeDestory() {

  },
  update() {
    
  },
  components: {
    // Progress,
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
  height: calc(100% - 55px)
}*/
</style>
<style scoped> 
.container{
  background-color: #F4F5FA;
 /* height: 100%;*/
  position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 55px;
}
.category_wrapper{
  height: 100%;
}
.category-item{
  height: 55px;
  line-height: 55px;
  text-align: center;
  font-size: 15px;
}
.category-item.active{
  background-color: #fff;
  color: #C10710;
}
.left{
  width:127px;
  height: 100%;
  overflow: scroll;
}
.fl{
  float: left;
}
.right{
  margin-left: 127px;
  height: 100%;
   overflow: scroll;
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
.text{
  font-size: 16px;
  text-align: center;
  color: #999;
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
