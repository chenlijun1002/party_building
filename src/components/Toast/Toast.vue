<template>
  <div v-show="show">
      	<div class="m-toast">
          	<p class="weui_toast_content"><slot></slot></p>
		</div>
  </div>
</template>

<script>
/**
 * 组件内部自动关闭
 */
export default {
  name: 'Toast',
  props: {
    show: {
		type: Boolean,
		required: true,
		default: false,
		twoWay: true
    },
    // 类型：暂不提供
    type: {
		type: String
		// default:
    },
    // 持续时间(毫秒)
    duration: {
		type: Number,
		default: 1500
    },    
  },
  watch: {
     show(val) {
       if (this._timeout) clearTimeout(this._timeout)
       if (val && !!this.duration) {
         console.log(this._this,789)
         this._timeout = setTimeout(()=> {
           //this.show = false;
           this.$emit('hide',false);
         }, this.duration)
       }
     }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.m-toast {
		position: fixed;
		top: 30%;
		left: 50%;
		min-width: 80px;
		transform:translate(-50%,0);
		padding: 8px;
		text-align: center;
		font-size: 16px;
		background-color: rgba(0,0,0,.6);
		color: #fff;
		border-radius: 8px;
    z-index: 100;
	}
</style>
