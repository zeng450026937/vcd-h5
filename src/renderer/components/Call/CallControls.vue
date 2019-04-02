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
      <a-button v-if="isVideoCall"
                :disabled="!shareAvailable"
                shape="circle"
                class="control-btn"
                :title="hasLocalScreenStream ? '关闭辅流' : '分享辅流'"
                @click="showScreenShareModal"
      ><a-iconfont type="icon-fuliu"/></a-button>
      <!--更多-->
      <a-popover
          trigger="click"
          v-model="showMorePanel"
          overlayClassName="more-panel-popover"
      >
        <div slot="content" class="popover-content">
          <div class="popover-content-item hover:bg-list-hover"
               :disabled="isSwitching"
               @click="switchCallType">
            <a-iconfont :type="isVideoCall ? 'icon-yuyin' : 'icon-shipin'" class="text-lg text-indigo"/>
            <span class="ml-3 text-xs">{{isVideoCall ? '切换为音频通话' : '切换为视频通话'}}</span>
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
    <call-plate-modal ref="plateModal"/>
    <screen-share-modal ref="shareModal"/>
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
      props : [ 'isVideoCall', 'isSwitching' ],
    },
    {
      ns    : 'call.sketch',
      props : [ 'showMorePanel', 'isInCallMain' ],
    },
  ],
  computed : {
    enableLocalVideo() {
      return this.$model.setting.enableLocalVideo;
    },
    shareAvailable() {
      // const { currentUser } = this.$rtc.conference.information.users;
      //
      // if (!currentUser) return false;
      //
      // return this.$rtc.conference.information.users.currentUser.isShareAvariable();
      return false;
    },
    callStatus() {
      return this.$model.state.callStatus;
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
  },
  methods : {
    showScreenShareModal() {
      if (this.hasLocalScreenStream) {
        // this.$rtc.conference.shareChannel.disconnect();

        return;
      }
      this.$refs.shareModal.visible = true;
    },
    hasLocalScreenStream() {
      return false;
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
    switchCallType() {
      if (this.isSwitching) return;
      this.showMorePanel = false;
      this.isVideoCall = !this.isVideoCall;
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
        height: 64px;
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
