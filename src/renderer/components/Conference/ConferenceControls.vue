<template>
  <div id="conference-controls" class="flex justify-center py-5 items-center" :class="{'mb-40': !isInConferenceMain}">
    <div class="button-content flex h-12 items-center z-10">
      <!--视频控制-->
      <a-button :disabled="videoDisabled"
                shape="circle" icon="video-camera"
                class="w-12 h-12 text-xl text-white mx-2"
                @click="onVideoBtnClick"
      ></a-button>
      <!--音频-->
      <a-button :disabled="audioDisabled"
                shape="circle" icon="phone"
                class="w-12 h-12 text-xl text-white mx-2"
                @click="onAudioBtnClick"
      ></a-button>
      <!--分享辅流-->
      <a-button shape="circle" icon="share-alt"
                class="w-12 h-12 text-xl text-white mx-2"
      ></a-button>
      <!--更多-->
      <a-popover
          trigger="click"
          v-model="showMorePanel"
          overlayClassName="more-panel-popover"
      >
        <div slot="content" class="popover-content text-white">
          <div class="h-8 w-full px-3 popover-content-item flex items-center">
            <a-icon type="phone" theme="filled" class="text-base"/>
            <span class="ml-3 text-xs">切换为音频通话</span>
          </div>
          <div class="h-8 w-full px-3 popover-content-item flex items-center">
            <a-icon type="appstore" theme="filled" class="text-base"/>
            <span class="ml-3 text-xs">拨号版</span>
          </div>
          <div class="h-8 w-full px-3 popover-content-item flex items-center">
            <a-icon type="sound" theme="filled" class="text-base"/>
            <a-slider :min="1" :max="100" :defaultValue="30" class="ml-3 w-full m-auto"/>
          </div>
        </div>
        <a-button shape="circle" icon="ellipsis"
                  class="w-12 h-12 text-xl text-white mx-2"
                  @click="showMorePanel = !showMorePanel"
        ></a-button>
      </a-popover>
      <!--退出-->
      <a-button shape="circle" icon="export"
                class="w-12 h-12 text-xl text-white mx-2 bg-red-light"
                @click="showLeaveModal"
      ></a-button>
    </div>
    <conference-inviting-modal ref="invitingModal"/>
    <conference-leaving-modal ref="leavingModal"/>
  </div>
</template>

<script>
import { CONFERENCE } from '../../router/constants';
import ConferenceInvitingModal from './ConferenceInvitingModal.vue';
import ConferenceLeavingModal from './ConferenceLeavingModal.vue';

export default {
  name       : 'ConferenceControls',
  components : {
    ConferenceInvitingModal,
    ConferenceLeavingModal,
  },
  data() {
    return {
      isInConferenceMain : true,
      showMorePanel      : false,
    };
  },
  computed : {
    shareAvailable() {
      const { currentUser } = this.$rtc.conference.information.users;

      if (!currentUser) return false;

      return this.$rtc.conference.information.users.currentUser.isShareAvariable();
    },
    audioIcon() {
      const iconMap = {
        block      : { icon: 'mic_off', color: 'red' },
        unblock    : { icon: 'mic', color: 'white' },
        unblocking : { icon: 'pan_tool', color: 'blue' },
        hand       : { icon: 'pan_tool', color: 'white' },
      };

      return iconMap[this.$model.conference.audioStatus || 'unblock'];
    },
    videoIcon() {
      const iconMap = {
        unblock : { icon: 'videocam', color: 'white' },
        block   : { icon: 'videocam_off', color: 'red' },
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

<style scoped>

</style>
