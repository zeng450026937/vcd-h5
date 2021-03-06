<template>
  <div id="call-remote-video" class="h-full w-full bg-media relative">
    <remote-video
        :class="videoClasses"
        :muted="prepareVideoCall"
        :hide-video="!showVideo"
        :source="prepareVideoCall || isDisconnected ? 'local' : source"
        @video-dblclick="videoDblClick">
      <div v-if="!showVideo && !isConnecting"
           slot="content"
           class="absolute-center h-full flex flex-col items-center justify-center">
        <a-iconfont type="icon-huiyishi" class="display-icon"/>
        <span class="display-name mt-5 opacity-50"
        >{{displayText}}
        </span>
      </div>
      <div v-else-if="!showVideo || prepareVideoCall"
           slot="content"
           class="w-full h-full flex flex-col items-center justify-center"
            :class="{
              'absolute-center':isInCallMain,
              'absolute video-content': !isInCallMain
            }">
        <a-avatar :size="160" class="text-3xl border-8">{{this.nickName}}</a-avatar>
        <div class="mt-5 w-full truncate display-name px-4">
          <span class="max-h-full">{{$t('conversation.title.calling')}} </span>
          <span class="max-w-1/2">{{this.targetInfo.name}}</span>
          <span> …</span>
        </div>
      </div>
      <call-controls v-if="!isDisconnected"
                     slot="controls"
                     class="controls"
                     :class="controlsClasses"/>
    </remote-video>

  </div>
</template>

<script>
import RemoteVideo from '../Common/VideoView.vue';
import CallControls from './CallControls.vue';

export default {
  name  : 'CallRemoteVideo',
  props : {
    source : {
      type    : String,
      default : 'call-remote',
    },
  },
  components : {
    RemoteVideo,
    CallControls,
  },
  data() {
    return {
      connectNotice : null,
    };
  },
  sketch : [
    {
      ns    : 'call.sketch',
      props : [ 'hideControls', 'showMorePanel', 'isInCallMain' ],
    },
    {
      ns    : 'call',
      props : [ 'isVideoCall', 'prepareVideoCall' ],
    },
  ],
  destroyed() {
    if (typeof this.connectNotice === 'function') {
      this.connectNotice();
      this.connectNotice = null;
    }
    if (this.step1Timer) {
      clearTimeout(this.step1Timer);
    }
    if (this.step2Timer) {
      clearTimeout(this.step2Timer);
    }
    if (this.step3Timer) {
      clearTimeout(this.step3Timer);
    }
  },
  computed : {
    displayText() {
      if (this.isDisconnected) return '正在结束通话';
      
      return this.isVideoCall
        ? this.$t('conversation.main.videoCall')
        : this.$t('conversation.main.audioCall');
    },
    targetInfo() {
      return this.$model.call.targetInfo;
    },
    nickName() {
      if (!this.targetInfo.name) return '';
      
      return /^(.*)\(.*\)$/.test(this.targetInfo.name) ? RegExp.$1.substr(-2, 2) : this.targetInfo.name.substr(-2, 2);
    },
    isConnecting() {
      return this.$rtc.call.connecting;
    },
    isDisconnected() {
      return this.$rtc.call.disconnected;
    },
    showVideo() {
      return this.isVideoCall && (this.$rtc.call.connected || this.prepareVideoCall);
    },
    controlsClasses() {
      return {
        [this.isInCallMain || !this.isVideoCall ? 'controls-bottom' : 'controls-normal'] : true,
        'hide-controls'                                                                  : this.hideControls,
      };
    },
    videoClasses() {
      return {
        [`remote-video-content-${this.isInCallMain ? 'normal' : 'shrink'}`] : true,
        'h-full'                                                            : !this.isVideoCall,
      };
    },
  },
  methods : {
    videoDblClick() {
      this.$emit('video-dblclick');
    },
  },
  watch : {
    hideControls(val) {
      if (val) {
        this.showMorePanel = false;
      }
    },
    isConnecting : {
      handler(val) {
        if (val) {
          this.step1Timer = setTimeout(() => {
            this.connectNotice = this.$message.info(this.$t('conversation.tip.notOnLine'), 0);
          }, 10000);
          this.step2Timer = setTimeout(() => {
            if (typeof this.connectNotice === 'function') {
              this.connectNotice();
              this.connectNotice = null;
            }
            if (this.isConnecting) {
              this.connectNotice = this.$message.info(this.$t('conversation.tip.willHangup'), 0);
              this.step3Timer = setTimeout(() => {
                if (!this.$rtc.call.connected) {
                  this.$rtc.call.disconnect();
                }
              }, 2000);
            }
          }, 20000);
        }
        else {
          if (this.step1Timer) {
            clearTimeout(this.step1Timer);
          }
          if (this.step2Timer) {
            clearTimeout(this.step2Timer);
          }
          if (this.step3Timer) {
            clearTimeout(this.step3Timer);
          }
          if (typeof this.connectNotice === 'function') {
            this.connectNotice();
            this.connectNotice = null;
          }
        }
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
#call-remote-video {

    .content-wrapper{
      border: 1px solid #1d212f;
    }
    .content-inner {
      width: 100%;
      object-fit: contain;
      max-height: calc( 100% - 158px );
    }

  .display-icon {
    opacity: 0.4;
    color: white;
    font-size: 84px;
  }
  .display-name {
    font-size: 24px;
    color: #FFFFFF;
    text-align: center;
    line-height: 24px;
  }

  .controls {
    &-normal {
      transform: translateY(-100%);
    }
    &-bottom {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translate(-50%, -100%);
    }
  }
  .hide-controls {
    .button-content {
      opacity: 0;
      transition: opacity ease-out .5s;
    }
  }
  .remote-video-content-shrink {

    .video-content {
      height: auto;
      max-height: calc( 100% - 158px );
      border: 1px solid #1D212F;
    }
  }

  .remote-video-content-normal {
    position: absolute;
    max-height: 100%;
    &-auto {
      height: auto !important;
    }

    #video-view {
      height: auto !important;

      .video-content {
        height: auto;
      }

      #call-controls {
        width: 100%;
        position: absolute;
        top: 100%;
      }
    }
  }

}
</style>
