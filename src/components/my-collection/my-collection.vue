<template>
  <div class="collection">
    <div class="collection_box">
      <div class="collection_item" v-for="(item,index) of collectionList" @click="lookDetail(index)">
        <div class="item_pic">
          <img :src="item.picUrl">
        </div>
        <div class="item_text">
          <h3>{{item.title}}</h3>
          <p>{{item.detailed}}</p>
          <p>阅读 {{item.reading}}</p>
        </div>
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
    getData(){
      let that = this
      let parmes=JSON.stringify({
        pageIndex:this.pageIndex,
        pageSize:this.pageSize
      })
      $.ajax({
        method:'get',
        url:BASE_URL2+`/user/myCollection?data=${parmes}&token=${that.token}&loginMark=${that.loginMark}`,       
        success:function(res1){
          console.log('res2:',res1)
          if(res1.code==200){
            that.collectionList = res1.data.collectionList
          }
        }
      })
    },
    lookDetail(idx){
      let type = this.collectionList[idx].module
      let id = this.collectionList[idx].id
      if(type=='partynews'){
        type = 'focus_news'
      }else if(type=='partynotice'){
        type = 'notice'
      }else if(type=='partypolicy'){
        type = 'policy_regulations'
      }else if(type=='partypublic'){
        type = 'inner_party_publicity'
      }else if(type=='partyanticorruption'){
        type = 'fighting_corruption'
      }else if(type=='partyspecial'){
        type = 'thematic_education'
      }
      this.$router.push('/news-detail/'+id+`?type=${type}`);
    },
  },
  data(){
    return {
      token:'',
      loginMark:'',
      pageIndex:1,
      pageSize:10,
      collectionList:[],
    }
  },
  created() {
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
.collection{
  width: 100%;
  height: auto;
  box-sizing: border-box;
}
.collection_box{
  width: 100%;
  height: auto;
  box-sizing: border-box;
}
.collection_item{
  width: 100%;
  height: 105px;
  box-sizing: border-box;
  padding: 20px;
  border-bottom: 1px dashed #dbdbdb;
  display: flex;
  justify-content: space-between;
}
.item_pic{
  width: 120px;
  height: 75px;
  background: #C10710;
}
.item_pic img{
  width: 100%;
  height: 100%;
}
.item_text{
  width: 200px;
  height: 75px;
  box-sizing: border-box;
}
.item_text h3{
  width: 100%;
  height: 25px;
  line-height: 25px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.item_text p{
  width: 100%;
  height: 25px;
  line-height: 25px;
  font-size: 14px;
  color: #999;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
</style>
