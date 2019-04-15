<template>
  <div id="call-controls" class="flex justify-center py-5 items-center">
    <div class="button-content flex h-12 items-center justify-center z-10">
      <!--视频控制-->
      <a-button v-if="isVideoCall"
                :disabled="videoDisabled"
                shape="circle"
                class="w-10 h-10 text-lg mx-2 text-white border-transparent control-btn"
                :class="{[`bg-${videoIcon.color}`] : true}"
                :title="videoIcon.title"
                @click="onVideoBtnClick"
      >
        <a-iconfont :type="videoIcon.icon"/>
      </a-button>
      <!--音频-->
      <a-button :disabled="audioDisabled"
                shape="circle"
                class="control-btn"
                :class="{[`bg-${audioIcon.color}`] : true}"
                :title="audioIcon.title"
                @click="onAudioBtnClick"
      >
        <a-iconfont :type="audioIcon.icon"/>
      </a-button>
      <!--分享辅流-->
      <a-button v-if="isVideoCall && isConnected"
                shape="circle"
                class="control-btn"
                :title="hasLocalScreenStream ? '关闭辅流' : '分享辅流'"
                @click="showScreenShareModal"
      ><a-iconfont type="icon-fuliu"/></a-button>
      <!--更多-->
      <a-popover
          trigger="click"
          v-model="showMorePanel"
          :getPopupContainer="popupContainer"
          overlayClassName="more-panel-popover"
      >
        <div slot="content" class="popover-content">
          <div v-if="isVideoCall && isConnected"
               class="popover-content-item hover:bg-list-hover"
               @click="toAudioCall">
            <a-iconfont type="icon-yuyin" class="text-lg text-indigo"/>
            <span class="ml-3 text-xs">切换为音频通话</span>
          </div>
          <div class="popover-content-item hover:bg-list-hover"
               @click="openPlateModal">
            <a-iconfont type="icon-bohao" theme="filled" class="text-lg text-indigo"/>
            <span class="ml-3 text-xs">拨号盘</span>
          </div>
        </div>
        <a-button shape="circle"
                  title="更多"
                  class="control-btn"
                  @click="showMorePanel = !showMorePanel"
        ><a-iconfont type="icon-gengduo1"/></a-button>
      </a-popover>
      <a-button shape="circle"
                title="挂断"
                class="control-btn bg-red-light"
                @click="hangUp"
      >
        <a-iconfont type="icon-guaduan"/>
      </a-button>
    </div>
    <call-plate-modal ref="plateModal"
                      :getContainer="modalContainer"/>
    <screen-share-modal ref="shareModal"
                        source="call"
                        :getContainer="modalContainer"/>
  </div>
</template>

<script>
import CallPlateModal from './CallPlateModal.vue';
import ScreenShareModal from '../Conference/ScreenShareModal.vue';

export default {
  name       : 'CallControls',
  components : {
    CallPlateModal,
    ScreenShareModal,
  },
  data() {
    return {
      mediaStatus : { audio: false, video: false },
    };
  },
  sketch : [
    {
      ns    : 'call',
      props : [ 'isVideoCall' ],
    },
    {
      ns    : 'call.sketch',
      props : [ 'showMorePanel', 'isInCallMain', 'deviceExceptionNotice' ],
    },
  ],
  created() {
    this.mediaStatus = this.$rtc.call.channel.isMuted();
  },
  computed : {
    popupContainer() {
      return () => document.getElementById('call-controls');
    },
    modalContainer() {
      return () => document.getElementById('layout-call-content');
    },
    enableLocalVideo() {
      return this.$model.setting.enableLocalVideo;
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    isConnected() {
      return this.callStatus === 'connected';
    },
    audioIcon() {
      const iconMap = {
        unblock : { icon: 'icon-maikefeng', color: '', title: '关闭麦克风' },
        block   : { icon: 'icon-maikefengjinyong', color: 'red-light', title: '打开麦克风' },
      };

      return iconMap[this.mediaStatus.audio ? 'block' : 'unblock'];
    },
    videoIcon() {
      const iconMap = {
        unblock : { icon: 'icon-shipin', color: '', title: '关闭摄像头' },
        block   : { icon: 'icon-shipinjinyong', color: 'red-light', title: '打开摄像头' },
      };

      return iconMap[this.mediaStatus.video ? 'block' : 'unblock'];
    },
    isMuted() {
      return this.$rtc.call.channel.isMuted();
    },
    videoDisabled() {
      const { status } = this.$rtc.media.localMedia;

      return (!status.active || !status.video) && !this.enableLocalVideo;
    },
    audioDisabled() {
      const { status } = this.$rtc.media.localMedia;

      return (!status.active || !status.audio) && !this.enableLocalVideo;
    },
    hasLocalScreenStream() {
      return !!this.$rtc.call.share.localStream;
    },
    localMediaStatus() {
      return this.$rtc.media.localMedia.status;
    },
    videoException() {
      return this.localMediaStatus.active && !this.localMediaStatus.video;
    },
    audioException() {
      return this.localMediaStatus.active && !this.localMediaStatus.audio;
    },
    hasException() {
      return this.videoException || this.audioException;
    },
  },
  methods : {
    showScreenShareModal() {
      if (this.hasLocalScreenStream) {
        this.$rtc.call.share.disconnect();

        return;
      }
      this.$refs.shareModal.visible = true;
    },
    hangUp() {
      if (this.callStatus === 'ringing') {
        this.$rtc.call.decline().catch(() => {});
      }
      else {
        this.$rtc.call.disconnect();
      }
    },
    openPlateModal() {
      this.showMorePanel = false;
      this.$refs.plateModal.visible = true;
    },
    toAudioCall() {
      this.showMorePanel = false;
      this.isVideoCall = false;
    },
    onAudioBtnClick() {
      this.$rtc.call.toggleAudio(this.$rtc.call.channel.isMuted().audio);
      this.mediaStatus = this.$rtc.call.channel.isMuted();
    },
    onVideoBtnClick() {
      this.$rtc.call.toggleVideo(this.$rtc.call.channel.isMuted().video);
      this.mediaStatus = this.$rtc.call.channel.isMuted();
    },
  },
  watch : {
    hasException : {
      handler(val) {
        if (val) {
          this.deviceExceptionNotice.open(this, this.videoException, this.audioException);
        }
        else this.deviceExceptionNotice.close();
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
  #call-controls {
    .control-btn {
      background: rgba(0,0,0,0.65);
      box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
      @apply w-10 h-10 text-lg text-white mx-2 border-transparent;
    }
  }
  .more-panel-popover {
    .ant-popover-inner-content {
      padding: 4px 0;
      .popover-content {
        width: 180px;
        /*height: 64px;*/
        .popover-content-item {
          @apply h-8 w-full px-3 flex items-center cursor-pointer;

          .ant-slider-rail, .ant-slider-track,.ant-slider-step {
            height: 2px;
          }
          .ant-slider-handle {
            width: 12px;
            height: 12px;
          }
        }
      }
    }
  }
</style>
