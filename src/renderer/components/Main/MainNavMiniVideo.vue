<template>
  <div id="main-nav-mini-video" class="bg-white">
    <div class="relative" style="border: 1px solid #1D212F;">
      <div class="h-8 flex items-center absolute w-full z-10" style="background: rgba(0,0,0,0.65);">
        <span class="text-white text-xs mx-3 truncate leading-tight">{{conferenceTitle}}</span>
      </div>
      <div class="video-controls absolute w-full">
      <div class="h-full w-full flex flex-col">

        <div class="flex flex-grow"></div>
        <div class="flex justify-center py-3 items-center">
          <div class="button-content flex h-8 items-center z-10">

            <a-button :disabled="videoDisabled"
                      shape="circle"
                      class="mx-2 text-white border-transparent"
                      :class="{[`bg-${videoIcon.color}`] : true}"
                      :title="videoIcon.title"
                      @click="onVideoBtnClick"
            >
              <a-iconfont :type="videoIcon.icon"/>
            </a-button>

            <a-button :disabled="audioDisabled"
                      shape="circle"
                      class="mx-2 text-white border-transparent"
                      :class="{[`bg-${audioIcon.color}`] : true}"
                      :title="audioIcon.title"
                      @click="onAudioBtnClick"
            >
              <a-iconfont :type="audioIcon.icon"/>
            </a-button>

            <a-popover
                trigger="click"
                v-model="showMorePanel"
                overlayClassName="more-panel-popover"
            >
              <div slot="content" class="popover-content">
                <div class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-grey-light">
                  <a-iconfont type="icon-yuyin"
                              class="text-base text-indigo"/>
                  <span class="ml-3 text-xs">切换为音频通话</span>
                </div>
                <div class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-grey-light">
                  <a-iconfont type="icon-bohao"
                              class="text-base text-indigo"/>
                  <span class="ml-3 text-xs">拨号盘</span>
                </div>
              </div>
              <a-button shape="circle"
                        title="更多"
                        class="text-white mx-2"
                        @click="showMorePanel = !showMorePanel"
              ><a-iconfont type="icon-gengduo1"/></a-button>
            </a-popover>
            <a-button shape="circle"
                      title="退出"
                      class="text-white mx-2 bg-red-light border-transparent"
                      @click="showLeaveModal"
            ><a-iconfont type="icon-guaduan"/></a-button>
          </div>
        </div>
      </div>
      </div>
      <video-view class="nav-mini-video bg-white cursor-pointer"
                  title="双击回到视频会议界面"
                  source="remote"
                  object-fit="cover"
                  position="relative"
                  @dblclick.native="expandVideoContent"/>
    </div>
    <conference-leaving-modal ref="leavingModal"/>
  </div>
</template>

<script>
import VideoView from '../Common/VideoView.vue';
import { CONFERENCE } from '../../router/constants';
import ConferenceLeavingModal from '../Conference/ConferenceLeavingModal.vue';

export default {
  name       : 'MainNavMiniVideo',
  components : {
    VideoView,
    ConferenceLeavingModal,
  },
  data() {
    return {
      showMorePanel : false,
    };
  },
  computed : {
    isInConferenceView : {
      get() {
        return this.$model.state.isInConferenceView;
      },
      set(val) {
        this.$model.state.isInConferenceView = val;
      },
    },
    confStatus() {
      return this.$rtc.conference.status;
    },
    conferenceTitle() {
      return this.$rtc.conference.information.description.subject;
    },
    videoDisabled() {
      const { status } = this.$rtc.media.localMedia;

      return !status.active || !status.video;
    },
    audioDisabled() {
      const { status } = this.$rtc.media.localMedia;

      return !status.active || !status.audio;
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
  },
  methods : {
    showLeaveModal() {
      this.$refs.leavingModal.visible = true;
    },
    expandVideoContent() {
      this.$model.state.isInMiniConference = false;
      this.isInConferenceView = true;
      this.$router.push(CONFERENCE.CONFERENCE_MAIN);
    },
    onAudioBtnClick() {
      this.$dispatch('conference.toggleAudio');
    },
    onVideoBtnClick() {
      this.$dispatch('conference.toggleVideo');
    },
  },
};
</script>

<style lang="less">
#main-nav-mini-video {
  .video-controls {
    top: 100%;
    transform: translateY(-100%);
    z-index: 1;
    .button-content {
      button {
        background: rgba(0,0,0,0.65);
      }
    }
  }
  .nav-mini-video {

  }
}
</style>
