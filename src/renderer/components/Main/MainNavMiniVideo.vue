<template>
  <div id="main-nav-mini-video">
    <div class="relative main-nav-mini-video-inner" style="border: 1px solid #1D212F;">
      <div class="h-8 flex items-center absolute w-full z-10" style="background: rgba(0,0,0,0.65);">
        <span class="text-white text-xs mx-3 truncate leading-tight">{{conferenceTitle || '暂无'}}</span>
      </div>
      <div class="video-controls absolute w-full">
        <div class="h-full w-full flex flex-col">

          <div class="flex flex-grow"></div>
          <div class="flex justify-center py-3 items-center">
            <div class="button-content flex h-8 items-center z-10">

              <a-button v-if="isVideoConference"
                        :disabled="videoDisabled"
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
                  overlayClassName="mini-more-panel-popover"
              >
                <div slot="content" class="popover-content">
                  <div v-if="isVideoConference"
                       class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-list-hover"
                       @click="toAudioConference">
                    <a-iconfont type="icon-yuyin" class="text-lg text-indigo"/>
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
                          class="text-white mx-2 border-transparent"
                          @click="showMorePanel = !showMorePanel"
                >
                  <a-iconfont type="icon-gengduo1"/>
                </a-button>
              </a-popover>
              <a-button shape="circle"
                        title="退出"
                        class="text-white mx-2 bg-red-light border-transparent"
                        @click="showLeaveModal"
              >
                <a-iconfont type="icon-guaduan"/>
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <video-view class="nav-mini-video bg-white cursor-pointer h-full"
                  :class="{'video-mirroring': horizontalMirroring}"
                  title="双击回到视频会议界面"
                  :source="isShareInCenter ? 'screen': 'remote'"
                  object-fit="cover"
                  position="relative"
                  @dblclick.native="expandVideoContent"
                  :hide-video="!isVideoConference">
        <div v-if="!isVideoConference"
             slot="content"
             class="absolute-center h-full flex flex-col items-center justify-center">
          <a-iconfont type="icon-huiyishi" class="display-icon"/>
          <span class="display-name">音频会议</span>
        </div>
      </video-view>
    </div>
    <conference-leaving-modal ref="leavingModal"/>
    <conference-plate-modal ref="plateModal"/>
  </div>
</template>

<script>
import VideoView from '../Common/VideoView.vue';
import { CONFERENCE } from '../../router/constants';
import ConferenceLeavingModal from '../Conference/ConferenceLeavingModal.vue';
import ConferencePlateModal from '../Conference/ConferencePlateModal.vue';

export default {
  name       : 'MainNavMiniVideo',
  components : {
    VideoView,
    ConferenceLeavingModal,
    ConferencePlateModal,
  },
  data() {
    return {
      showMorePanel : false,
    };
  },
  sketch : [
    {
      ns    : 'state',
      props : [ 'isInMiniConference' ],
    },
    {
      ns    : 'conference.sketch',
      props : [ 'isShareInCenter', 'isVideoConference' ],
    },
  ],
  computed : {
    currentUser() {
      return this.$rtc.conference.information.users.currentUser;
    },
    horizontalMirroring() {
      return this.$model.setting.horizontalMirroring;
    },
    confStatus() {
      return this.$rtc.conference.status;
    },
    conferenceTitle() {
      return this.$rtc.conference.information.description.subject;
    },
    enableLocalVideo() {
      return this.$model.setting.enableLocalVideo;
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
    toAudioConference() {
      this.showMorePanel = false;
      this.isVideoConference = false;
    },
    showLeaveModal() {
      this.$refs.leavingModal.visible = true;
    },
    expandVideoContent() {
      this.isInMiniConference = false;
    },
    onAudioBtnClick() {
      this.$dispatch('conference.toggleAudio');
    },
    onVideoBtnClick() {
      this.$dispatch('conference.toggleVideo');
    },
    openPlateModal() {
      this.showMorePanel = false;
      this.$refs.plateModal.visible = true;
    },
  },
};
</script>

<style lang="less">
#main-nav-mini-video {
  .main-nav-mini-video-inner {
    width: 100%;
    min-height: 136px;
  }
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
  .display-icon {
    opacity: 0.4;
    color: white;
    font-size: 32px;
  }
  .display-name {
    opacity: 0.4;
    font-size: 12px;
    color: #FFFFFF;
    text-align: center;
    line-height: 24px;
    margin-top: 10px;
  }
  .video-mirroring {
    .video-content {
      transform: rotateY(180deg);
    }
  }
  .nav-mini-video {

  }
  button {
    box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
  }
}
.mini-more-panel-popover {
  .ant-popover-inner-content {
    padding: 4px 0;
    .popover-content {
      width: 180px;
      .popover-content-item {
        cursor: pointer;
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
