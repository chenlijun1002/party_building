<template>
  <div class="archives">
    <div class="search_panel">
      <div class="search_panel_content">
        <div class="search_input_ctrl">
          <form  @submit.prevent action="#">
            <input type="serch" @keypress="search" v-model='searchtext' placeholder="搜索姓名/手机号码/党内职位/党支部" />
          </form>
        </div>
      </div>
    </div>
    <div class="nav">
      <span @click="goLink('/index')">首页</span>
      <span v-for="(item,index) of parentList" @click='childGo(index)'>> {{item.name}}</span>
    </div>
    <div class="archives_wrapper">
      <div class="archives_top" v-if="haschild">
        <div class="archives_item" v-for="(item,index) of childList" @click='changChild(index)'>
          <img src="http://lr7web.hnyonyou.net/resource/organization.png">
          <span>{{item.name}}</span>
          <img class="right" src="../../assets/imgs/more_icon.png">
        </div>
      </div>
      <div class="archives_content">
        <div class="archives_item" v-for="(item,index) of archivesList" @click='goLinkItem(index)'>
          <img :src="item.porfile">
          <span>{{item.name}}</span>
          <button class="right" @click.stop='call(index)'>联系</button>
        </div>
      </div>
    </div>
    <div class="archives_bottom">
      <div class="bottom_item active">
        <div class="bottom_icon">
          <img src="../../assets/imgs/branch_on.png">
        </div>
        <span @click="goLink('/archives')">组织机构</span>
      </div>
      <div class="bottom_item">
        <div class="bottom_icon">
          <img src="../../assets/imgs/my_card_off.png">
        </div>
        <span @click="goLink('/archives-card')">我的档案</span>
      </div>
    </div>
    <div class="modle_call" v-if="callFlag" @click='closeCall'>
      <div class="call_box">
        <a class="btn_a" :href="tel">拨打电话</a>
        <a class="btn_a" :href="sms">发送短信</a>
        <button class="btn_a margin_top" @click='closeCall'>取消</button>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<script>
