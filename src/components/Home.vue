<template>
  <div class="home">
    <mt-swipe :auto="4000">
      <mt-swipe-item v-for="(item,index) in carousel_imgs" :key="index">
        <img :src="item.imgurl">
      </mt-swipe-item>
    </mt-swipe>
    <div class="nav_bar_panel">
      <div class="nav_bar_group clearfix">
        <a class="nav_bar_item" @click="goLink('/archives')">
          <img class="iconfont" src="../assets/imgs/index_icon_a.png" />
          <div class="nav_bar_label">党员档案</div>
        </a>
        <a class="nav_bar_item" @click="goLink('/focus_news')">
          <img class="iconfont" src="../assets/imgs/index_icon_b.png" />
          <div class="nav_bar_label">党建要闻</div>
        </a>
        <a class="nav_bar_item" @click="goLink('/notice')">
          <img class="iconfont" src="../assets/imgs/index_icon_c.png" />
          <div class="nav_bar_label">通知公告</div>
        </a>
        <a class="nav_bar_item" @click="goLink('/inner_party_publicity')">
          <img class="iconfont" src="../assets/imgs/index_icon_d.png" />
          <div class="nav_bar_label">党内公示</div>
        </a>
        <a class="nav_bar_item" @click="goLink('/fighting_corruption')">
          <img class="iconfont" src="../assets/imgs/index_icon_e.png" />
          <div class="nav_bar_label">反腐倡廉</div>
        </a>
        <a class="nav_bar_item" @click="goLink('/policy_regulations')">
          <img class="iconfont" src="../assets/imgs/index_icon_f.png" />
          <div class="nav_bar_label">政策法规</div>
        </a>
        <a class="nav_bar_item" @click="goLink('/thematic_education')">
          <img class="iconfont" src="../assets/imgs/index_icon_g.png" />
          <div class="nav_bar_label">专题教育</div>
        </a>
        <a class="nav_bar_item" @click="showToast">
          <img class="iconfont" src="../assets/imgs/index_icon_h.png" />
          <div class="nav_bar_label">更多</div>
        </a>
      </div>
    </div>   
    <div class="news_list">
        <div class="news-item" v-for="(item,index) in news_lists" :key="index" @click="lookDetail(item.id,item.typecode)" :class="{'pb0':index ==0&&index !=(news_lists.length-1)||index !=0&&index !=(news_lists.length-1)}">
          <div class="item-box">
            <div class="news_group pt0 pr4 left-line" @click.stop="Link(item.typecode)">
              <div class="news_title clearfix">
                <h3 class="t">{{item.typename}}</h3>
                <div class="more_news clearfix" >
                  <span class="txt">更多</span>
                  <img src="../assets/imgs/more_icon.png" />
                </div>
              </div>            
            </div>
            <a class="news_item" >
              <img :src="item.coverimage" />
              <h6 class="news-title text-ellipsis-2">{{item.title}}丨{{item.abstract}}</h6>
              <p class="news_date">{{item.intervalpublishtime}}</p>
            </a>
          </div>
        </div>
      </div>
      <Toast :show="show" v-on:hide="hideToast">{{toastText}}</Toast>
    <home-footer></home-footer>    
  </div>
</template>

