<template>
  <a-layout id="window">
    <div class="window-header flex justify-end items-center h-10 dragable z-10">
      <div class="flex no-dragable">
        <a-iconfont type="icon-quanping" class="mr-4 text-base text-white cursor-pointer"
                    @click="maxWindow"/>
        <a-iconfont type="icon-hebingfuliu" class="mr-4 text-base text-white cursor-pointer"
                    @click="closeWindow"/>
      </div>
    </div>
    <video id="window-share-video" autoplay loop></video>
  </a-layout>
</template>

<script>
import screenfull from 'screenfull';

export default {
  name : 'Window',
  data() {
    return {
      videoElement : null,
    };
  },
  components : {
  },
  mounted() {
    this.onShareStreamChanged(this.shareStream);
    setInterval(() => {
      if (!(this.shareStream && this.shareStream.active)) {
        this.closeWindow();
      }
    }, 1000);
  },
  computed : {
    rtc() {
      return (window.opener && window.opener.rtc) || window.rtc;
    },
    shareStream() {
      return this.rtc.conference.shareChannel.remoteStream
      || this.rtc.conference.shareChannel.localStream;
    },
  },
  methods : {
    onShareStreamChanged(stream) {
      if (!stream) return;
      if (!this.videoElement) {
        this.videoElement = document.getElementById('window-share-video');
      }
      if (this.videoElement && this.videoElement.srcObject !== stream) {
        this.videoElement.srcObject = stream;
      }
    },
    closeWindow() {
      window.close();
    },
    maxWindow() {
      screenfull.toggle(document.getElementById('window'));
    },
  },
  watch : {
    shareStream : {
      handler   : 'onShareStreamChanged',
      immediate : true,
    },
  },
};
</script>

<style lang="less">
#window {
  .window-header {
    background-image: linear-gradient(-180deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.00) 98%);
  }
  #window-share-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
