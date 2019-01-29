<template>
  <div id="conference-remote-video" class="h-full w-full relative">
    <remote-video :class="{'remote-video-content-shrink': isVideoContentShrink}" source="remote"/>
  </div>
</template>

<script>
import RemoteVideo from '../Common/VideoView.vue';
import { CONFERENCE } from '../../router/constants';

export default {
  name       : 'ConferenceRemoteVideo',
  components : {
    RemoteVideo,
  },
  data() {
    return {
      isVideoContentShrink : false,
    };
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
  .remote-video-content-shrink {
    .video-content {
      height: auto;
      max-height: calc( 100% - 158px );
    }
  }
}
</style>
