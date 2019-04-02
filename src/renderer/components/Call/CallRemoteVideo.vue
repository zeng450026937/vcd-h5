<template>
  <div id="call-remote-video" class="h-full w-full bg-media relative">
    <remote-video
        :class="videoClasses"
        :hide-video="!showVideo"
        source="call-remote"
        @video-dblclick="videoDblClick">
      <div v-if="!showVideo"
           slot="content"
           class="absolute-center h-full flex flex-col items-center justify-center">
        <a-iconfont type="icon-huiyishi" class="display-icon"/>
        <span class="display-name mt-5">{{isVideoCall ? '视频通话' : '音频通话'}}</span>
      </div>
      <call-controls slot="controls" class="controls" :class="controlsClasses"/>
    </remote-video>

  </div>
</template>

<script>
import RemoteVideo from '../Common/VideoView.vue';
import CallControls from './CallControls.vue';

export default {
  name       : 'CallRemoteVideo',
  components : {
    RemoteVideo,
    CallControls,
  },
  data() {
    return {
    };
  },
  sketch : [
    {
      ns    : 'call.sketch',
      props : [ 'hideControls', 'showMorePanel', 'isInCallMain' ],
    },
    {
      ns    : 'call',
      props : [ 'isVideoCall' ],
    },
  ],
  destroyed() {
    this.$message.destroy();
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
    isConnecting() {
      return this.$rtc.call.connecting;
    },
    showVideo() {
      return this.isVideoCall && this.$rtc.call.connected;
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
            this.$message.info('对方可能暂时不在或设备静音，建议稍后再次尝试！', 0);
          }, 10000);
          this.step2Timer = setTimeout(() => {
            this.$message.destroy();
            if (this.isConnecting) {
              this.$message.info('对方长时间未接听，请稍后重试！', 0);
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
          this.$message.destroy();
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
    opacity: 0.4;
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
