<template>
    <div class="m-loading">
        <div class="con">
            <div class="spinner" :class="{'center':top=='center'}"></div>
        </div>
        
    </div>
</template>

<script>
/**
 * 组件外部手动关闭
 */
export default {
    name: 'Loading',
    props:{
      top: {
        type: String     
      },
    },
    watch: {
     show(val) {       
       if (this.top) {
         this.top=this.top;
       }
     }
  }
}
</script>

<style scoped>
.center{
    top:80%;
}
.m-loading {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #fff;
    z-index: 1000;
}
.m-loading .con {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10rem;
    height: 10rem;
    line-height: 10rem;
    text-align: center;
    margin-left: -5rem;
    margin-top: -5rem;
}
.m-loading .spinner {
    width: 1.333333rem;
    height: 1.333333rem;
    display:inline-block;
    margin: auto;
    background-image: url(./images/m-loading-bg.png);
    /*background-image: url(/xingyongka/src/common/images/m-loading-bg.png);*/
    background-position: 0 0;
    background-size: 1200% 100%;
    background-size: 1200% 100%;
    -webkit-animation-name: name;/* 动画名称 */
    -webkit-animation-iteration-count: infinite;/* 动画无限播放 */
    -webkit-animation-timing-function: step-start;/* 马上跳到动画每一结束桢的状态 */
    -webkit-animation-duration: 2s;/* 动画运行的时间 */
}

@-webkit-keyframes name {
    0% {
        background-position-x: 1100%;
    }
    10% {
        background-position-x: 1000%;
    }
    20% {
        background-position-x: 900%;
    }
    30% {
        background-position-x: 800%;
    }
    40% {
        background-position-x: 700%;
    }
    50% {
        background-position-x: 600%;
    }
    60% {
        background-position-x: 500%;
    }
    70% {
        background-position-x: 400%;
    }
    80% {
        background-position-x: 300%;
    }
    90% {
        background-position-x: 200%;
    }
    100% {
        background-position-x: 100%;
    }
    
}
@keyframes name {
    0% {
        background-position-x: 1100%;
    }
    10% {
        background-position-x: 1000%;
    }
    20% {
        background-position-x: 900%;
    }
    30% {
        background-position-x: 800%;
    }
    40% {
        background-position-x: 700%;
    }
    50% {
        background-position-x: 600%;
    }
    60% {
        background-position-x: 500%;
    }
    70% {
        background-position-x: 400%;
    }
    80% {
        background-position-x: 300%;
    }
    90% {
        background-position-x: 200%;
    }
    100% {
        background-position-x: 100%;
    }
}
</style>