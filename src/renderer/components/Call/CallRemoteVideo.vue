<template>
  <div id="call-remote-video" class="h-full w-full bg-media relative">
    <remote-video
        :class="videoClasses"
        :source="source"
        :hide-video="!isVideoCall">
      <div v-if="!isVideoCall"
           slot="content"
           class="absolute-center h-full flex flex-col items-center justify-center">
        <a-iconfont type="icon-huiyishi" class="display-icon"/>
        <span class="display-name mt-5">音频通话</span>
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
  props : {
    source : {
      type    : String,
      default : 'call-remote',
    },
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
  computed : {
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
        'remote-video-content-normal-auto'                                  : this.isInCallMain && this.isVideoCall,
      };
    },
  },
  watch : {
    hideControls(val) {
      if (val) {
        this.showMorePanel = false;
      }
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
