<template>
  <div id="conference-remote-video" class="h-full w-full bg-media relative">
    <remote-video
        :class="videoClasses"
        :source="source"
        :hide-video="!isVideoConference"
        @video-dblclick="videoDblClick">
      <div v-if="!isVideoConference"
           slot="content"
           class="absolute-center h-full flex flex-col items-center justify-center">
        <a-iconfont type="icon-huiyishi" class="display-icon"/>
        <span class="display-name mt-5">{{$t('conversation.main.audioConference')}}</span>
      </div>
      <conference-controls slot="controls" class="controls" :class="controlsClasses"/>
    </remote-video>

  </div>
</template>

<script>
import RemoteVideo from '../Common/VideoView.vue';
import ConferenceControls from './ConferenceControls.vue';

export default {
  name       : 'ConferenceRemoteVideo',
  components : {
    RemoteVideo,
    ConferenceControls,
  },
  props : {
    source : {
      type    : String,
      default : 'remote',
    },
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'hideControls', 'showMorePanel', 'isInConferenceMain', 'isVideoConference' ],
  },
  computed : {
    horizontalMirroring() {
      return this.$model.setting.horizontalMirroring;
    },
    controlsClasses() {
      return {
        [this.isInConferenceMain || !this.isVideoConference ? 'controls-bottom' : 'controls-normal'] : true,
        'hide-controls'                                                                              : this.hideControls,
      };
    },
    videoClasses() {
      return {
        [`remote-video-content-${this.isInConferenceMain ? 'normal' : 'shrink'}`] : true,
        'h-full'                                                                  : !this.isVideoConference,
        'video-mirroring'                                                         : this.horizontalMirroring,
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
  },
};
</script>

<style lang="less">
#conference-remote-video {
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
  .video-mirroring{
    .video-content {
      transform: rotateY(180deg);
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

      #conference-controls {
        width: 100%;
        position: absolute;
        top: 100%;
      }
    }
  }

}
</style>
