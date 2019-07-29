<template>
  <div class="wrap">
    <div class="my_integral">
      <div class="my_bg"></div>
      <div class="my_integral_box">
        <h3>个人年度积分<span v-if='yearFlag' @click="openYearPicker">{{year}}年</span><span v-if='!yearFlag' @click="openMonthPicker">{{month}}月</span><img src="../../assets/imgs/more_icon.png" /></h3>
        <div class="box_screen">
          <div class="screen_item">
            <span @click="goMonth" :class="[yearFlag ?'' : 'active']">月</span>
          </div>
          <div class="screen_item">
            <span @click="goYear" :class="[yearFlag ?'active' : '']">年</span>
          </div>
        </div>
        <div class="box_ranking">
          <div class="ranking_item">
            <h4>{{myIntergral.integral}}</h4>
            <p>年积分</p>
          </div>
          <div class="hr"></div>
          <div class="ranking_item">
            <h4>{{myIntergral.ranking}}</h4>
            <p>年排名</p>
          </div>
        </div>
        <p class="see" @click="goMyIntegral">查看积分明细</p>
      </div>
    </div>
    <div class="branch_integral">
      <h3>支部年度积分<span>{{branchIntegral.name}}</span></h3>
      <div class="box_ranking">
        <div class="ranking_item">
          <h4>{{branchIntegral.integral}}</h4>
          <p>年积分</p>
        </div>
        <div class="hr"></div>
        <div class="ranking_item">
          <h4>{{branchIntegral.ranking}}</h4>
          <p>年排名</p>
        </div>
      </div>
      <p class="see" @click="goBranch">查看积分明细</p>
    </div>
    <div class="bottom">
      <div class="bottom_item" @click="goMyRank">
        <div class="item_pic">
          <img src="../../assets/imgs/my_rank.png">
        </div>
        <div class="item_text">个人排行榜</div>
      </div>
      <div class="bottom_item" @click="goBranchRank">
        <div class="item_pic">
          <img src="../../assets/imgs/branch_rank.png">
        </div>
        <div class="item_text">组织排行榜</div>
      </div>
    </div>
    <mt-datetime-picker
      type="date"
      ref="yearpicker"
      year-format="{value} 年"
      month-format="{value} 月"
      date-format="{value} 日"
      @confirm="yearConfirm"
      :startDate="startDate"
      >
    </mt-datetime-picker>
    <mt-datetime-picker
      type="date"
      ref="monthpicker"
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
    goMyRank(){
      let myFlag = true
      this.$router.push({path:'/my-ranking',query:{flag:myFlag}})
    },
    goBranchRank(){
      let myFlag = false
      this.$router.push({path:'/my-ranking',query:{flag:myFlag}})
    },
    openYearPicker() {
      $(".picker-slot.picker-slot-center")[1].style.display="none"
      $(".picker-slot.picker-slot-center")[2].style.display="none"
      this.$refs.yearpicker.open();
    },
    openMonthPicker(){
      $(".picker-slot.picker-slot-center")[5].style.display="none"
      this.$refs.monthpicker.open();
    },
    monthConfirm(data){
      this.year=data.getFullYear()
      this.month=data.getMonth()+1
      this.searchType = 'month'
      this.getData()
      // console.log(this.month)
    },
    yearConfirm(data){
      // console.log(data)
      this.year=data.getFullYear()
      this.searchType = 'year'
      this.getData()
      // console.log(this.year)
    },
    goMonth(){
      this.yearFlag = false
      this.searchType = 'month'
      this.getData()
    },
    goYear(){
      this.yearFlag = true
      this.searchType = 'year'
      this.getData()
    },
    goBranch(){
      // console.log(this.branchIntegral.id)
      let id = this.branchIntegral.id
      this.$router.push({path:'/branch-integral-detail',query:{branchid:id}})
    },
    goMyIntegral(){
      this.$router.push({path:'/my-integral-detail'})
    },
    getData(){
      let that = this
      let parmes=JSON.stringify({
        searchType:this.searchType,
        date:this.year+'-'+this.month,
      })
      $.ajax({
        method:'get',
        url:BASE_URL2+`/user/myIntegral?data=${parmes}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res1:',res1)
          if(res1.code==200){
            that.branchIntegral = res1.data.branchIntegral
            that.myIntergral = res1.data.myIntergral
          }
        }
      })
      // that.$http.post(BASE_URL2 + '/user/login',{ data: JSON.stringify({"username":"SaoQingHuaHua", "password":"4a7d1ed414474e4033ac29ccb8653d9b"}),token: "",loginMark: "api"})
      // .then(res => {
      //   if(res.data.code==200){
      //     that.token=res.data.data.baseinfo.token;
      //     that.$http.get(BASE_URL2+`/user/myIntegral?data=${parmes}&token=${that.token}&loginMark=api`)
      //     .then(res1=>{
            
      //       if(res1.data.code==200){
      //         // that.userInfo = res1.data.data
      //         console.log(res1.data.data)
      //         that.branchIntegral = res1.data.data.branchIntegral
      //         that.myIntergral = res1.data.data.myIntergral
      //         // console.log(that.branchIntegral.ranking)
      //       }
      //     })
      //   }
      // })
      // .catch(e => console.log(e))
    },
  },
  data(){
    return {
      token:'',
      loginMark:'',
      searchType:'year',
      yearFlag:true,
      year:'',
      month:'',
      startDate: new Date('2017/1/1'),
      pickerValue:'',
      branchIntegral:{},
      myIntergral:{},
    }
  },
  created() {
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
  height: 250px;
  box-sizing: border-box;
  position: relative;
  padding: 0 20px;
  overflow: hidden;
}
.my_bg{
  width: 575px;
  height: 160px;
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
  height: 230px;
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
  font-size: 18px;
  color: #333;
  font-weight: 600;
  position: relative;
}
.my_integral_box h3 span{
  position: absolute;
  right: 15px;
  top: 0;
  font-size: 16px;
  color: #999;
  font-weight: 500;
}
.my_integral_box h3 img{
  width: 8px;
  height: 16px;
  position: absolute;
  right: 0;
  top: 6px;
}
.box_screen{
  width: 100%;
  height: 28px;
  display: flex;
  margin-top: 15px;
  box-sizing: border-box;
}
.screen_item{
  width: 50%;
  text-align: right;
  margin-right: 5px;
  box-sizing: border-box;
}
.screen_item:nth-of-type(2){
  text-align: left;
  margin-left: 5px;
}
.box_screen span{
  display: inline-block;
  width: 60px;
  height: 28px;
  box-sizing: border-box;
  border: 1px solid #DBDBDB;
  background: #fff;
  border-radius: 14px;
  font-size: 14px;
  color: #333;
  text-align: center;
  line-height: 26px;
}
.box_screen span.active{
  background: #FF6428;
  border: 1px solid #FF6428;
  color: #fff;
}
.box_ranking{
  width: 100%;
  height: 56px;
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}
.ranking_item{
  width: 49%;
  height: 56px;
  text-align: center;
}
.hr{
  width: 1px;
  height: 30px;
  margin-top:18px;
  background: #DBDBDB;
}
.ranking_item h4{
  font-size: 24px;
  font-weight: 600;
  color: #C10710;
  width: 100%;
  height: 36px;
  line-height: 36px;
}
.ranking_item p{
  width: 100%;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  color: #999;
}
.see{
  width: 100%;
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-size: 16px;
  color: #FF6428;
  margin-top: 10px;
}
.branch_integral{
  width: 335px;
  margin-left: 20px;
  margin-top: 20px;
  height: 174px;
  padding: 20px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 10px;
}
.branch_integral h3{
  width: 100%;
  height: 30px;
  line-height: 30px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  position: relative;
}
.branch_integral h3 span{
  font-size: 16px;
  color: #999;
  font-weight: 500;
  margin-left: 20px;
}
.bottom{
  margin-top: 20px;
  width: 100%;
  height: 130px;
  display: flex;
  box-sizing: border-box;
  padding: 20px;
}
.bottom_item{
  width: 50%;
  height: 90px;
  text-align: center;
}
.item_pic{
  display: inline-block;
  width: 50px;
  height: 50px;
  /* background: #C10710; */
  border-radius: 50%;
}
.item_pic img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.item_text{
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 14px;
  color: #333;
}
</style>