<script>
var clipboard
import HomeFooter from '@/components/public/homeFooter'
import Vue from 'vue'
import { Swipe, SwipeItem } from 'mint-ui'
import { BASE_URL2} from '@/assets/common/utils'
import jq from 'jquery'
import { mapGetters, mapActions } from 'vuex'
import Toast from './Toast/Toast'
Vue.component(Swipe.name, Swipe);
Vue.component(SwipeItem.name, SwipeItem);
export default {
  computed: {
  },
  name: 'Home',
  data(){
    return {
      lists:[],
      news_lists:[],
      carousel_imgs:[],
      categoryList:[],
      typename:'',
      token:'',
      loginMark:'',
      UserId:'',
      show:false,
      toastText:'', 
    }
  }, 
  mounted() {
    let that=this;
    history.pushState(null,null,document.URL);
    window.addEventListener("popstate", function(e) {          
        // if (document.referrer === '') {                      
        //     if((window.location.pathname)=='/WxApi/Index') {
        //       window.history.back(-2);
        //     }
        // } 
       // console.log(that.$router.history.current.path,777777)
       // that.$router.replace({path:'/'})
       //console.log(window.history.length)
       if(`${window.location.hash}`==='#/'){
          history.pushState(null,null,document.URL);
          that.changeTab(1);
       }
      //history.pushState(null,null,`${window.location.origin}/#/`);      
    }, false);
  },
  methods: {
    showToast(){
      this.toastText="更多功能，敬请期待!";
      //this.toastText=`${this.token}/${this.loginMark}/${this.UserId}`;
      this.show=true;
    },
    hideToast(val){
      let that=this;
      this.show=val;
      //this.hasClick=false;
    },
    goLink(router){
      if(router) this.$router.push(router);
    },
    Link(type){
      let controller='';
      if(type==='partynews'){          
          controller='focus_news';
        }else if(type==='partyanticorruption'){
          controller='fighting_corruption';          
        }else if(type==='partynotice'){         
          controller='notice';
        }else if(type==='partypublic'){          
          controller='inner_party_publicity';
        }else if(type==='partypolicy'){          
          controller='policy_regulations';
        }else if(type==='partyspecial'){          
          controller='thematic_education';
        }
      this.$router.push(`/${controller}`);
    },
    lookDetail(newsId,type){
      this.changeNewsId(newsId);      
      let controller='';
      if(type==='partynews'){          
          controller='focus_news';
        }else if(type==='partyanticorruption'){
          controller='fighting_corruption';          
        }else if(type==='partynotice'){         
          controller='notice';
        }else if(type==='partypublic'){          
          controller='inner_party_publicity';
        }else if(type==='partypolicy'){          
          controller='policy_regulations';
        }else if(type==='partyspecial'){          
          controller='thematic_education';
        }
      this.$router.push('/news-detail/'+newsId+`?type=${controller}`);
    },
    changeType(name){     
      this.typename=name;
      this.news_lists=this.lists.filter((item)=>item.typename===this.typename);
    },
    ...mapActions([
      'changeNewsId',
      'changeTab'
    ]),    
  }, 
  created(){
    let that=this;
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');//UserId
    this.UserId=window.localStorage.getItem('UserId');
    // this.toastText=`${this.token}/${this.loginMark}`;
    // this.show=true;
    jq.ajax({
        method:'get',
        url:BASE_URL2+`/gethomenews?data=${JSON.stringify({"top":5})}&token=${that.token}&loginMark=${that.loginMark}`,   
        // data:{
        //   data:JSON.stringify({"top":5}),
        //   token:that.token,
        //   loginMark:'api'
        // },    
        success:function(res1){
          if(res1.code==200){                                          
            that.news_lists=res1.data;
          } 
        }
      })
    jq.ajax({
        method:'get',
        url:BASE_URL2+`/gethomeimages?token=${that.token}&loginMark=${that.loginMark}`,           
        success:function(res2){
          if(res2.code==200){                                          
            that.carousel_imgs=res2.data;
          } 
        }
      })
  },
  // activated() {
  //    this.token=window.localStorage.getItem('partyToken');
  //   // console.log(this,this.token,0)
  // },
  deactivated() {
    let that=this;    
    // let that=this;
    // window.removeEventListener('popstate',function(){
    //   that.$router.replace({path:'/'})
    // },false)
  },
  beforeDestory() {
    
  },
  update() {
    
  },
  components: {
    HomeFooter,
    Toast
  }
}
</script>


<style scoped>
.home{
  padding-bottom:60px;
}
.mint-swipe{
  height:200px;
}
.mint-swipe img{
  display:block;
  width:100%;
  height:200px;
}
.nav_bar_panel{
  height:203px;
  background:#F4F5FA;
  padding:0 7px;
}
.nav_bar_group{
  padding-top:28px;
}
.nav_bar_group .iconfont{
  font-size:34px;
  display:block;
  width:34px;
  height:34px;
  margin:0 auto 10px;
}
.nav_bar_item{
  float:left;
  width:25%;
  text-align:center;
  margin-bottom:28px;
}
.nav_bar_label{
  font-size:12px;
}
.news_group{
  padding:20px;
  background:#fff;
}
.news_title{
  font-size:18px;
  line-height:18px;
}
.news_title .t{
 float:left;
}
.more_news{
  float:right;
}
.more_news .txt{
  font-size:15px;
  color:#999;
  vertical-align:middle;
  float:left;
}
.more_news img{
  width:8px;
  height:14px;
  vertical-align:middle;
  float:right;
  margin-left:10px;
}
.news_list .item-box{
  padding:15px 14px;
  background-color:#fff;
}
.news_list .news-item{
  padding:10px 0;
  background-color:#eee;
}
.news_list .news_item{
  display:block;
  position:relative;
  /*margin-top:30px;*/
  padding-left:110px;
}
.news_list .news_item img{
  position:absolute;
  left:0;
  top:0;
  width:100px;
  height:75px;
}
.news-title{
  font-size:17px;
  line-height:24px;
  margin-bottom:8px;
  min-height:48px;
}
.news_date{
  font-size:14px;
  color:#999;
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
