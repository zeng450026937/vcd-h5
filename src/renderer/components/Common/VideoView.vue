<template>
  <a-layout id="video-view"
            class="absolute overflow-hidden video-content-wrapper w-full h-full">
    <video
        :id="videoId"
        class="video-content w-full h-full"
        autoplay loop
        style="object-fit: cover"
    ></video>
  </a-layout>
</template>

<script>
export default {
  name  : 'VideoView',
  props : {
    source : {
      type    : String,
      default : 'local', // local remote screen
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
      return `${this.source}-video`;
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
      this.videoElement.srcObject = stream;
    },
    initStream() {
      if (this.videoStream) return;
      switch (this.source) {
        case 'local':
          this.$rtc.media.localMedia.acquireStream();
          break;
        case 'remote': break;
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
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
  }
</style>
