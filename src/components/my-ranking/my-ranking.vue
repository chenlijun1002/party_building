<template>
  <div class="ranking">
    <div class="ranking_header">
      <div class="header_date">
        <div class="date_item">
          <span v-if="dateFlag" @click="openMonthPicker">{{year}}年</span>
          <span v-if="!dateFlag" @click="openMonthPicker">{{year}}年{{month}}月</span>
          <img src="../../assets/imgs/more_icon.png" />
        </div>
        <div class="date_tab">
          <span @click="flagMonth" :class="[dateFlag ?'' : 'active']">月</span>
          <span @click="flagYear" :class="[dateFlag ?'active' : '']">年</span>
        </div>
      </div>
      <div class="header_tab">
        <div class="tab_item" @click="flagMy" :class="[myFlag ?'active' : '']">总排名</div>
        <div class="tab_item" @click="flagBranch" :class="[myFlag ?'' : 'active']">所属机构排名</div>
      </div>
    </div>
    <div class="ranking_content">
      <div class="my_ranking" v-if="myFlag">
        <div class="content_top">
          <div class="top_two">
            <div class="top_pic">
              <img :src="myRankList[1].headerUrl" >
            </div>
            <div class="top_num">{{myRankList[1].ranking}}</div>
            <div class="top_name">{{myRankList[1].name}}</div>
            <div class="top_branch">{{myRankList[1].branchName}}</div>
            <div class="top_integral">{{myRankList[1].integral}}</div>
          </div>
          <div class="top_one">
            <div class="top_pic">
              <img :src="myRankList[0].headerUrl" >
            </div>
            <div class="top_num">{{myRankList[0].ranking}}</div>
            <div class="top_name">{{myRankList[0].name}}</div>
            <div class="top_branch">{{myRankList[0].branchName}}</div>
            <div class="top_integral">{{myRankList[0].integral}}</div>
          </div>
          <div class="top_three">
            <div class="top_pic">
              <img :src="myRankList[2].headerUrl" >
            </div>
            <div class="top_num">{{myRankList[2].ranking}}</div>
            <div class="top_name">{{myRankList[2].name}}</div>
            <div class="top_branch">{{myRankList[2].branchName}}</div>
            <div class="top_integral">{{myRankList[2].integral}}</div>
          </div>
        </div>
        <div class="content_list">
          <div class="list_item" v-for="(item,index) of myItemList">
            <div class="list_num">{{item.ranking}}</div>
            <div class="list_pic">
              <img :src="item.headerUrl" >
            </div>
            <div class="list_text">
              <h4>{{item.name}}</h4>
              <p>{{item.branchName}}</p>
            </div>
            <div class="list_integral">{{item.integral}}</div>
          </div>
        </div>
      </div>
      <div class="branch_ranking" v-if="!myFlag">
        <div class="content_top">
          <div class="top_two">
            <div class="top_pic">
              <img src="../../assets/imgs/silver.png">
            </div>
            <div class="top_num">{{branchRankList[1].ranking}}</div>
            <div class="top_name">{{branchRankList[1].branchName}}</div>
            <div class="top_integral">{{branchRankList[1].integral}}</div>
          </div>
          <div class="top_one">
            <div class="top_pic">
              <img src="../../assets/imgs/gold.png">
            </div>
            <div class="top_num">{{branchRankList[0].ranking}}</div>
            <div class="top_name">{{branchRankList[0].branchName}}</div>
            <div class="top_integral">{{branchRankList[0].integral}}</div>
          </div>
          <div class="top_three">
            <div class="top_pic">
              <img src="../../assets/imgs/bronze.png">
            </div>
            <div class="top_num">{{branchRankList[2].ranking}}</div>
            <div class="top_name">{{branchRankList[2].branchName}}</div>
            <div class="top_integral">{{branchRankList[2].integral}}</div>
          </div>
        </div>
        <div class="content_list">
          <div class="list_item" v-for="(item,index) of branchItemList">
            <div class="list_num">{{item.ranking}}</div>
            <div class="list_text">{{item.branchName}}</div>
            <div class="list_integral">{{item.integral}}</div>
          </div>
        </div>
      </div>
    </div>
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
    flagLink(router){
      if(router) this.$router.push(router);
    },
    flagMonth(){
      this.dateFlag = false
      this.searchType = 'month'
      if(this.myFlag){
        this.getMyranking()
      }else{
        this.getBranchRanking()
      }
    },
    flagYear(){
      this.dateFlag = true
      this.searchType = 'year'
      if(this.myFlag){
        this.getMyranking()
      }else{
        this.getBranchRanking()
      }
    },
    flagMy(){
      this.myFlag = true
      if(this.myFlag){
        this.getMyranking()
      }else{
        this.getBranchRanking()
      }
    },
    flagBranch(){
      this.myFlag = false
      if(this.myFlag){
        this.getMyranking()
      }else{
        this.getBranchRanking()
      }
    },
    openMonthPicker(){
      $(".picker-slot.picker-slot-center")[2].style.display="none"
      this.$refs.monthpicker.open();
    },
    monthConfirm(data){
      this.year=data.getFullYear()
      this.month=data.getMonth()+1
      if(this.myFlag){
        this.getMyranking()
      }else{
        this.getBranchRanking()
      }
    },
    getMyranking(){
      let that = this
      let parmes=JSON.stringify({
        searchType:this.searchType,
        date:this.year+'-'+this.month,
      })
      $.ajax({
        method:'get',
        url:BASE_URL2+`/user/userRanking?data=${parmes}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res1:',res1)
          if(res1.code==200){
            that.myRankList = res1.data.rankingList
            that.myItemList = res1.data.rankingList.slice(3)
            // console.log(that.myItemList)
          }
        }
      })
    },
    getBranchRanking(){
      let that = this
      let parmes=JSON.stringify({
        searchType:this.searchType,
        date:this.year+'-'+this.month,
      })
      $.ajax({
        method:'get',
        url:BASE_URL2+`/user/partyBranchRanking?data=${parmes}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res2:',res1)
          if(res1.code==200){
            that.branchRankList = res1.data.rankingList
            that.branchItemList = res1.data.rankingList.slice(3)
          }
        }
      })
    },
  },
  data(){
    return {
      token:'',
      loginMark:'',
      dateFlag:true,
      myFlag:true,
      searchType:'year',
      year:'',
      month:'',
      startDate: new Date('2017/1/1'),
      myRankList:[],
      myItemList:[],
      branchRankList:[],
      branchItemList:[],
    }
  },
  created() {
    this.myFlag = this.$route.query.flag
    let nowDate = new Date
    this.year=nowDate.getFullYear()
    this.month=nowDate.getMonth()+1
    this.token=window.localStorage.getItem('partyToken');
    this.loginMark=window.localStorage.getItem('loginMark');
    this.getMyranking()
    this.getBranchRanking()
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
.ranking{
  width: 100%;
  height: auto;
}
.ranking_header{
  width: 100%;
  height: 112px;
  box-sizing: border-box;
  background: #C10710;
}
.header_date{
  width: 100%;
  height: 57px;
  line-height: 57px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 20px;
}
.date_item span{
  font-size: 14px;
  color: #fff;
}
.date_item img{
  width: 8px;
  height: 16px;
  /* vertical-align: middle; */
}
.date_tab span{
  display: inline-block;
  width: 60px;
  height: 27px;
  line-height: 25px;
  text-align: center;
  box-sizing: border-box;
  border: 1px solid #DBDBDB;
  font-size: 14px;
  color: #fff;
  border-radius: 14px;
}
.date_tab span.active{
  background: #fff;
  border: 1px solid #fff;
  color: #C10710;
}
.header_tab{
  width: 100%;
  height: 55px;
  box-sizing: border-box;
  padding: 0 20px;
  line-height: 52px;
  display: flex;
  justify-content: space-around;
}
.tab_item{
  width: 40%;
  height: 55px;
  font-size: 15px;
  color: #fff;
  text-align: center;
  box-sizing: border-box;
}
.header_tab .active{
  border-bottom: 3px solid #fff;
}
.ranking_content{
  width: 100%;
  height: auto;
}
.my_ranking{
  width: 100%;
  height: auto;
}
.content_top{
  width: 100%;
  height: 233px;
  display: flex;
  box-sizing: border-box;
  padding: 20px;
  justify-content: space-between;
}
.top_two{
  width: 94px;
  height: 151px;
  border-radius: 10px;
  background: #F52D37;
  position: relative;
  top: 42px;
  box-sizing: border-box;
}
.top_one{
  width: 140px;
  height: 161px;
  border-radius: 10px;
  background: #C10710;
  position: relative;
  top: 32px;
  box-sizing: border-box;
}
.top_three{
  width: 94px;
  height: 141px;
  border-radius: 10px;
  background: #FF6428;
  position: relative;
  top: 52px;
  box-sizing: border-box;
}
.my_ranking .top_pic{
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #C10710;
  box-sizing: border-box;
  border: 2px #fff solid;
}
.my_ranking .top_two .top_pic{
  top: -32px;
  left: 15px;
}
.my_ranking .top_one .top_pic{
  top: -32px;
  left: 38px;
}
.my_ranking .top_three .top_pic{
  top: -32px;
  left: 15px;
}
.top_num{
  position: absolute;
  font-style: italic;
  font-family: AliHYAiHei;
  color: #fff;
  font-size: 80px;
  bottom: -10px;
  left: -10px;
  opacity: 0.2;
}
.top_one .top_num{
  font-size: 107px;
  bottom: -18px;
}
.top_three .top_num{
  font-size: 70px;
  left: -5px;
}
.my_ranking .top_name{
  width: 100%;
  height: 25px;
  line-height: 25px;
  margin-top: 40px;
  font-size: 18px;
  color: #fff;
  text-align: center;
}
.top_branch{
  width: 100%;
  height: auto;
  line-height: 20px;
  /*margin-top: 10px;*/
  font-size: 14px;
  color: #fff;
  opacity: 0.6;
  text-align: center; 
}
.top_integral{
  width: 100%;
  height: 25px;
  line-height: 25px;
  margin-top: 10px;
  font-size: 24px;
  color: #fff;
  font-weight: 600;
  text-align: center;
}
.content_list{
  width: 100%;
  height: auto;
}
.my_ranking .list_item {
  width: 100%;
  height: 88px;
  box-sizing: border-box;
  padding: 20px;
  border-bottom:1px #dbdbdb solid;
  display:flex;
  justify-content: space-between;
}
.my_ranking .list_num{
  display: inline-block;
  width: 30px;
  height: 48px;
  font-size:18px;
  color:#FF6428;
  line-height: 48px;
}
.my_ranking .list_pic{
  width: 48px;
  height: 48px;
  background: red;
  border-radius: 50%;
}
.my_ranking .list_pic img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.my_ranking .list_text{
  display: inline-block;
  width: 210px;
  height: 48px;
}
.my_ranking .list_text h4{
  width: 100%;
  height: 24px;
  line-height: 24px;
  font-size: 18px;
  color: #333;
}
.my_ranking .list_text p{
  width: 100%;
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  color: #999;
}
.my_ranking .list_integral{
  width: 30px;
  height: 48px;
  line-height: 48px;
  font-size: 18px;
  color: #333;
  text-align: right;
}
.branch_ranking .top_integral{
  margin-top: 30px;
}
.branch_ranking .top_pic{
  position: absolute;
  top: 0;
  width: 34px;
  height: 34px;
  box-sizing: border-box;
}
.branch_ranking .top_pic img{
  width: 100%;
  height: 100%;
}
.my_ranking .top_pic img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.branch_ranking .top_two .top_pic{
  left: 30px;
}
.branch_ranking .top_one .top_pic{
  left: 53px;
}
.branch_ranking .top_three .top_pic{
  left: 30px;
}
.branch_ranking .top_name{
  width: 100%;
  height: auto;
  line-height: 20px;
  margin-top: 45px;
  font-size: 14px;
  color: #fff;
  text-align: center;
}
.branch_ranking .list_item {
  width: 100%;
  height: 65px;
  box-sizing: border-box;
  padding: 20px;
  border-bottom:1px #dbdbdb solid;
  display:flex;
  justify-content: space-between;
}
.branch_ranking .list_num{
  display: inline-block;
  width: 30px;
  height: 25px;
  font-size:18px;
  color:#FF6428;
  line-height: 25px;
}
.branch_ranking .list_text{
  width: 240px;
  height: 25px;
  line-height: 25px;
  font-size: 18px;
  color: #333;
}
.branch_ranking .list_integral{
  width: 30px;
  height: 25px;
  line-height: 25px;
  font-size: 18px;
  color: #333;
  text-align: right;
}
</style>
