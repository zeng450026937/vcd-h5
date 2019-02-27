<template>
  <div id="conference-controls" class="flex justify-center py-5 items-center">
    <div class="button-content flex h-12 items-center z-10">
      <!--视频控制-->
      <a-button :disabled="videoDisabled"
                shape="circle"
                class="w-10 h-10 text-lg text-white border-transparent"
                :class="{[`bg-${videoIcon.color}`] : true}"
                @click="onVideoBtnClick"
      >
        <a-iconfont :type="videoIcon.icon"/>
      </a-button>
      <!--音频-->
      <a-button :disabled="audioDisabled"
                shape="circle"
                class="w-10 h-10 text-lg text-white mx-3 border-transparent"
                :class="{[`bg-${audioIcon.color}`] : true}"
                @click="onAudioBtnClick"
      >
        <a-iconfont :type="audioIcon.icon"/>
      </a-button>
      <!--分享辅流-->
      <a-button :disabled="!shareAvailable"
                shape="circle"
                class="w-10 h-10 text-lg text-white border-transparent"
                @click="showScreenShareModal"
      ><a-iconfont type="icon-fuliu"/></a-button>
      <!--更多-->
      <a-popover
          trigger="click"
          v-model="showMorePanel"
          overlayClassName="more-panel-popover"
      >
        <div slot="content" class="popover-content text-white">
          <div class="h-8 w-full px-3 popover-content-item flex items-center">
            <a-iconfont type="icon-maikefeng" class="text-lg"/>
            <span class="ml-3 text-xs">切换为音频通话</span>
          </div>
          <div class="h-8 w-full px-3 popover-content-item flex items-center"
               @click="openPlateModal">
            <a-iconfont type="icon-bohao" theme="filled" class="text-lg"/>
            <span class="ml-3 text-xs">拨号盘</span>
          </div>
        </div>
        <a-button shape="circle"
                  class="w-10 h-10 text-lg text-white mx-3 border-transparent"
                  @click="showMorePanel = !showMorePanel"
        ><a-iconfont type="icon-gengduo1"/></a-button>
      </a-popover>
      <!--退出-->
      <a-button shape="circle"
                class="w-10 h-10 text-lg border-transparent text-white bg-red-light"
                @click="showLeaveModal"
      ><a-iconfont type="icon-guaduan"/></a-button>
    </div>
    <conference-leaving-modal ref="leavingModal"/>
    <screen-share-modal ref="shareModal"/>
    <conference-message v-if="!isInConferenceMain" class="conference-message"/>
    <conference-plate-modal ref="plateModal"/>
  </div>
</template>

<script>
import ConferenceLeavingModal from './ConferenceLeavingModal.vue';
import ScreenShareModal from './ScreenShareModal.vue';
import ConferencePlateModal from './ConferencePlateModal.vue';
import ConferenceMessage from './ConferenceMessage.vue';
import { CONFERENCE } from '../../router/constants';

export default {
  name       : 'ConferenceControls',
  components : {
    ConferenceLeavingModal,
    ScreenShareModal,
    ConferencePlateModal,
    ConferenceMessage,
  },
  data() {
    return {
      // isInConferenceMain : true,
      showMorePanel      : false,
      isInConferenceMain : false,
    };
  },
  computed : {
    shareAvailable() {
      const { currentUser } = this.$rtc.conference.information.users;

      if (!currentUser) return false;

      return this.$rtc.conference.information.users.currentUser.isShareAvariable();
    },
    hasLocalScreenStream() {
      return !!this.$rtc.conference.shareChannel.localStream;
    },
    audioIcon() {
      const iconMap = {
        block      : { icon: 'icon-maikefengjinyong', color: 'red-light' },
        unblock    : { icon: 'icon-maikefeng', color: '' },
        unblocking : { icon: 'icon-quxiaojushou', color: 'red-light' },
        hand       : { icon: 'icon-jushou', color: '' },
      };

      return iconMap[this.$model.conference.audioStatus || 'unblock'];
    },
    videoIcon() {
      const iconMap = {
        unblock : { icon: 'icon-shipin', color: '' },
        block   : { icon: 'icon-shipinjinyong', color: 'red-light' },
      };

      return iconMap[this.$model.conference.videoStatus];
    },
    videoDisabled() {
      const { status } = this.$rtc.media.localMedia;

      return !status.active || !status.video;
    },
    audioDisabled() {
      const { status } = this.$rtc.media.localMedia;

      return !status.active || !status.audio;
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
      this.$model.conference.noticeTextList = [];
    },
    openPlateModal() {
      this.showMorePanel = false;
      this.$refs.plateModal.visible = true;
    },
  },
  watch : {
    $route : {
      handler(val) {
        this.isInConferenceMain = val.path === CONFERENCE.CONFERENCE_MAIN;
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
    button {
      box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
    }
  }
</style>
