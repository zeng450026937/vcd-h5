<template>
  <div id="conference-controls" class="flex justify-center py-5 items-center">
    <div class="button-content flex h-12 items-center z-10">
      <!--视频控制-->
      <a-button :disabled="videoDisabled"
                shape="circle"
                class="w-12 h-12 text-2xl text-white mx-2"
                @click="onVideoBtnClick"
      >
        <a-iconfont :type="videoIcon.icon" :class="{[`text-${videoIcon.color}`] : true}"/>
      </a-button>
      <!--音频-->
      <a-button :disabled="audioDisabled"
                shape="circle"
                class="w-12 h-12 text-2xl text-white mx-2"
                @click="onAudioBtnClick"
      >
        <a-iconfont :type="audioIcon.icon" :class="{[`text-${audioIcon.color}`] : true}"/>
      </a-button>
      <!--分享辅流-->
      <a-button shape="circle"
                class="w-12 h-12 text-2xl text-white mx-2"
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
            <a-iconfont type="icon-maikefeng" class="text-base"/>
            <span class="ml-3 text-xs">切换为音频通话</span>
          </div>
          <div class="h-8 w-full px-3 popover-content-item flex items-center">
            <a-iconfont type="icon-bohao" theme="filled" class="text-base"/>
            <span class="ml-3 text-xs">拨号盘</span>
          </div>
          <!--<div class="h-8 w-full px-3 popover-content-item flex items-center">-->
            <!--<a-iconfont type="icon-yangshengqi" class="text-base"/>-->
            <!--<a-slider :min="1" :max="100" :defaultValue="30" class="ml-3 w-full m-auto"/>-->
          <!--</div>-->
        </div>
        <a-button shape="circle"
                  class="w-12 h-12 text-2xl text-white mx-2"
                  @click="showMorePanel = !showMorePanel"
        ><a-iconfont type="icon-gengduo1"/></a-button>
      </a-popover>
      <!--退出-->
      <a-button shape="circle"
                class="w-12 h-12 text-2xl border-transparent text-white mx-2 bg-red-light"
                @click="showLeaveModal"
      ><a-iconfont type="icon-guaduan"/></a-button>
    </div>
    <conference-inviting-modal ref="invitingModal"/>
    <conference-leaving-modal ref="leavingModal"/>
    <screen-share-modal ref="shareModal"/>
  </div>
</template>

<script>
import { CONFERENCE } from '../../router/constants';
import ConferenceInvitingModal from './ConferenceInvitingModal.vue';
import ConferenceLeavingModal from './ConferenceLeavingModal.vue';
import ScreenShareModal from './ScreenShareModal.vue';

export default {
  name       : 'ConferenceControls',
  components : {
    ConferenceInvitingModal,
    ConferenceLeavingModal,
    ScreenShareModal,
  },
  data() {
    return {
      // isInConferenceMain : true,
      showMorePanel : false,
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
        block      : { icon: 'icon-maikefengjinyong', color: 'red' },
        unblock    : { icon: 'icon-maikefeng', color: 'white' },
        unblocking : { icon: 'icon-maikefeng', color: 'blue' },
        hand       : { icon: 'icon-maikefeng', color: 'white' },
      };

      return iconMap[this.$model.conference.audioStatus || 'unblock'];
    },
    videoIcon() {
      const iconMap = {
        unblock : { icon: 'icon-shexiangtou', color: 'white' },
        block   : { icon: 'icon-shexiangtoujinyong', color: 'red' },
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
  },
  // watch : {
  //   $route : {
  //     handler(val) {
  //       this.isInConferenceMain = val.path === CONFERENCE.CONFERENCE_MAIN;
  //     },
  //     immediate : true,
  //   },
  // },
};
</script>

<style scoped>

</style>
