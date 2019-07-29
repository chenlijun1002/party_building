<template>
  <div class="news_detail">
    <!-- <div class="news_detail_wrapper" ref="news_detail_wrapper" :class="{'static':!commentList.length}"> -->
      <div class="news_detail_wrapper" ref="news_detail_wrapper">
      <div class="news_detail_wrapper_content">
        <div class="news_title">
          <h3>{{newsDetailInfo.title}}</h3>
          <p><span>发布于</span><span>{{newsDetailInfo.intervalpublishtime}}</span></p>
        </div>
        <div class="news_box">
          <div class="news_content" v-html="newsDetailInfo.content"></div>
          <div class="news_info">
            <div class="info_left">
              <span>阅读</span>
              <span>{{newsDetailInfo.readcount}}</span>
            </div>
            <div class="info_right">
              <span class="btn-d" :class="{'active':newsDetailInfo.donecollection==='true'}" @click="setcollection(newsDetailInfo.donecollection)">收藏</span>
              <span class="btn-d" :class="{'corlor-red':newsDetailInfo.donelike==='true'}" @click="setlike(newsDetailInfo.donelike)">
              <img src="../../assets/imgs/zan.png" v-show="newsDetailInfo.donelike==='true'"/>
              <img src="../../assets/imgs/no_zan.png" v-show="newsDetailInfo.donelike!=='true'"/>
              {{newsDetailInfo.collectioncount}}
              </span>
            </div>
          </div>
        </div>
        <div class="news_comment">
          <div class="comment_title">热门评论 <span>{{commentList.length}}</span></div>
          <div class="comment_box">
            <div class="comment_item" v-for="(item,index) in commentList" :key="index">
              <div class="item_info">
                <div class="info_header">
                  <img :src="item.porfile">
                </div>
                <div class="info_text">
                  <h4>{{item.realname}}</h4>
                  <p>{{item.postdate}}</p>
                </div>
                <div class="info_icon" @click="revome(item.id)" v-if="item.userid==userId"></div>
                <button class="repaly"  v-if="item.userid!=userId" @click="repaly(item.realname,item.id)">回复</button>
              </div>
              <div class="item_content">{{item.comments}}</div>
            </div>
          </div>
        </div>
        <p v-show="!loading_false&&commentList.length" class="no_data">数据加载中...</p>
        <p v-show="loading_false" class="no_data">没有更多数据</p>
        <!-- <p v-show="!commentList.length" class="no_data" :class="{'nodata':!commentList.length}">暂无评论</p> -->
      </div>
    </div>
    <Loading v-show="loading" ></Loading>
    <Toast :show="show" v-on:hide="hideToast">{{toastText}}</Toast>
    <div class="comment">
      <textarea placeholder="说点什么吧" type="text" v-model="comment" @keypress="postcommnet" id="commentTextArea"/>
      <button @click="post">发送</button>
    </div>
  </div>
</template>

