<template>
  <a-layout id="window" class="h-full">
    <div class="flex flex-col justify-center items-center h-full">

      <span class="dragable text-white text-sm">
        <span class="text-red font-bold">{{this.displayName}}</span> 正在呼你</span>

      <div class="circle">

        <div class="c1"></div>
        <div class="c2"></div>
        <div class="c3"></div>
        <a-avatar :size="48" class="bg-indigo target-avatar">{{this.displayName.substr(-2,2)}}</a-avatar>
      </div>

      <!---->
      <div class="flex justify-center mt-4">
        <!--视频（接听）-->
        <a-button shape="circle"
                  class="control-btn w-10 h-10 text-xl text-white mx-2 border-transparent"
                  @click="answerCall"
        >
          <a-iconfont type="icon-shexiangtou"/>
        </a-button>
        <!--麦克风（接听）-->
        <a-button shape="circle"
                  class="control-btn w-10 h-10 text-xl text-white mx-2 border-transparent"
                  @click="answerCall"
        >
          <a-iconfont type="icon-maikefeng"/>
        </a-button>
        <!--挂断-->
        <a-button shape="circle"
                  class="control-btn w-10 h-10 text-xl text-white mx-2 bg-red-light border-transparent"
                  @click="hangUp"
        >
          <a-iconfont type="icon-guaduan"/>
        </a-button>
      </div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name     : 'WindowRinging',
  computed : {
    rtc() {
      return (window.opener && window.opener.rtc) || window.rtc;
    },
    displayName() {
      const { remoteIdentity } = this.rtc.call.incoming[0];

      return (remoteIdentity && (remoteIdentity.display_name
        || remoteIdentity.uri.user)) || '未知用户';
    },
  },
  mounted() {
    setInterval(() => {
      this.checkStatus();
    }, 2000);
  },
  methods : {
    hangUp() {
      this.rtc.call.decline();// .catch(() => {});
    },
    answerCall() {
      this.rtc.call.answer();// .catch(() => {});
    },
    getStatus() {
      if (this.rtc.call.ringing) return 'ringing';
      else if (this.rtc.call.connecting) return 'connecting';
      else if (this.rtc.call.connected) return 'connected';
      else return 'disconnected';
    },
    checkStatus() {
      const status = this.getStatus();

      if (status !== 'ringing') {
        window.close();
      }
    },
  },
};
</script>

<style lang="less">
#window {
  background-color: rgb(31, 36, 55);
  .control-btn {
    background: rgba(0,0,0,0.65);
  }
  .circle {
    left:0;
    top:0;
    width:80px;
    height:80px;
    .target-avatar {
      position: absolute;
      top:45%;
      left:50%;
      transform: translate(-50%, -50%);
    }
  }
  .circle div {
    position:absolute;
    top:45%;
    left:50%;
    background:#fff;
    width:80px;
    height:80px;
    margin-left:-40px;
    margin-top:-40px;
    opacity:1;
    border-radius:90px;
    animation-duration:1.2s;
    animation-timing-function:linear;
    animation-iteration-count:infinite;
  }
  .circle div.c1 {
    width:20px;
    height:20px;
    margin-left:-10px;
    margin-top:-10px;
    opacity:1;
    border-radius:90px
  }
  .circle div.c2 {
    animation-name:c2;
    animation-delay:.6s;
  }
  .circle div.c3 {
    animation-name:c2;
    animation-delay:1.2s;
  }
  @-webkit-keyframes c2 {
    0% {
      transform:scale(.222);
      opacity:1
    }
    50% {
      transform:scale(.622);
      opacity:.4
    }
    98% {
      transform:scale(1);
      opacity:.2
    }
    100% {
      opacity:0
    }
  }
  @-ms-keyframes c2 {
    0% {
      transform:scale(.222);
      opacity:1
    }
    50% {
      transform:scale(.622);
      opacity:.4
    }
    98% {
      transform:scale(1);
      opacity:.2
    }
    100% {
      opacity:0
    }
  }
  @-moz-keyframes c2 {
    0% {
      transform:scale(.222);
      opacity:1
    }
    50% {
      transform:scale(.622);
      opacity:.4
    }
    98% {
      transform:scale(1);
      opacity:.2
    }
    100% {
      opacity:0
    }
  }
  @-o-keyframes c2 {
    0% {
      transform:scale(.222);
      opacity:1
    }
    50% {
      transform:scale(.622);
      opacity:.4
    }
    98% {
      transform:scale(1);
      opacity:.2
    }
    100% {
      opacity:0
    }
  }
  @keyframes c2 {
    0% {
      transform:scale(.222);
      opacity:1
    }
    50% {
      transform:scale(.622);
      opacity:.4
    }
    98% {
      transform:scale(1);
      opacity:.2
    }
    100% {
      opacity:0
    }
  }
}
</style>
