<template>
  <div class="notice">
    <div class="search_panel">
      <div class="search_panel_content">
        <div class="search_input_ctrl">
            <input type="text" placeholder="输入标题搜索" v-model="keywords" @keyup="search"/>
        </div>
        <img @click="showSearchDown" class="more_search" src="../../assets/imgs/search_more_icon.png"/>
      </div>
      <div class="search_down clearfix" v-bind:class="{ 'show': searchDown}">
        <div class='clearfix'>
          <div class="search_c" :class="{'active1':collectionOrLike === 'reply'}" @click="changeCollection('reply')">我的回复</div>
          <div class="search_c" :class="{'active1':collectionOrLike === 'comments'}" @click="changeCollection('comments')">我的评论</div>
          <div class="search_c" :class="{'active1':collectionOrLike === 'like'}" @click="changeCollection('like')">我的收藏</div>
          <div class="search_c" :class="{'active1':collectionOrLike === 'collection'}" @click="changeCollection('collection')">我的点赞</div>
        </div>       
      </div>      
    </div>
    <div class="tab_list_panel">      
      <div class="tab_item" :class="{'active':type === index}" @click="changeType(2,index)"  v-for="(item,index) in categoryList">{{item.F_ItemName}}</div>
    </div>
    <div class="notice_wrapper" ref="notice_wrapper" :class="{'top10':collectionOrLike}">
      <div class="notice_wrapper_content">
        <div class="notice_item" v-for="(item,index) in noticeList" :key="index" @click="lookDetail(item.id)">
          <h4 class="notice_title text-ellipsis">{{item.title}}丨{{item.abstract}}</h4>
          <p class="notice_date">{{item.intervalpublishtime}}</p>
        </div>  
       <!--  <p v-show="!loading_false" class="no_data">数据加载中...</p>
        <p v-show="loading_false&&noticeList.length" class="no_data">没有更多数据</p> --> 
        <div class="bottom-tip" v-show="noticeList.length">
              <span class="loading-hook">{{pullupMsg}}</span>
        </div> 
        <div v-show="!noticeList.length" class="empty">
          <img src='../../assets/imgs/empty.png'/>
          <p class='text'>暂无内容</p>
        </div> 
      </div>
      <Loading v-show="loading2" top="center"></Loading>
    </div>
    <div v-if="searchDown" class="mask" @click="hide"></div>
    <Loading v-show="loading" ></Loading>    
  </div>
</template>