<script>
var clipboard
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import { BASE_URL2} from '@/assets/common/utils'
import BScroll from 'better-scroll'
import Loading from '../Loading/Loading'
import Toast from '../Toast/Toast'
import $ from 'jquery'
export default {
  computed: {
    ...mapGetters([
      'getNewsId'
    ])
  },
  data(){
    return {
      newsDetailInfo:{},
      token:'',
      loginMark:'',
      commentList:[],
      page:1,
      rows:10,
      sidx:'',
      sord:'',
      newsId:'',
      loading_false:false,
      loading:true,
      show:false,
      toastText:'', 
      comment:'',
      userId:0,
      hasClick:false,          
    }
  },
  name: 'Home',
  mounted() {
    //      this.copy_text();
  },
  methods: {
    getCommentList(token,pull){
      let that = this;
      let parmes=JSON.stringify({
        rows:this.rows,
        page:this.page,
        sidx:this.sidx,
        sord:this.sord,
        objectId:this.$route.params.id
      })
       let controller='';
        let type=this.$route.query.type;       
        if(type==='focus_news'){
          controller='partynews';
        }else if(type==='fighting_corruption'){
          controller='partyanticorruption';
        }else if(type==='notice'){
          controller='partynotice';
        }else if(type==='inner_party_publicity'){
          controller='partypublic';
        }else if(type==='policy_regulations'){
          controller='partypolicy';
        }else if(type==='thematic_education'){
          controller='partyspecial';
        }else{
          return;
        }
      $.ajax({
        method:'get',
        url:BASE_URL2+`/${controller}/comments?data=${parmes}&token=${token}&loginMark=${that.loginMark}`,       
        success:function(res){
          if(pull=='push'){//上拉加载更多
            that.commentList.concat(res.data);
          }else{//第一次加载
            that.commentList=res.data;
          }
          that.detail_scroll.refresh();//重置滑动box高度
          if(that.commentList.length<10){
            that.loading_false=true;//没有数据了
            that.detail_scroll.finishPullUp();//无数据上拉事件关闭
          }
        }
      })
      // this.$http.get(BASE_URL2+`/partynews/comments?data=${parmes}&token=${token}&loginMark=api`)
      //   .then(res=>{
      //     if(pull=='push'){//上拉加载更多
      //       this.commentList.concat(res.data.data);
      //     }else{//第一次加载
      //       this.commentList=res.data.data;
      //     }
      //     this.detail_scroll.refresh();//重置滑动box高度
      //     if(this.commentList.length<10){
      //       this.loading_false=true;//没有数据了
      //       this.detail_scroll.finishPullUp();//无数据上拉事件关闭
      //     }
      //   })
    },    
    revome(id){ 
      let that=this;
      $.ajax({
        method:'post',
        url:BASE_URL2+`/partycomment/delcomment`, 
        data:{
          data:id,
          token:that.token,
          loginMark:that.loginMark
        },      
        success:function(res){
          if(res.code==200){
            that.toastText='删除成功';
            that.show=true; 
            setTimeout(()=>{
              that.getCommentList(that.token)
            },3000)         
          }else{
            that.toastText='该评论已被删除';
            that.show=true; 
            console.log(456)
          }
        }
      })     
      // this.$http.post(BASE_URL2+`/partycomment/delcomment`,{data:id,token:this.token,loginMark:"api"})
      //   .then(res=>{
      //      if(res.data.code==200){
      //       this.toastText='删除成功';
      //       this.show=true; 
      //       setTimeout(()=>{
      //         this.getCommentList(this.token)
      //       },3000)         
      //     }else{
      //       this.toastText='该评论已被删除';
      //       this.show=true; 
      //       console.log(456)
      //     }
      //   })
    },
    post(){
      if(!this.comment) {
        this.toastText='请输入评论';
        this.show=true; 
        return;
      }
     // let type = this.$route.query.type
      let controller='';
        let type=this.$route.query.type;       
        if(type==='focus_news'){
          controller='partynews';
        }else if(type==='fighting_corruption'){
          controller='partyanticorruption';
        }else if(type==='notice'){
          controller='partynotice';
        }else if(type==='inner_party_publicity'){
          controller='partypublic';
        }else if(type==='policy_regulations'){
          controller='partypolicy';
        }else if(type==='thematic_education'){
          controller='partyspecial';
        }else{
          return;
        } 
      let that=this;
      $.ajax({
        method:'post',
        url:BASE_URL2+`/partycomment/postcomment`, 
        data:{
          data:JSON.stringify({"parentId":"","objectname":controller,"objectId":this.$route.params.id,"comment":this.comment}),
          token:that.token,
          loginMark:that.loginMark
        },      
        success:function(res){
          if(res.code==200){
            that.toastText='评论成功';
            that.show=true;
            that.comment=''; 
            setTimeout(()=>{
              that.getCommentList(that.token)
            },3000)          
          }else{
            that.toastText='评论失败';
            that.show=true;
          }
        }
      })   
        // this.$http.post(BASE_URL2+`/partycomment/postcomment`,{data:JSON.stringify({"parentId":"","objectId":this.$route.params.id,"comment":this.comment}),token:this.token,loginMark:"api"})
        // .then(res=>{
        //    if(res.data.code==200){
        //     this.toastText='评论成功';
        //     this.show=true;
        //     this.comment=''; 
        //     setTimeout(()=>{
        //       this.getCommentList(this.token)
        //     },3000)          
        //   }else{
        //     this.toastText='评论失败';
        //     this.show=true;
        //   }
        // })
    },
    postcommnet(e){ 
      let that = this; 
      let type = this.$route.query.type;
      let controller='';
        //let type=this.$route.query.type;       
        if(type==='focus_news'){
          controller='partynews';
        }else if(type==='fighting_corruption'){
          controller='partyanticorruption';
        }else if(type==='notice'){
          controller='partynotice';
        }else if(type==='inner_party_publicity'){
          controller='partypublic';
        }else if(type==='policy_regulations'){
          controller='partypolicy';
        }else if(type==='thematic_education'){
          controller='partyspecial';
        }else{
          return;
        }          
      if(e.keyCode==13){
        if(!this.comment) return;
        let that=this;
      $.ajax({
        method:'post',
        url:BASE_URL2+`/partycomment/postcomment`, 
        data:{
          data:JSON.stringify({"parentId":"","objectname":controller,"objectId":this.$route.params.id,"comment":this.comment}),
          token:that.token,
          loginMark:that.loginMark
        },      
        success:function(res){
           if(res.code==200){
            that.toastText='评论成功';
            that.show=true;
            that.comment=''; 
            setTimeout(()=>{
              that.getCommentList(that.token)
            },3000)          
          }else{
            that.toastText='评论失败';
            that.show=true;
          }
        }
      })   
        // this.$http.post(BASE_URL2+`/partycomment/postcomment`,{data:JSON.stringify({"parentId":"","objectId":this.$route.params.id,"comment":this.comment}),token:this.token,loginMark:"api"})
        // .then(res=>{
        //    if(res.data.code==200){
        //     this.toastText='评论成功';
        //     this.show=true;
        //     this.comment=''; 
        //     setTimeout(()=>{
        //       this.getCommentList(this.token)
        //     },3000)          
        //   }else{
        //     this.toastText='评论失败';
        //     this.show=true;
        //   }
        // })
      }
    },
    hideToast(val){
      let that=this;
      this.show=val;
      this.hasClick=false;
      console.log(555,val);
      // $.ajax({
      //   method:'get',
      //   url:BASE_URL2+`/partynews/data?data=${this.$route.params.id}&token=${this.token}&loginMark=${that.loginMark}`, 
      //   success:function(res1){
      //      that.newsDetailInfo=res1.data[0]||{};
      //     that.loading=false;
      //   }
      // })         
      //  this.$http.get(BASE_URL2+`/partynews/data?data=${this.$route.params.id}&token=${this.token}&loginMark=api`)
      //   .then(res1=>{
      //     that.newsDetailInfo=res1.data.data[0]||{};
      //     this.loading=false;
      // })
    },
    setcollection(val){
      let that = this;
      if(this.hasClick) return;
      this.hasClick=true;
      let controller='';
        let type=this.$route.query.type;       
        if(type==='focus_news'){
          controller='partynews';
        }else if(type==='fighting_corruption'){
          controller='partyanticorruption';
        }else if(type==='notice'){
          controller='partynotice';
        }else if(type==='inner_party_publicity'){
          controller='partypublic';
        }else if(type==='policy_regulations'){
          controller='partypolicy';
        }else if(type==='thematic_education'){
          controller='partyspecial';
        }else{
          return;
        }
      if(val==='false'){
         $.ajax({
            method:'post',
            url:BASE_URL2+`/${controller}/setcollection`, 
            data:{
              data:that.$route.params.id,
              token:that.token,
              loginMark:that.loginMark
            },      
            success:function(res){
               if(res.code==200){
                that.toastText='收藏成功';
                that.show=true; 
                that.newsDetailInfo.donecollection='true';
                // setTimeout(()=>{
                //   $.ajax({
                //     method:'get',
                //     url:BASE_URL2+`/${controller}/data?data=${that.$route.params.id}&token=${that.token}&loginMark=${that.loginMark}`,                     
                //     success:function(res1){
                //        that.newsDetailInfo=res1.data[0]||{};          
                //       that.loading=false;
                //     }
                //   })                    
                // },3000)          
              }
            }
         })  
        //  this.$http.post(BASE_URL2+`/partynotice/setcollection`,{data:this.$route.params.id,token:this.token,loginMark:'api'})
        // .then(res=>{
        //   if(res.data.code==200){
        //     this.toastText='收藏成功';
        //     this.show=true; 
        //     setTimeout(()=>{
        //       that.$http.get(BASE_URL2+`/partynews/data?data=${that.$route.params.id}&token=${that.token}&loginMark=api`)
        //       .then(res1=>{
        //         that.newsDetailInfo=res1.data.data[0]||{};          
        //         this.loading=false;
        //       })
        //     },3000)          
        //   }
        // })
      }else{
         $.ajax({
            method:'post',
            url:BASE_URL2+`/${controller}/setuncollection`, 
            data:{
              data:that.$route.params.id,
              token:that.token,
              loginMark:that.loginMark
            },      
            success:function(res){
               if(res.code==200){
                that.toastText='已取消收藏';
                that.show=true;
                that.newsDetailInfo.donecollection='false';
                // setTimeout(()=>{
                //   $.ajax({
                //     method:'get',
                //     url:BASE_URL2+`/${controller}/data?data=${that.$route.params.id}&token=${that.token}&loginMark=${that.loginMark}`,                     
                //     success:function(res1){
                //       that.newsDetailInfo=res1.data[0]||{};          
                //     that.loading=false;
                //     }
                //   })                   
                // },3000)           
              }
            }
         })  
        //  this.$http.post(BASE_URL2+`/partynotice/setuncollection`,{data:this.$route.params.id,token:this.token,loginMark:'api'})
        // .then(res=>{
        //   if(res.data.code==200){
        //     this.toastText='已取消收藏';
        //     this.show=true;
        //     setTimeout(()=>{
        //       that.$http.get(BASE_URL2+`/partynews/data?data=${that.$route.params.id}&token=${that.token}&loginMark=api`)
        //       .then(res1=>{
        //         that.newsDetailInfo=res1.data.data[0]||{};          
        //         this.loading=false;
        //       })
        //     },3000)           
        //   }
        // })
      }
    },
    setlike(val){
      let that = this;
      if(this.hasClick) return;
      this.hasClick=true;
      let controller='';
        let type=this.$route.query.type;       
        if(type==='focus_news'){
          controller='partynews';
        }else if(type==='fighting_corruption'){
          controller='partyanticorruption';
        }else if(type==='notice'){
          controller='partynotice';
        }else if(type==='inner_party_publicity'){
          controller='partypublic';
        }else if(type==='policy_regulations'){
          controller='partypolicy';
        }else if(type==='thematic_education'){
          controller='partyspecial';
        }else{
          return;
        }
      if(val==='false'){
        $.ajax({
            method:'post',
            url:BASE_URL2+`/${controller}/setlike`, 
            data:{
              data:that.$route.params.id,
              token:that.token,
              loginMark:that.loginMark
            },      
            success:function(res){
               if(res.code==200){
                that.toastText='点赞成功';
                that.show=true; 
                that.newsDetailInfo.donelike='true';
                that.newsDetailInfo.collectioncount++;                  
                // setTimeout(()=>{
                //   $.ajax({
                //     method:'get',
                //     url:BASE_URL2+`/${controller}/data?data=${that.$route.params.id}&token=${that.token}&loginMark=${that.loginMark}`,                     
                //     success:function(res1){
                //       that.newsDetailInfo=res1.data[0]||{};          
                //       that.loading=false;
                //     }
                //   })                   
                // },3000)           
              }
            }
         }) 
        // this.$http.post(BASE_URL2+`/partynotice/setlike`,{data:this.$route.params.id,token:this.token,loginMark:'api'})
        // .then(res=>{
        //   if(res.data.code==200){
        //     this.toastText='点赞成功';
        //     this.show=true; 
        //     setTimeout(()=>{
        //       that.$http.get(BASE_URL2+`/partynews/data?data=${that.$route.params.id}&token=${that.token}&loginMark=api`)
        //       .then(res1=>{
        //         that.newsDetailInfo=res1.data.data[0]||{};          
        //         this.loading=false;
        //       })
        //     },3000)           
        //   }
        // })
      }else{
         $.ajax({
            method:'post',
            url:BASE_URL2+`/${controller}/setunlike`, 
            data:{
              data:that.$route.params.id,
              token:that.token,
              loginMark:that.loginMark
            },      
            success:function(res){
               if(res.code==200){
                that.toastText='已取消点赞';
                that.show=true;  
                that.newsDetailInfo.donelike='false';
                that.newsDetailInfo.collectioncount--;              
                // setTimeout(()=>{
                //   $.ajax({
                //     method:'get',
                //     url:BASE_URL2+`/${controller}/data?data=${that.$route.params.id}&token=${that.token}&loginMark=${that.loginMark}`,                     
                //     success:function(res1){
                //       that.newsDetailInfo=res1.data[0]||{};          
                //       that.loading=false;
                //     }
                //   })                   
                // },3000)           
              }
            }
         }) 
        // this.$http.post(BASE_URL2+`/partynotice/setunlike`,{data:this.$route.params.id,token:this.token,loginMark:'api'})
        // .then(res=>{
        //   if(res.data.code==200){
        //     this.toastText='已取消点赞';
        //     this.show=true; 
        //     setTimeout(()=>{
        //       that.$http.get(BASE_URL2+`/partynews/data?data=${that.$route.params.id}&token=${that.token}&loginMark=api`)
        //       .then(res1=>{
        //         that.newsDetailInfo=res1.data.data[0]||{};          
        //         this.loading=false;
        //       })
        //     },3000)          
        //   }
        // })
      }
    },
    repaly(name,id){
      let dom=document.querySelector('#commentTextArea');
      dom.focus();
      dom.value=`@${name} `;
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
  created() {
    let that = this;
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    this.userId=window.localStorage.getItem('userId');
    that.$nextTick(()=>{
      if (!that.notice_scroll) {
        that.detail_scroll = new BScroll(that.$refs.news_detail_wrapper, {
          probeType: 2, // 加这个属性才能监听到滑动
          bounce: true,
          click: true,
          startX: 0,
          startY: 0,
          pullUpLoad: {
            threshold: -10, // 负值是当上拉到超过低部 70px；正值是距离底部距离 时，
          }
        })
      } else {
        that.detail_scroll.refresh();
      }
      that.detail_scroll.on('pullingUp', () => {
        if(that.loading_false) return false;
        that.page++;
        that.getCommentList(that.token,'push')
      })
    })
  },
  activated() {
    const that=this;  
    this.loading=true; 
   // that.token=window.localStorage.getItem('partyToken'); 
    // that.userId=window.localStorage.getItem('partyUserId'); 
      //  console.log('1:',that.$route.params.id,that.getNewsId)
        let controller='';
        let type=this.$route.query.type;
        console.log(this)
        if(type==='focus_news'){
          controller='partynews';
        }else if(type==='fighting_corruption'){
          controller='partyanticorruption';
        }else if(type==='notice'){
          controller='partynotice';
        }else if(type==='inner_party_publicity'){
          controller='partypublic';
        }else if(type==='policy_regulations'){
          controller='partypolicy';
        }else if(type==='thematic_education'){
          controller='partyspecial';
        }else{
          return;
        }
        $.ajax({
        method:'get',
        url:BASE_URL2+`/${controller}/data?data=${that.$route.params.id}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          that.newsDetailInfo=res1.data[0]||{};  
          that.newsDetailInfo.content=that.replace_html_tag_attr(that.newsDetailInfo.content,'iframe','width','100%');        
          that.loading=false;
        }
      })
        // that.$http.get(BASE_URL2+`/${controller}/data?data=${that.$route.params.id}&token=${that.token}&loginMark=api`)
        // .then(res1=>{
        //   that.newsDetailInfo=res1.data.data[0]||{};          
        //   this.loading=false;
        // })
        that.getCommentList(that.token)
    // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
    // .then(res => {
    //   if(res.data.code==200){
    //     that.token=res.data.data.baseinfo.token;
    //     that.userId=res.data.data.baseinfo.userId;
    //     console.log('1:',that.$route.params.id,that.getNewsId)
    //     let controller='';
    //     let type=this.$route.query.type;
    //     console.log(this)
    //     if(type==='focus_news'){
    //       controller='partynews';
    //     }else if(type==='fighting_corruption'){
    //       controller='partyanticorruption';
    //     }else if(type==='notice'){
    //       controller='partynotice';
    //     }else if(type==='inner_party_publicity'){
    //       controller='partypublic';
    //     }else if(type==='policy_regulations'){
    //       controller='partypolicy';
    //     }else if(type==='thematic_education'){
    //       controller='partyspecial';
    //     }else{
    //       return;
    //     }
    //     that.$http.get(BASE_URL2+`/${controller}/data?data=${that.$route.params.id}&token=${that.token}&loginMark=api`)
    //     .then(res1=>{
    //       that.newsDetailInfo=res1.data.data[0]||{};          
    //       this.loading=false;
    //     })
    //     that.getCommentList(that.token)
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
    Loading,
    Toast,
  }
}
</script>


<style scoped>
.static{
  position: static !important;
}
.nodata{
  font-size: 22px;
  margin-top: 48px;
}
.no_data{
  text-align:center;
  font-size:16px;
  line-height:30px;
}
.news_detail_wrapper{
  position:fixed;
  left:0;
  top:0;
  right:0;
  bottom:0;
}
.news_detail_wrapper_content{
  padding-bottom:70px;
}
.news_detail{
  width: 100%;
  height: auto;
}
.news_content{
  padding-bottom:20px;
}
.news_title{
  width: 100%;
  height: 120px;
  box-sizing: border-box;
  padding: 20px 15px;
}
.news_title h3{
  width: 100%;
  color: #333;
  font-size: 20px;
  line-height: 25px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.news_title p{
  width: 100%;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  color: #999;
}
.news_box{
  width: 100%;
  height: auto;
}
.news_info{
  width: 100%;
  height: 40px;
  line-height: 40px;
  color: #999;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 15px;
  margin-bottom: 10px;
}
.news_info .info_left span{
  margin-right: 5px;
}
.news_info .info_right span{
  margin-left: 5px;
}
.corlor-red{
  color: red;
}
.news_comment{
  width: 100%;
  height: auto;
  background: #f1f1f1;
  box-sizing: border-box;
  padding: 15px;
}
.comment_title{
  font-size: 16px;
  color: #333;
  font-weight: 600;
}
.comment_box{
  width: 100%;
  height: auto;
  margin-top: 10px;
}
.comment_item{
  width: 100%;
  height: auto;
  margin-top: 5px;
  padding: 5px 0;
  border-bottom: 1px #dedede solid;
}
.comment_item:nth-last-of-type(1){
  border-bottom: none;
}
.item_info{
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  position: relative;
}
.info_header{
  width: 40px;
  height: 40px;
}
.info_header img{
  width: 100%;
  height: 100%;
}
.info_text{
  margin-left: 10px;
  height: 40px;
}
.info_text h4{
  height: 25px;
  line-height: 25px;
  font-size: 14px;
  color: #666;
}
.info_text p{
  height: 15px;
  line-height: 15px;
  font-size: 12px;
  color: #999;
}
.info_icon{
  width: 20px;
  height: 26px;
  background: url('../../assets/imgs/remove.png') center;
  background-size:100%;
  position: absolute;
  right: 0px;
  top: 0px;
}
.repaly{
  width: 50px;
  height: 26px;
  position: absolute;
  right: 0px;
  top: 0px;
  border:0 none;
  border-radius: 5px;
  background-color: #fff;
}
.item_content{
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding-left: 50px;
  line-height: 25px;
  font-size: 14px;
  color: #333;
}
.btn-d{
  text-align:center;
  display:inline-block;
  width:68px;
  height:34px; 
  line-height:34px; 
  background:#EAEBEC;      
  border-radius:34px;
}
.btn-d img{
  width:14px;
  height:14px;
  vertical-align:middle;
}
.active{
  background-color:#1890ff !important;
  color:#fff;
}
.active1{
  background-color:#1890ff !important;
}
.comment{  
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
  height:50px; 
  background:#fff;
  padding:8px;
  overflow:hidden;
}
.comment textarea{
  width: 283px;
    height: 44px;
    background-color: rgba(244,245,250,1);
    border-radius: 5px;
    border: 0;
    padding: 12px 5px;
    box-sizing: border-box;
}
.comment button{  
  color:#fff;
  float:right;
  margin-right: 16px;
  padding:5px;
  margin-top: 1px;
  width: 1.70667rem;
  height: 1.17333rem;
  background-color: #C10710;
  border: 0;
  float: right;
  border-radius: 0.13333rem;      
}
</style>