<template>
  <div id="conference-controls" class="flex justify-center py-5 items-center w-full">
    <div class="button-content flex h-12 items-center z-10">
      <!--视频控制-->
      <a-button v-if="isVideoConference"
                :disabled="videoDisabled"
                shape="circle"
                class="control-btn"
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
      <a-button v-if="isVideoConference && shareAvailable"
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
          :getPopupContainer="popupContainer"
      >
        <div slot="content" class="popover-content">
          <div v-if="isVideoConference"
               class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-list-hover"
              @click="switchConferenceType">
            <a-iconfont type="icon-shipin" class="text-lg text-indigo"/>
            <span class="ml-3 text-xs">切换为音频会议</span>
          </div>
          <div class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-list-hover"
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
      <!--退出-->
      <a-button shape="circle"
                title="退出会议"
                class="control-btn bg-red-light"
                @click="showLeaveModal"
      ><a-iconfont type="icon-guaduan"/></a-button>
    </div>
    <conference-leaving-modal ref="leavingModal"
                              :getContainer="modalContainer"/>
    <screen-share-modal ref="shareModal"
                        :getContainer="modalContainer"/>
    <conference-message v-show="!isInConferenceMain || !isVideoConference" class="conference-message"/>
    <conference-plate-modal ref="plateModal"
                            :getContainer="modalContainer"/>
  </div>
</template>

<script>
import ConferenceLeavingModal from './ConferenceLeavingModal.vue';
import ScreenShareModal from './ScreenShareModal.vue';
import ConferencePlateModal from './ConferencePlateModal.vue';
import ConferenceMessage from './ConferenceMessage.vue';

export default {
  name       : 'ConferenceControls',
  components : {
    ConferenceLeavingModal,
    ScreenShareModal,
    ConferencePlateModal,
    ConferenceMessage,
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'isInConferenceMain', 'showMorePanel', 'isVideoConference' ],
  },
  computed : {
    popupContainer() {
      return () => document.getElementById('conference-controls');
    },
    modalContainer() {
      return () => document.getElementById('layout-conference-content');
    },
    mediaStatus() {
      return this.$rtc.media.localMedia.status;
    },
    videoException() {
      return this.mediaStatus.active && !this.mediaStatus.video;
    },
    audioException() {
      return this.mediaStatus.active && !this.mediaStatus.audio;
    },
    hasException() {
      return this.videoException || this.audioException;
    },
    enableLocalVideo() {
      return this.$model.setting.enableLocalVideo;
    },
    currentUser() {
      return this.$rtc.conference.information.users.currentUser;
    },
    shareAvailable() {
      if (!this.currentUser) return false;

      return this.currentUser.isShareAvariable();
    },
    hasLocalScreenStream() {
      return !!this.$rtc.conference.shareChannel.localStream;
    },
    audioIcon() {
      const iconMap = {
        block      : { icon: 'icon-maikefengjinyong', color: 'red-light', title: '打开麦克风' },
        unblock    : { icon: 'icon-maikefeng', color: '', title: '关闭麦克风' },
        unblocking : { icon: 'icon-quxiaojushou', color: 'red-light', title: '取消举手' },
        hand       : { icon: 'icon-jushou', color: '', title: '举手' },
      };

      return iconMap[this.$model.conference.audioStatus || 'unblock'];
    },
    videoIcon() {
      const iconMap = {
        unblock : { icon: 'icon-shipin', color: '', title: '关闭摄像头' },
        block   : { icon: 'icon-shipinjinyong', color: 'red-light', title: '打开摄像头' },
      };

      return iconMap[this.$model.conference.videoStatus];
    },
    videoDisabled() {
      if (this.currentUser && this.currentUser.isOnHold()) return true;
      const { status } = this.$rtc.media.localMedia;

      return (!status.active || !status.video) && !this.enableLocalVideo;
    },
    audioDisabled() {
      if (this.currentUser && this.currentUser.isOnHold()) return true;
      const { status } = this.$rtc.media.localMedia;

      return (!status.active || !status.audio) && !this.enableLocalVideo;
    },
  },
  methods : {
    showScreenShareModal() {
      if (this.hasLocalScreenStream) {
        this.$rtc.conference.shareChannel.disconnect();
        
        return;
      }
      this.$refs.shareModal.visible = true;
    },
    showLeaveModal() {
      this.$refs.leavingModal.visible = true;
    },
    onAudioBtnClick() {
      this.$dispatch('conference.toggleAudio');
    },
    onVideoBtnClick() {
      this.$dispatch('conference.toggleVideo');
    },
    onExitClicked() {
      this.$rtc.conference.leave();
    },
    openPlateModal() {
      this.showMorePanel = false;
      this.$refs.plateModal.visible = true;
    },
    switchConferenceType() {
      this.showMorePanel = false;
      this.isVideoConference = !this.isVideoConference;
    },
  },
  watch : {
    hasException : {
      handler(val) {
        if (val) {
          const text = this.videoException ? '当前摄像头异常，请检查后重试'
            : this.audioException ? '当前麦克风异常，请检查后重试' : '当前摄像头和麦克风异常，请检查后重试';

          this.$message.warning(text, 0);
        }
        else {
          this.$message.destroy();
        }
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
  #conference-controls {
    .conference-message {
      position: absolute;
      left: 100%;
      bottom: 4px;
      transform: translateX(-100%);
      width: 100%;
    }
    .button-content{
      .control-btn {
        @apply w-10 h-10 text-lg text-white mx-2 border-transparent;
      }
    }
    button {
      box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
    }
  }
</style>