var clipboard
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import { Toast } from 'mint-ui'
import $ from "jquery"
import { BASE_URL2} from '@/assets/common/utils'
export default {
  computed: {

  },
  name: 'Home',
  mounted() {
    //      this.copy_text();
  },
  data(){
    return {
      token:'',
      loginMark:'',
      archivesId:'',
      name:'',
      token:'',
      archivesList:[],
      callFlag:false,
      haschild:false,
      searchtext:'',
      childList:[],
      parentList:[],
      tel:'',
      sms:'',
    }
  },
  methods: {
    changChild(idx){
      let that=this
      // console.log(that.childList[idx].id)
      let id = that.childList[idx].id
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partyorganization/list?data=${id}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res2:',res1)
          if(res1.code==200){
            that.childList = res1.data.child
            that.parentList.push({
              id:res1.data.id,
              name:res1.data.name
            })
            that.haschild = res1.data.haschild
            that.name = res1.data.name
            that.archivesId = res1.data.id
            that._getPartymemberList()
          }
        }
      })
      // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"System", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
      // .then(res => {
      //   if(res.data.code==200){
      //     that.token=res.data.data.baseinfo.token;
      //     that.$http.get(BASE_URL2+`/partyorganization/list?data=${id}&token=${that.token}&loginMark=api`)
      //     .then(res1=>{
      //       that.childList = res1.data.data.child
      //       that.parentList.push({
      //         id:res1.data.data.id,
      //         name:res1.data.data.name
      //       })
      //       that.haschild = res1.data.data.haschild
      //       that.name = res1.data.data.name
      //       that.archivesId = res1.data.data.id
      //       that._getPartymemberList()
      //     })
      //   }
      // })
      // .catch(e => console.log(e))
    },
    childGo(idx){
      let that=this
      console.log(that.parentList[idx].id)
      let id = that.parentList[idx].id
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partyorganization/list?data=${id}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res3:',res1)
          if(res1.code==200){
            that.childList = res1.data.child
            let mun = idx+1
            that.parentList = that.parentList.slice(0,mun)
            // console.log('3:',that.parentList)
            that.haschild = res1.data.haschild
            that.name = res1.data.name
            that.archivesId = res1.data.id
            // console.log('1:',res1.data)
            that._getPartymemberList()
          }
        }
      })
      // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"System", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
      // .then(res => {
      //   if(res.data.code==200){
      //     that.token=res.data.data.baseinfo.token;
      //     that.$http.get(BASE_URL2+`/partyorganization/list?data=${id}&token=${that.token}&loginMark=api`)
      //     .then(res1=>{
      //       that.childList = res1.data.data.child
      //       let mun = idx+1
      //       that.parentList = that.parentList.slice(0,mun)
      //       // console.log('3:',that.parentList)
      //       that.haschild = res1.data.data.haschild
      //       that.name = res1.data.data.name
      //       that.archivesId = res1.data.data.id
      //       // console.log('1:',res1.data)
      //       that._getPartymemberList()
      //     })
      //   }
      // })
      // .catch(e => console.log(e))
    },
    search(event) { 
      if (event.keyCode == 13) { //如果按的是enter键 13是enter 
          event.preventDefault(); //禁止默认事件（默认是换行） 
          this._getPartymemberList();
      } 
    },
    _getPartymemberList(){
      let that=this
      let parmes=JSON.stringify({
        partyOrganizationId:this.archivesId,
        keywords:this.searchtext,
      })
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partymember/list?data=${parmes}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res4:',res1)
          if(res1.code==200){
            that.archivesList = res1.data
          }
        }
      })
      // that.$http.get(BASE_URL2+`/partymember/list?data=${parmes}&token=${that.token}&loginMark=api`)
      // .then(res2=>{
      //   that.archivesList = res2.data.data
      //   // console.log(res2.data.data)
      // })
    },
    goLink(router){
      if(router) this.$router.push(router);
    },
    goLinkItem(i){
      // console.log('5:',this.archivesList[i])
      let id = this.archivesList[i].id
      this.$router.push({path:'/archives-card',query:{partyorganizationid:id}})
    },
    call(index){
      this.callFlag=true
      this.archivesList[index]
      this.tel = 'tel:' + this.archivesList[index].mobile
      this.sms = 'sms:' + this.archivesList[index].mobile
      // console.log(this.tel)
    },
    closeCall(){
      this.callFlag=false
    },
    _getPartyorganization(){
      let that=this;
      $.ajax({
        method:'get',
        url:BASE_URL2+`/partyorganization/list?&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res5:',res1)
          if(res1.code==200){
            that.childList = res1.data.child
            // that.parentList = res1.data.data.parent
            that.parentList.push({
              id:res1.data.id,
              name:res1.data.name
            })
            that.haschild = res1.data.haschild
            that.name = res1.data.name
            that.archivesId = res1.data.id
            that._getPartymemberList()
          }
        }
      })
      // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"System", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
      // .then(res => {
      //   if(res.data.code==200){
      //     that.token=res.data.data.baseinfo.token;
      //     that.$http.get(BASE_URL2+`/partyorganization/list?&token=${that.token}&loginMark=api`)
      //     .then(res1=>{
      //       that.childList = res1.data.data.child
      //       // that.parentList = res1.data.data.parent
      //       that.parentList.push({
      //         id:res1.data.data.id,
      //         name:res1.data.data.name
      //       })
      //       that.haschild = res1.data.data.haschild
      //       that.name = res1.data.data.name
      //       that.archivesId = res1.data.data.id
      //       // console.log('1:',res1.data)
      //       that._getPartymemberList()
      //     })
      //   }
      // })
      // .catch(e => console.log(e))
    },
  },
  created() {
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    this._getPartyorganization();
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
html,body{
  width: 100%;
  height: 100%;
}
.archives{
  padding-top:44px;
  width: 100%;
  height: 100%;
  background-color: #F4F5FA;
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
  width:33px;
  height:23px;
  right:15px;
  font-size: 14px;
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
.nav{
  width: 100%;
  height: auto;
  line-height: 44px;
  font-size: 16px;
  padding: 0 10px;
  box-sizing: border-box;
}
.nav span{
  margin-right: 5px;
  color: #666;
}
.nav span:nth-last-of-type(1){
  color: #ff0000;
}
.archives_wrapper{
  width: 100%;
  height: auto;
  box-sizing: border-box;
}
.archives_top{
  width: 100%;
  height: auto;
  border-top: 1px solid #DBDBDB;
  border-bottom: 1px solid #DBDBDB;
  box-sizing: border-box;
  padding: 0 15px;
  background: #fff;
}
.archives_item:nth-last-of-type(1){
  border-bottom:none;
}
.archives_content{
  margin-top: 10px;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding-left: 15px;
  background: #fff;
  border-top: 1px solid #DBDBDB;
  border-bottom: 1px solid #DBDBDB;
}
.archives_item{
  width: 100%;
  box-sizing: border-box;
  height: 55px;
  line-height: 55px;
  display: flex;
  position: relative;
  border-bottom: 1px solid #DBDBDB;
}
.archives_item img{
  width: 25px;
  height: 25px;
  margin:15px 15px 15px 0;
}
.archives_item span{
  font-size: 16px;
  color: #333;
}
.archives_item button.right{
  position: absolute;
  width: 72px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background-color: #fff;
  border: 1px #dbdbdb solid;
  border-radius: 4px;
  top: 13px;
  right: 15px;
  color: #999;
}
.archives_item img.right{
  position: absolute;
  width: 8px;
  height: 14px;
  top:5px;
  right: -10px;
}
.archives_bottom{
  width: 100%;
  height: 55px;
  position: fixed;
  bottom: 0;
  left: 0;
  border-top: 1px #dbdbdb solid;
  display: flex;
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
  background-color: #fff;
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
.modle_call{
  width: 100%;
  height: 100%;
  position: absolute;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  top: 0;
}
.call_box{
  width: 100%;
  height: 130px;
  background: #f1f1f1;
  position: fixed;
  bottom: 0;
}
.btn_a{
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: #fff;
  display: block;
  border-bottom: 1px #dedede solid;
  color: #333;
  font-size: 18px;
}
.margin_top{
  margin-top: 10px;
  border: 0;
  outline: none;
}
</style>
