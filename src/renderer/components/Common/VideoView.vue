<template>
  <a-layout id="video-view"
            class="overflow-hidden video-content-wrapper bg-media"
            :class="{[`${position} video-content-wrapper-${position}`]: true,
            'w-full h-full': position === 'absolute'}">
    <div v-if="!videoStream && !hideVideo"
         class="flex h-full items-center justify-center bg-media-closed">
      <a-iconfont type="icon-shipinjinyong" class="display-icon"/>
    </div>
    <video
        v-show="videoStream"
        ref="videoContent"
        class="video-content"
        :class="{'force-16-9' : !videoStream}"
        autoplay loop
        :muted="muted"
        :style="{'object-fit': objectFit}"
        @click="videoClicked"
        @dblclick="videoDblClicked"
    ></video>
    <template v-show="hideVideo">
      <slot name="content"/>
    </template>
    <slot name="controls"/>
  </a-layout>
</template>

<script>
import path from 'path';

export default {
  name  : 'VideoView',
  props : {
    source : {
      type    : String,
      default : 'local', // local remote screen call-remote call-screen
    },
    objectFit : {
      type    : String,
      default : 'contain',
    },
    position : {
      type    : String,
      default : 'absolute',
    },
    muted : {
      type    : Boolean,
      default : false,
    },
    hideVideo : {
      type    : Boolean,
      default : false,
    },
    ignoreStaticVideo : {
      type    : Boolean,
      default : false,
    },
  },
  data() {
    return {
      videoElement : null,
    };
  },
  async mounted() {
    await this.$nextTick();

    this.videoElement = this.$refs.videoContent;
    this.initStream();
  },
  beforeDestroy() {
    if (this.enableLocalVideo) {
      this.videoElement.removeEventListener('canplay', this.captureStream);
    }
    else {
      switch (this.source) {
        case 'local':
          this.$rtc.media.localMedia.releaseStream();
          break;
        case 'remote':
          break;
        case 'screen':
        case 'call-screen':
          break;
        default: break;
      }
    }
    this.videoElement = null;
    if (this.captureTimeout) clearTimeout(this.captureTimeout);
  },
  computed : {
    audioOutputDevice() {
      return this.$model.media.audioOutputDevice;
    },
    videoStream() {
      if (this.enableLocalVideo) return true;

      const streamMap = {
        local  : this.$rtc.media.localMedia.stream,
        remote : this.$rtc.conference.mediaChannel.remoteStream,
        screen : this.$rtc.conference.shareChannel.remoteStream
          || this.$rtc.conference.shareChannel.localStream,
        'call-local'  : this.$rtc.call.localStream,
        'call-remote' : this.$rtc.call.remoteStream,
        'call-screen' : this.$rtc.call.share.localStream
          || this.$rtc.call.share.remoteStream,
      };

      return streamMap[this.source];
    },
    enableLocalVideo() {
      return this.$rtc.account.registered
        && this.source.endsWith('local')
        && this.$model.setting.enableLocalVideo
        && !this.ignoreStaticVideo;
    },
    isRemoteStream() {
      return this.source.endsWith('remote');
    },
    localVideoPath() {
      return path.resolve(__static, 'video/default-video.webm');
    },
    localMediaChannel() {
      let channel = null;

      if (this.$rtc.conference.connected) {
        channel = this.$rtc.conference.mediaChannel.channel;
      }
      else if (this.$rtc.call.connected) {
        channel = this.$rtc.call.channel;
      }

      return channel;
    },
  },
  methods : {
    captureStream() {
      // FIXME TMP SOLUTION http://bugfree.yealink.com/Bug.php?BugID=188676
      this.videoElement.removeEventListener('canplay', this.captureStream);
      if (!this.localMediaChannel) return;
      if (this.captureTimeout) clearTimeout(this.captureTimeout);
      this.captureTimeout = setTimeout(async() => {
        if (!this.enableLocalVideo) return clearTimeout(this.captureTimeout);
        await this.localMediaChannel.replaceLocalStream(this.videoElement.captureStream());
      }, 1000);
    },
    videoClicked() {
      this.$emit('video-clicked');
    },
    videoDblClicked() {
      this.$emit('video-dblclick');
    },
    async onVideoStreamChanged(stream) {
      if (!stream) return;
      await this.$nextTick();
      if (!this.videoElement) {
        this.videoElement = this.$refs.videoContent;
      }
      if (this.hideVideo) {
        this.videoElement.style.display = 'none';
        if (!this.isRemoteStream) return;
      }
      if (this.enableLocalVideo) {
        this.videoElement.srcObject = null;
        this.videoElement.src = this.localVideoPath;
        this.videoElement.addEventListener('canplay', this.captureStream);
      }
      else if (this.videoElement && this.videoElement.srcObject !== stream) {
        this.videoElement.src = '';
        this.videoElement.srcObject = stream;
        // this.localMediaChannel.replaceLocalStream(stream);
      }
    },
    initStream() {
      if (this.videoStream && !this.videoElement) {
        this.onVideoStreamChanged(this.videoStream);
      }
      if (this.enableLocalVideo) return;
      switch (this.source) {
        case 'local':
          this.$rtc.media.localMedia.acquireStream();
          break;
        case 'remote':
          break;
        case 'screen':
        case 'call-screen':
          break;
        default: break;
      }
    },
  },
  watch : {
    audioOutputDevice(val) {
      this.videoElement.setSinkId(val.deviceId);
    },
    videoStream : {
      handler   : 'onVideoStreamChanged',
      immediate : true,
    },
    hideVideo : {
      async handler(val) {
        await this.$nextTick();
        if (this.videoElement) {
          this.onVideoStreamChanged(this.videoStream);
          if (val) { // 隐藏
            this.videoElement.style.display = 'none';
          }
          else {
            this.videoElement.style.display = 'block';
          }
        }
      },
      immediate : true,
    },
  },
};
</script>

<style scoped lang="less">
  .video-content-wrapper {
    &-absolute, .loading-notice {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .video-content {
        height: 100%;
      }
    }
    .loading-notice {
      @apply absolute flex flex-col w-full justify-center items-center;
    }
    .video-content {
      width: 100%;
    }
    .force-16-9 {
       padding-top: 56.25%;
    }
    .display-icon {
      opacity: 0.4;
      color: white;
      font-size: 36px;
    }
  }
</style>
