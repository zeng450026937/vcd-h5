<template>
  <div id="conference-remote-video" class="h-full w-full relative">
    <remote-video
        :class="{[`remote-video-content-${isVideoContentShrink ? 'shrink' : 'normal'}`]: true}"
        :source="source">
      <conference-controls ref="conferenceControls" slot="controls" class="controls" :class="controlsClasses"/>
    </remote-video>
  </div>
</template>

<script>
import RemoteVideo from '../Common/VideoView.vue';
import ConferenceControls from './ConferenceControls.vue';
import { CONFERENCE } from '../../router/constants';

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
  data() {
    return {
      isVideoContentShrink : false,
    };
  },
  computed : {
    controlsClasses() {
      return {
        [this.isVideoContentShrink ? 'controls-normal' : 'controls-bottom'] : true,
        'hide-controls'                                                     : this.hideControls,
      };
    },
    hideControls() {
      return this.$model.conference.hideControls;
    },
  },
  watch : {
    $route : {
      handler(val) {
        this.isVideoContentShrink = val.path === CONFERENCE.CONFERENCE_DRAWER;
      },
      immediate : true,
    },
    hideControls(val) {
      if (val) {
        this.$refs.conferenceControls.showMorePanel = false;
      }
    },
  },
};
</script>

<style lang="less">
#conference-remote-video {
  background-color: #1b1f2d;
  #video-view {
    background-color: #1b1f2d;
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
