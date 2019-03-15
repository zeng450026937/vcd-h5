<template>
  <div id="conference-remote-video" class="h-full w-full bg-media relative">
    <remote-video
        :class="{[`remote-video-content-${isInConferenceMain ? 'normal' : 'shrink'}`]: true}"
        :source="source">
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
    props : [ 'hideControls', 'showMorePanel', 'isInConferenceMain' ],
  },
  computed : {
    controlsClasses() {
      return {
        [this.isInConferenceMain ? 'controls-bottom' : 'controls-normal'] : true,
        'hide-controls'                                                   : this.hideControls,
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
#conference-remote-video {
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
    height: auto !important;

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
