<template>
  <div class="my_integral">
    <div class="integral_date" @click="openMonthPicker">{{year}}年{{month}}月<img src="../../assets/imgs/more_icon.png" /></div>
    <div class="integral_list">
      <div class="integral_item" v-for="(item,index) of integralList">
        <h4>{{item.title}}</h4>
        <p>{{item.dateTime}}</p>
        <span>{{item.changeIntegral}}</span>
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
    goLink(router){
      if(router) this.$router.push(router);
    },
    openMonthPicker(){
      $(".picker-slot.picker-slot-center")[2].style.display="none"
      this.$refs.monthpicker.open();
    },
    monthConfirm(data){
      this.year=data.getFullYear()
      this.month=data.getMonth()+1
      this.searchType = 'month'
      this.getData()
    },
    getData(){
      let that = this
      let parmes=JSON.stringify({
        date:this.year+'-'+this.month,
        pageIndex:this.pageIndex,
        pageSize:this.pageSize
      })
      $.ajax({
        method:'get',
        url:BASE_URL2+`/user/myMonthIntegral?data=${parmes}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res1:',res1)
          if(res1.code==200){
            that.integralList = res1.data.integralDetailList
          }
        }
      })
    },
  },
  data(){
    return {
      token:'',
      loginMark:'',
      year:'',
      month:'',
      pageIndex:1,
      pageSize:10,
      integralList:[],
      startDate: new Date('2017/1/1'),
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
.my_integral{
  width: 100%;
  height: auto;
}
.integral_date{
  width: 100%;
  height: 55px;
  line-height: 55px;
  font-size: 16px;
  color: #333;
  text-align: center;
  border-bottom: 1px #dbdbdb solid;
}
.integral_date img{
  width: 8px;
  height: 14px;
  margin-left: 15px;
  vertical-align: middle;
}
.integral_list{
  width: 100%;
  height: auto;
}
.integral_item{
  position: relative;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
  padding: 20px;
  border-bottom: 1px #dbdbdb solid;
}
.integral_item h4{
  width: 100%;
  height: 20px;
  line-height: 20px;
  font-size: 18px;
  color: #333;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  padding-right: 40px;
}
.integral_item p{
  width: 100%;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  color: #999;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  padding-right: 40px;
}
.integral_item span{
  position: absolute;
  display: inline-block;
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  color: #FF6428;
  font-size: 18px;
  right: 20px;
  top: 20px;
}
</style>