<script>
var clipboard
import HomeFooter from '@/components/public/homeFooter'
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import { BASE_URL2} from '@/assets/common/utils'
import Bscroll from 'better-scroll'
import Loading from '../Loading/Loading'
import Toast from '../Toast/Toast'
import $ from 'jquery'
export default {
  computed: {
  },
  name: 'Home',
  data(){
    return {
      searchDown:false,
      noticeList:[],
      categoryList:[],
      page:1,
      rows:10,
      sidx:'',
      sord:'',
      keywords:'',
      category:'',
      collectionOrLike:'',
      type:0,
      loading_false:false,
      loadingData:false,
      loading:true,
      loading2:true,
      token:'',
      loginMark:'',
      pullupMsg:'没有更多数据'
    }
  },
  mounted() {
    //      this.copy_text();
  },
  methods: {
    showSearchDown(){
      this.searchDown=!this.searchDown;
    },
    getCategoryList(token,callback){
      let that=this;
       $.ajax({
        method:'get',
        url:BASE_URL2+`/dataitem/details?data=PartyPublicCategory&token=${token}&loginMark=${that.loginMark}`,
        success:function(res){
          if(res.code==200){
            that.categoryList=res.data;
            that.category=res.data[0].F_ItemValue;
            if(callback && typeof callback === 'function') callback();
          }
        }
      })
        // this.$http.get(BASE_URL2+`/dataitem/details?data=PartyPublicCategory&token=${token}&loginMark=api`)
        // .then(res=>{
        //   if(res.data.code==200){
        //     that.categoryList=res.data.data;
        //     if(callback && typeof callback === 'function') callback();
        //   }
        // })
    },
    getNoticeList(token,pull,callback){      
      let that=this;     
      if(that.loadingData){
        return
      }
      if(pull ==='pull'){
        that.page++;
      }
      let parmes=JSON.stringify({
        rows:this.rows,
        page:this.page,
        sidx:this.sidx,
        sord:this.sord,
        keywords:this.keywords,
        category:this.category,
        collectionOrLike:this.collectionOrLike
      });
      that.loadingData=true;
       $.ajax({
        method:'get',
        url:BASE_URL2+`/partypublic/list?data=${parmes}&token=${token}&loginMark=${that.loginMark}`,
        success:function(res){
          if(res.code==200){ 
            //that.total=res.data.total;                      
            if(pull!=='pull'){
              that.noticeList=res.data.rows;
              that.loadingData=false;
              that.loading=false;
              that.loading2=false;
             }else{
              that.pullupMsg = '加载中...';
             }
            if(callback && typeof callback === 'function') callback(res.data.rows);
          }
        }
      })       
    },
    // getNoticeList(token,pull,callback){
    //   let parmes=JSON.stringify({
    //     rows:this.rows,
    //     page:this.page,
    //     sidx:this.sidx,
    //     sord:this.sord,
    //     keywords:this.keywords,
    //     category:this.category,
    //     collectionOrLike:this.collectionOrLike
    //   });
    //   let that=this;
    //   $.ajax({
    //     method:'get',
    //     url:BASE_URL2+`/partypublic/list?data=${parmes}&token=${token}&loginMark=${that.loginMark}`,
    //     success:function(res){
    //       if(callback && typeof callback=='function') callback();
    //       that.loading2=false;             
    //       if(pull=='pull'){//上拉加载更多            
    //         that.noticeList.concat(res.data.rows);
    //         //this.noticeList=this.noticeList.concat(a.data.rows);           
    //       }else{//第一次加载                       
    //         that.noticeList=res.data.rows;            
    //       }
    //       that.notice_scroll.refresh();//重置滑动box高度
    //       if(res.data.rows.length<1){           
    //         that.loading_false=true;//没有数据了
    //         that.notice_scroll.finishPullUp();//无数据上拉事件关闭
    //       }
    //     }
    //   })
    //   // this.$http.get(BASE_URL2+`/partypublic/list?data=${parmes}&token=${token}&loginMark=api`)
    //   //   .then(res=>{            
    //   //     if(callback && typeof callback=='function') callback();
    //   //     this.loading2=false;             
    //   //     if(pull=='pull'){//上拉加载更多            
    //   //       this.noticeList.concat(res.data.data.rows);
    //   //       //this.noticeList=this.noticeList.concat(a.data.rows);           
    //   //     }else{//第一次加载                       
    //   //       this.noticeList=res.data.data.rows;            
    //   //     }
    //   //     this.notice_scroll.refresh();//重置滑动box高度
    //   //     if(res.data.data.rows.length<1){           
    //   //       this.loading_false=true;//没有数据了
    //   //       this.notice_scroll.finishPullUp();//无数据上拉事件关闭
    //   //     }
    //   //   })
    // },
    lookDetail(newsId){      
      let type=this.$router.history.current.path.substr(1);
      this.$router.push('/news-detail/'+newsId+`?type=${type}`);
    },
    changeType(n,type){
      let arr=this.categoryList;
      this.type=type;
      this.category=arr[type].F_ItemValue; 
      this.page=1; 
      this.collectionOrLike='';
      if(n==1) this.searchDown=false; 
      this.loading2=true;   
      this.loadingData=false; 
      this.getNoticeList(this.token);
    },
    changeCollection(text){
      this.searchDown=false;
      this.collectionOrLike=text;
      this.type=0;
      this.category='';
      this.page=1; 
      this.loading2=true;  
      this.loadingData=false;    
      this.getNoticeList(this.token);
    },
    search(e){      
      if(e.keyCode==13){        
        this.type=0;
        this.category='';
        this.page=1; 
         this.loading2=true;
         this.loadingData=false; 
        this.getNoticeList(this.token);
      }
    },
    hide(){
      this.searchDown=false;
    }
  },
  created() { 
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    let that=this;
    that.getCategoryList(that.token,function(){
          that.getNoticeList(that.token,'',function(){
            that.loading=false;
          })
        })
    that.$nextTick(() => {
      if (!that.notice_scroll) {
        that.notice_scroll = new Bscroll(that.$refs.notice_wrapper, {
          probeType: 1, // 加这个属性才能监听到滑动
          bounce: true,
          click: true,
          startX: 0,
          startY: 0,
          pullUpLoad: {
            threshold: 30, // 负值是当上拉到超过低部 70px；正值是距离底部距离 时，
          }
        })
        that.notice_scroll.on('scroll', (pos) => {                    
          if(pos.y<(this.notice_scroll.maxScrollY - 30)){
             
            that.getNoticeList(that.token,'pull',function(res){
              //that.loadingData=true;
                setTimeout(()=>{
                      if(res.length){
                        that.pullupMsg = '加载中...';
                        that.noticeList = that.noticeList.concat(res);                                   
                          that.notice_scroll.refresh();
                         that.loadingData=false;
                      }else{
                        that.pullupMsg = '没有更多数据';
                        //that.scroll.finishPullUp();
                      }
                          
              },1000)
            })
            
          }
        })
      } else {
        that.notice_scroll.refresh()
      }
    })   
    // this.$nextTick(()=>{
    //   if (!this.notice_scroll) {
    //     this.notice_scroll = new BScroll(this.$refs.notice_wrapper, {
    //       probeType: 2, // 加这个属性才能监听到滑动
    //       bounce: true,
    //       click: true,
    //       startX: 0,
    //       startY: 0,
    //       pullUpLoad: {
    //         threshold: 20, // 负值是当上拉到超过低部 70px；正值是距离底部距离时，
    //       }
    //     })
    //   } else {
    //     this.notice_scroll.refresh();
    //   }
    //   this.notice_scroll.on('pullingUp', () => {
    //     this.page++;      
    //     this.getNoticeList(this.token,'pull')
    //   })
    // })
  },
  activated() {
     const that=this;
     //that.token=window.localStorage.getItem('partyToken');
     that.getCategoryList(that.token,function(){
          that.getNoticeList(that.token,'',function(){
            that.loading=false;
          })
        })
    // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
    // .then(res => {
    //   if(res.data.code==200){
    //     that.token=res.data.data.baseinfo.token;        
    //     that.getCategoryList(that.token,function(){
    //       that.getNoticeList(that.token,'',function(){
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
    HomeFooter,
    Loading
  }
}
</script>


