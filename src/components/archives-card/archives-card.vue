<template>
  <div class="archives_card">
    <div class="bg"></div>
    <div class="card_content">
      <div class="card_box">
        <div class="card_box_top">
          <img :src="info.porfile">
          <div class="box_top_text">
            <h4>{{info.name}}</h4>
            <p>{{info.mobile}}</p>
          </div>
        </div>
        <div class="card_box_middle">
          <div class="middle_item" v-for="(item,index) of info.fields">
            <p>{{item.title}}</p>
            <h4>{{item.value}}</h4>
          </div>
        </div>
        <div class="card_box_bottom">
          <img :src="info.qrcode">
          <p>使用微信扫一扫</p>
          <p>即可保存TA的名片到手机通讯录</p>
        </div>
      </div>
    </div>
    <div class="archives_bottom">
      <div class="bottom_item">
        <div class="bottom_icon">
          <img src="../../assets/imgs/branch_off.png">
        </div>
        <span @click="goLink('/archives')">组织结构</span>
      </div>
      <div class="bottom_item active">
        <div class="bottom_icon">
          <img src="../../assets/imgs/my_card_on.png">
        </div>
        <span @click="goLink('/archives-card')">我的档案</span>
      </div>
    </div>
  </div>
</template>

<script>
var clipboard
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import $ from "jquery"
import { BASE_URL2} from '@/assets/common/utils'
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
    },
  },
  data(){
    return {
      token:'',
      loginMark:'',
      info:{},
    }
  },
  created() {
    let that=this;
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    let newId = window.localStorage.getItem('PartyMemberId');
    let id=that.$route.query.partyorganizationid||newId
    $.ajax({
      method:'get',
      url:BASE_URL2+`/partymember/data?data=${id}&token=${that.token}&loginMark=${that.loginMark}`,       
      success:function(res1){
        console.log('res2:',res1)
        if(res1.code==200){
          that.info = res1.data
        }
      }
    })
    // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
    // .then(res => {
    //   if(res.data.code==200){
    //     // console.log('2:',res.data.data.baseinfo)
    //     that.token=res.data.data.baseinfo.token;
    //     let id=that.$route.query.partyorganizationid||res.data.data.baseinfo.partyMemberId
    //     console.log('3:',id)
    //     that.$http.get(BASE_URL2+`/partymember/data?data=${id}&token=${that.token}&loginMark=api`)
    //     .then(res1=>{
    //       console.log('1:',res1.data.data)
    //       that.info = res1.data.data
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
.archives_card{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: #f1f1f1;
}
.bg{
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: url("../../assets/imgs/bg.jpg");
  background-repeat: no-repeat;
  background-size: 100% 200px;
  background-color: #f1f1f1;
}
.card_content{
  width: 100%;
  height: 100%;
  position: relative;
  
}
.card_box{
  width: 330px;
  height: auto;
  background-color: #fff;
  border-radius: 10px;
  position: absolute;
  top: 25px;
  left: 50%;
  margin-bottom: 75px;
  transform: translateX(-50%);
  z-index: 9;
  box-sizing: border-box;
}
.card_box_top{
  width: 100%;
  height: 120px;
  border-bottom:1px #dbdbdb solid;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
}
.card_box_top img{
  width: 80px;
  height: 80px;
}
.box_top_text{
  width: 190px;
  height: 60px;
  margin: 10px 0 10px 10px;
}
.box_top_text h4{
  width: 100%;
  height: 35px;
  font-size: 18px;
  line-height: 35px;
  color: #333;
  font-weight: 600;
}
.box_top_text p{
  width: 100%;
  height: 25px;
  line-height: 25px;
  color: #999;
  font-size: 14px;
}
.card_box_middle{
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding: 0 20px;
}
.middle_item{
  width: 100%;
  height: 65px;
  box-sizing: border-box;
  padding: 10px 0;
  border-bottom:1px #dbdbdb solid;
}
.middle_item p{
  width: 100%;
  height: 20px;
  line-height: 20px;
  color: #999;
  font-size: 14px;
}
.middle_item h4{
  width: 100%;
  height: 25px;
  line-height: 25px;
  font-size: 16px;
  color: #333;
}

.card_box_bottom{
  width: 100%;
  height: 260px;
  box-sizing: border-box;
  text-align: center;
  z-index: 100;
}
.card_box_bottom img{
  width: 160px;
  height: 160px;
  margin:20px;
}
.card_box_bottom p{
  width: 100%;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  color: #999;
}

.archives_bottom{
  background-color: #fff;
  width: 100%;
  height: 55px;
  position: fixed;
  bottom: 0;
  left: 0;
  border-top: 1px #dbdbdb solid;
  display: flex;
  z-index: 100;
}
.bottom_item{
  width: 50%;
  height: 55px;
  box-sizing: border-box;
  line-height: 25px;
  font-size: 16px;
  display: flex;
  vertical-align: middle;
  justify-content: space-around;
  padding: 15px 30px;
  color: #333;
}
.bottom_item .bottom_icon{
  width: 25px;
  height: 25px;
  /* background-color: #ddd; */
}
.bottom_item .bottom_icon img{
  width: 100%;
  height: 100%;
}
.bottom_item.active{
  color: red;
}
.bottom_item.active .bottom_icon{
  /* background-color:red; */
}
</style>
