<template>
  <div class="wrap">
    <div class="top">
      <div class="top_pic">
        <img :src="userInfo.headerUrl">
      </div>
      <div class="top_text">
        <h4>{{userInfo.name}}</h4>
        <p>{{userInfo.partyBranch}}</p>
      </div>
    </div>
    <div class="middle">
      <div class="middle_item">
        <h3>{{userInfo.yearIntegral}}</h3>
        <p>年积分</p>
      </div>
      <div class="middle_item">
        <h3>{{userInfo.yearRanking}}</h3>
        <p>年排名</p>
      </div>
    </div>
    <div class="bottom">
      <div class="bottom_item" @click="goLink('/my-integral')">
        <div class="item_pic">
          <img src="../../assets/imgs/integral.png">
        </div>
        <h4>我的积分</h4>
        <p>党员考评依据</p>
      </div>
      <div class="bottom_item" @click="goLink('/my-collection')">
        <div class="item_pic">
          <img src="../../assets/imgs/collection.png">
        </div>
        <h4>我的收藏</h4>
        <p>收藏图文，方便查找</p>
      </div>
    </div>
  </div>
</template>

<script>
var clipboard
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import { BASE_URL2} from '@/assets/common/utils'
import $ from "jquery"
export default {
  computed: {
  },
  name: 'Home',
  mounted() {
    //      this.copy_text();
  },
  methods: {
    goLink(router){
      if(router) this.$router.push(router);
      // console.log(router)
    },
  },
  data(){
    return {
      userInfo:{},
      token:'',
      loginMark:'',
    }
  },
  created() {
    let that=this
     that.token=window.localStorage.getItem('partyToken');
     that.loginMark=window.localStorage.getItem('loginMark');
     $.ajax({
        method:'get',
        url:BASE_URL2+`/user/my?&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log(res1.data)
          if(res1.code==200){
            that.userInfo = res1.data
          }
        }
      })
    // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
    // .then(res => {
    //   if(res.data.code==200){
    //     that.token=res.data.data.baseinfo.token;
    //     that.$http.get(BASE_URL2+`/user/my?&token=${that.token}&loginMark=api`)
    //     .then(res1=>{
    //       console.log(res1.data)
    //       if(res1.data.code==200){
    //         that.userInfo = res1.data.data
    //       }
    //     })
    //   }
    // })
    // .catch(e => console.log(e))
  },
  activated() {
    
  },
  deactivated() {
    
  },
  beforeDestory() {

  },
  update() {
    
  },
  components: {
    
  }
}
</script>


<style scoped>
.wrap{
  width: 100%;
  height: 667px;
  background: #f1f1f1;
}
.top{
  width: 100%;
  height: 150px;
  display: flex;
  background: #C10710;
  background-image: url(../../assets/imgs/my_bg.png);
  background-repeat: no-repeat;
  background-size: 375px 150px;
}
.top_pic{
  width: 64px;
  height: 64px;
  margin-top: 66px;
  margin-left: 20px;
  box-sizing: border-box;
  border: 2px #fff solid;
  border-radius: 50%;
  /* background: #BF9E72; */
}
.top_pic img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.top_text{
  width: 250px;
  height: 54px;
  margin-left: 10px;
  margin-top: 71px;
}
.top_text h4{
  width: 100%;
  height: 30px;
  line-height: 30px;
  font-size: 18px;
  color: #fff;
}
.top_text p{
  width: 100%;
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  color: #fefefe;
}
.middle{
  width: 100%;
  height: 110px;
  box-sizing: border-box;
  display: flex;
  background: #fff;
}
.middle_item{
  width: 50%;
  height: 110px;
  box-sizing: border-box;
  text-align: center;
  padding: 25px 0;
}
.middle_item h3{
  width: 100%;
  height: 35px;
  line-height: 35px;
  color: #C10710;
  font-size: 30px;
  font-weight: 600;
}
.middle_item p{
  width: 100%;
  height: 25px;
  line-height: 25px;
  color: #999;
  font-size: 14px;
}
.bottom{
  width: 100%;
  height: 150px;
  margin-top: 20px;
  background: #fff;
  display: flex;
}
.bottom_item{
  width: 50%;
  height: 150px;
  box-sizing: border-box;
  text-align: center;
  padding: 28px 0;
  border-right: 1px solid #DBDBDB;
}
.bottom_item:nth-of-type(2){
  border-right: none;
}
.item_pic{
  display: inline-block;
  width: 44px;
  height: 44px;
  /* background: #BF9E72; */
}
.item_pic img{
  width: 100%;
  height: 100%;
}
.bottom_item h4{
  width: 100%;
  height: 25px;
  line-height: 25px;
  color: #000;
  font-size: 16px;
}
.bottom_item p{
  width: 100%;
  height: 25px;
  line-height: 25px;
  color: #999;
  font-size: 14px;
}
</style>
