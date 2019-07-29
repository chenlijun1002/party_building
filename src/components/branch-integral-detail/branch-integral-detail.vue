<template>
  <div class="wrap">
    <div class="my_integral">
      <div class="my_bg"></div>
      <div class="my_integral_box">
        <h3 @click="openPicker">{{year}}年{{month}}月<img src="../../assets/imgs/more_icon.png" /></h3>
        <div class="integral_info">
          <div class="info_item">
            <h4>{{branchIntegral.monthBranchIntegral}}</h4>
            <p>支部积分</p>
          </div>
          <div class="info_item">
            <h4>{{branchIntegral.totalIntegral}}</h4>
            <p>总积分</p>
          </div>
          <div class="info_item">
            <h4>{{branchIntegral.changeIntegral}}</h4>
            <p>增减积分</p>
          </div>
        </div>
      </div>
    </div>
    <div class="notes">注：本月支部积分=总积分/组织人数+增减积分</div>
    <div class="roster">
      <div class="roster_title">
        <span :class="[changeFlag ?'active' : '']" @click="goRoster">组织名单</span>
        <span :class="[changeFlag ? '' : 'active']" @click="goChange">增减积分</span>
      </div>
      <div class="roster_list">
        <div class="list_item" v-for="(item,index) of organizationList" v-if="changeFlag">
          <img :src="item.headerUrl">
          <div class="item_text">
            <h4>{{item.name}}</h4>
            <p>{{item.branchName}}</p>
          </div>
          <div class="item_integral">{{item.integral}}</div>
        </div>
        <div class="list_item" v-for="(item,index) of changeIntegralList" v-if="!changeFlag">
          <img :src="item.headerUrl">
          <div class="item_text">
            <h4>{{item.name}}</h4>
            <p>{{item.branchName}}</p>
          </div>
          <div class="item_integral">{{item.changeIntegral}}</div>
        </div>
      </div>
    </div>
    <mt-datetime-picker
      type="date"
      ref="picker"
      year-format="{value} 年"
      month-format="{value} 月"
      date-format="{value} 日"
      @confirm="monthConfirm"
      :startDate="startDate"
      >
    </mt-datetime-picker>
  </div>
</template>

<script>
var clipboard
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import { BASE_URL2} from '@/assets/common/utils'
import { DatetimePicker } from 'mint-ui';
import $ from "jquery"
Vue.component(DatetimePicker.name, DatetimePicker);
export default {
  computed: {
  },
  name: 'Home',
  mounted() {
    //      this.copy_text();
  },
  methods: {
    getData(){
      let that = this
      let parmes=JSON.stringify({
        partyBranchId:this.branchid,
        date:this.year+'-'+this.month,
      })
      $.ajax({
        method:'get',
        url:BASE_URL2+`/user/branchMonthIntegral?data=${parmes}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res1:',res1)
          if(res1.code==200){
            that.branchIntegral = res1.data
            that.organizationList = res1.data.organizationList
            that.changeIntegralList = res1.data.changeIntegralList
          }
        }
      })
      // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
      // .then(res => {
      //   if(res.data.code==200){
      //     that.token=res.data.data.baseinfo.token;
      //     that.$http.get(BASE_URL2+`/user/branchMonthIntegral?data=${parmes}&token=${that.token}&loginMark=api`)
      //     .then(res1=>{
            
      //       if(res1.data.code==200){
      //         // that.userInfo = res1.data.data
      //         console.log(res1.data.data)
      //       }
      //     })
      //   }
      // })
      // .catch(e => console.log(e))
    },
    goRoster(){
      this.changeFlag = true
    },
    goChange(){
      this.changeFlag = false
    },
    openPicker(){
      $(".picker-slot.picker-slot-center")[2].style.display="none"
      this.$refs.picker.open();
    },
    monthConfirm(data){
      this.year=data.getFullYear()
      this.month=data.getMonth()+1
      // console.log(this.month)
      this.get.Data()
    },
  },
  data(){
    return {
      token:'',
      loginMark:'',
      year:'',
      month:'',
      startDate: new Date('2017/1/1'),
      branchid:'',
      changeFlag:true,
      branchIntegral:{},
      organizationList:[],
      changeIntegralList:[],
    }
  },
  created() {
    // console.log(this.$route.query.branchid)
    this.branchid = this.$route.query.branchid
    let nowDate = new Date
    this.year=nowDate.getFullYear()
    this.month=nowDate.getMonth()+1
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    this.getData()
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
.my_integral{
  width: 100%;
  height: 180px;
  box-sizing: border-box;
  position: relative;
  padding: 0 20px;
  overflow: hidden;
}
.my_bg{
  width: 575px;
  height: 140px;
  background: #C10710;
  position: absolute;
  border-radius: 0 0 200px 200px;
  top: 0;
  left: -100px;
  z-index: 1;
}
.my_integral_box{
  position: relative;
  top: 20px;
  left: 0;
  width: 100%;
  height: 148px;
  background: #fff;
  z-index: 10;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px;
}
.my_integral_box h3{
  width: 100%;
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  color: #333;
  text-align: center;
  vertical-align: middle;
}
.my_integral_box h3 img{
  width: 8px;
  height: 16px;
  left: 10px;
  position: relative;
  top: 2px;
}
.integral_info{
  width: 100%;
  height: 80px;
  display: flex;
}
.info_item{
  width: 33%;
  height: 80px;
  text-align: center;
}
.info_item h4{
  width: 100%;
  height: 40px;
  line-height: 40px;
  margin-top: 10px;
  font-size: 24px;
  color: #FF6428;
}
.info_item p{
  width: 100%;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  color: #999;
}
.notes{
  width: 100%;
  height: 30px;
  line-height: 30px;
  box-sizing: border-box;
  padding: 0 20px;
  font-size: 14px;
  color: #999;
}
.roster{
  width: 100%;
  height: auto;
  box-sizing: border-box;
  background: #fff;
  margin-top: 10px;
}
.roster_title{
  width: 100%;
  height: 55px;
  display: flex;
  justify-content: space-around;
  border-bottom: 1px #dbdbdb solid;
}
.roster_title span{
  display: inline-block;
  width: 35%;
  height: 55px;
  box-sizing: border-box;
  line-height: 53px;
  text-align: center;
  font-size: 16px;
  color: #999;
}
.roster_title span.active{
  color: #C10710;
  border-bottom: 2px #C10710 solid;
}
.roster_list{
  width: 100%;
  height: auto;
}
.list_item{
  width: 100%;
  height: 88px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  border-bottom: 1px #dbdbdb solid;
  padding: 20px;
}
.list_item img{
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.item_text{
  width: 230px;
  height: 48px;
}
.item_text h4{
  width: 100%;
  height: 28px;
  line-height: 28px;
  font-size: 18px;
  color: #333;
}
.item_text p{
  width: 100%;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  color: #999;
}
.item_integral{
  width: 35px;
  height: 48px;
  line-height: 48px;
  text-align: right;
  color: #333;
  font-size: 18px;
}
</style>