<style scoped>
.bottom-tip{
    width: 100%;
    height: 35px;
    line-height: 35px;
    text-align: center;
    color: #777;
    font-size: 14px;   
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
  font-size:14px;
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
.notice{
  padding-top:44px;
}
.search_panel{
  position:fixed;
  left:0;
  top:0;
  height:45px;
  width:100%;
  z-index:999;
}
.search_panel_content{
  position:relative;
  padding:8px;
  padding-right:53px;
  background:#F4F5FA;
  z-index:998;
}
.search_input_ctrl{
  position:relative;
  box-sizing:content-box;
}
.search_input_ctrl input{
  box-sizing:border-box;
  display:block;
  width:100%;
  border:none;
  background:#fff;
  border-radius:2px;
  height:28px;
  font-size:14px;
  padding-left:25px;
  outline:none;
}
.more_search{
  position:absolute;
  width:23px;
  height:23px;
  right:15px;
  top:50%;
  transform: translateY(-50%);
}
.search_down{
  box-sizing:border-box;
  position:absolute;
  left:0;
  top:44px;
  padding:20px;
  padding-right:0;
  width:100%;
  background:#fff;
  z-index:997;
  transform: translateY(-100%);
  transition:all 0.3s;
}
.search_down.show{
  transform: translateY(0);
}
.line{
  height:1px;
  border-top:1px solid #f0f0f0;
  magin:8px 0;
}
.search_c{
  display:block;
  float:left;
  font-size:15px;
  padding:9px 9px;
  background:#F6F8FA;
  border-radius:4px;
  border:1px solid #EAEBEC;
  color:#646A78;
  margin-right:5px;
}
.mask{
  position:fixed;
  left:0;
  top:0;
  right:0;
  bottom:0;
  background-color:rgba(0,0,0,0.4);
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
.active1{
  color:#fff !important;
  background-color:#1781DB !important;
}
.notice_wrapper{
  position: fixed;
  top: 99px;
  left: 0;
  right: 0;
  bottom: 0;
}
.notice_item{
  margin:0 15px;
  padding:18px 0;
  border-bottom:1px solid #DBDBDB;
}
.notice_title{
  font-size:17px;
  color:#000;
  margin-bottom:7px;
}
.notice_date{
  font-size:14px;
  color:#999999;
}
.mt10{
  margin-top:10px;
}
.border-top-1{
  position:relative;
}
.border-top-1:before{
  content:'';
  position:absolute;
  top:0;
  left:-20px;
  height:1px;
  width:120%;
  border-top:1px solid #f0f0f0;
}
.pt10{
  padding-top:10px;
}
.top10{
  top:50px;
}
</style>
