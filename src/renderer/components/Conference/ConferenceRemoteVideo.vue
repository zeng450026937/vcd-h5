<template>
  <div id="conference-remote-video" class="h-full w-full relative">
    <remote-video :class="{'remote-video-content-shrink': isVideoContentShrink}" source="remote">
      <conference-controls slot="controls" :class="controlsClasses"/>
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
  data() {
    return {
      isVideoContentShrink : false,
    };
  },
  computed : {
    controlsClasses() {
      return {
        [this.isVideoContentShrink ? 'controls-normal' : 'controls-bottom'] : true,
      };
    },
  },
  watch : {
    $route : {
      handler(val) {
        this.isVideoContentShrink = val.path === CONFERENCE.CONFERENCE_DRAWER;
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
#conference-remote-video {
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
  .remote-video-content-shrink {
    .video-content {
      height: auto;
      max-height: calc( 100% - 158px );
      border: 1px solid #1D212F;
    }
  }
}
</style>
