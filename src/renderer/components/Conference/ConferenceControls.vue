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
                :class="{'bg-main-theme': hasLocalScreenStream}"
                :title="hasLocalScreenStream
                  ? $t('conversation.controls.screenSharing') :
                  $t('conversation.controls.screenShare')"
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
              @click="toAudioConference">
            <a-iconfont type="icon-yuyin" class="text-lg text-indigo"/>
            <span class="ml-3 text-xs">{{$t('conversation.controls.toAudio')}}</span>
          </div>
          <div class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-list-hover"
               @click="openPlateModal">
            <a-iconfont type="icon-bohao" theme="filled" class="text-lg text-indigo"/>
            <span class="ml-3 text-xs">{{$t('conversation.controls.plate')}}</span>
          </div>
        </div>
        <a-button shape="circle"
                  :title="$t('conversation.controls.more')"
                  class="control-btn"
                  @click="showMorePanel = !showMorePanel"
        ><a-iconfont type="icon-gengduo1"/></a-button>
      </a-popover>
      <!--退出-->
      <a-button shape="circle"
                :title="$t('conversation.controls.exitConference')"
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
    props : [ 'isInConferenceMain', 'showMorePanel', 'isVideoConference', 'deviceExceptionNotice' ],
  },
  computed : {
    isConnected() {
      return this.$rtc.conference.connected;
    },
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
        block      : { icon: 'icon-maikefengjinyong', color: 'red-light', title: this.$t('conversation.controls.turnOnMicrophone') },
        unblock    : { icon: 'icon-maikefeng', color: '', title: this.$t('conversation.controls.turnOffMicrophone') },
        unblocking : { icon: 'icon-quxiaojushou', color: 'red-light', title: this.$t('conversation.controls.cancelRaiseHangs') },
        hand       : { icon: 'icon-jushou', color: '', title: this.$t('conversation.controls.raiseHangs') },
      };

      return iconMap[this.$model.conference.audioStatus || 'unblock'];
    },
    videoIcon() {
      const iconMap = {
        unblock : { icon: 'icon-shipin', color: '', title: this.$t('conversation.controls.turnOffCamera') },
        block   : { icon: 'icon-shipinjinyong', color: 'red-light', title: this.$t('conversation.controls.turnOnCamera') },
      };

      return iconMap[this.$model.conference.videoStatus];
    },
    videoDisabled() {
      if (this.currentUser
        && (this.currentUser.isOnHold()
          || this.currentUser.isCastViewer())) return true;
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
    async showScreenShareModal() {
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
    toAudioConference() {
      this.showMorePanel = false;
      this.isVideoConference = false;
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
