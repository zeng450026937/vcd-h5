<template>
  <a-layout id="video-view"
            class="overflow-hidden video-content-wrapper"
            :class="{[`${position} video-content-wrapper-${position}`]: true,
            'w-full h-full': position === 'absolute'}">
    <video
        :id="videoId"
        class="video-content"
        autoplay loop
        :style="{'object-fit': objectFit}"
    ></video>
  </a-layout>
</template>

<script>
// TODO the code may mass , rebuild next year
export default {
  name  : 'VideoView',
  props : {
    source : {
      type    : String,
      default : 'local', // local remote screen
    },
    objectFit : {
      type    : String,
      default : 'contain',
    },
    position : {
      type    : String,
      default : 'absolute',
    },
  },
  data() {
    return {
      videoElement : null,
    };
  },
  mounted() {
    this.initStream();
  },
  destroyed() {
    if (this.videoStream) this.$rtc.media.localMedia.releaseStream();
  },
  computed : {
    videoId() {
      return `${this.source}-video-${Date.now()}`;
    },
    videoStream() {
      const streamMap = {
        local  : this.$rtc.media.localMedia.stream,
        remote : this.$rtc.conference.mediaChannel.remoteStream,
        screen : this.$rtc.conference.shareChannel.remoteStream
          || this.$rtc.conference.shareChannel.localStream,
      };

      return streamMap[this.source];
    },
  },
  methods : {
    onVideoStreamChanged(stream) {
      if (!stream) return;
      this.videoElement = document.getElementById(this.videoId);
      if (this.videoElement) {
        this.videoElement.srcObject = stream;
      }
    },
    initStream() {
      if (this.videoStream) {
        if (!this.videoElement) this.onVideoStreamChanged(this.videoStream);
        
        return;
      }
      switch (this.source) {
        case 'local':
          this.$rtc.media.localMedia.acquireStream();
          break;
        case 'remote':
          break;
        case 'screen': break;
        default: break;
      }
    },
  },
  watch : {
    videoStream : {
      handler   : 'onVideoStreamChanged',
      immediate : true,
    },
  },
};
</script>

<style scoped lang="less">
  .video-content-wrapper {
    &-absolute {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .video-content {
        height: 100%;
      }
    }
    .video-content {
      width: 100%;
    }
  }
</style>
