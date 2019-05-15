<template>
  <div id="main-nav-mini-call">
    <div class="relative call-inner" style="border: 1px solid #1D212F;">
      <div class="audio-controls absolute w-full">
        <div class="h-full w-full flex flex-col">

          <div class="flex flex-grow"></div>
          <div class="flex justify-center py-3 items-center">
            <div class="button-content flex h-8 items-center z-10">
              <a-button v-if="isVideoCall"
                        :disabled="videoDisabled"
                        shape="circle"
                        class="text-white mx-2 border-transparent"
                        :class="{[`bg-${videoIcon.color}`] : true}"
                        :title="videoIcon.title"
                        @click="onVideoBtnClick"
              >
                <a-iconfont :type="videoIcon.icon"/>
              </a-button>
              <!--音频-->
              <a-button :disabled="audioDisabled"
                        shape="circle"
                        class="text-white mx-2 border-transparent"
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
                  <div v-if="isVideoCall"
                       class="popover-content-item hover:bg-list-hover"
                       @click="toAudioCall">
                    <a-iconfont type="icon-yuyin" class="text-lg text-indigo"/>
                    <span class="ml-3 text-xs">{{$t('conversation.controls.toAudioCall')}}</span>
                  </div>
                  <div class="popover-content-item hover:bg-list-hover"
                       @click="openPlateModal">
                    <a-iconfont type="icon-bohao" theme="filled" class="text-lg text-indigo"/>
                    <span class="ml-3 text-xs">{{$t('conversation.controls.plate')}}</span>
                  </div>
                </div>
                <a-button shape="circle"
                          class="text-white mx-2 border-transparent"
                          @click="showMorePanel = !showMorePanel"
                ><a-iconfont type="icon-gengduo1"/></a-button>
              </a-popover>

              <a-button shape="circle"
                        class="text-white mx-2 bg-red-light border-transparent"
                        @click="hangUp"
              ><a-iconfont type="icon-guaduan"/></a-button>
            </div>
          </div>
        </div>
      </div>

      <video-view class="nav-mini-video bg-white cursor-pointer h-full"
                  title="双击回到视频会议界面"
                  source="call-remote"
                  object-fit="cover"
                  position="relative"
                  @dblclick.native="expandMiniContent"
                  :hide-video="!isVideoCall">
        <div v-if="!isVideoCall"
             slot="content"
             class="absolute-center h-full flex flex-col items-center justify-center"
             style="top: 40%">
          <a-iconfont type="icon-huiyishi" class="display-icon"/>
          <span class="display-name">{{$t('conversation.main.audioCall')}}</span>
        </div>
      </video-view>

    </div>
    <call-plate-modal ref="plateModal"/>
  </div>
</template>

<script>
import CallPlateModal from '../Call/CallPlateModal.vue';
import VideoView from '../Common/VideoView.vue';
import { CALL } from '../../router/constants';

export default {
  name       : 'MainNavMiniCall',
  components : {
    VideoView,
    CallPlateModal,
  },
  data() {
    return {
      showMorePanel : false,
      mediaStatus   : { audio: false, video: false },
    };
  },
  sketch : [
    {
      ns    : 'state',
      props : [ 'isInMiniCall' ],
    },
    {
      ns    : 'call',
      props : [ 'isVideoCall' ],
    },
  ],
  created() {
    this.mediaStatus = this.$rtc.call.channel.isMuted();
  },
  computed : {
    callText() {
      const titleMap = {
        connecting   : `正在呼叫 ${this.userName}`,
        connected    : `正在与 ${this.userName} 进行通话`,
        ringing      : `${this.userName} 正在来电`,
        disconnected : `与 ${this.userName} 的通话已结束`,
      };

      return titleMap[this.callStatus] || '当前通话已失效';
    },
    displayName() {
      const remoteIdentity = this.callStatus !== 'disconnected'
        ? this.$rtc.call.remoteIdentity
          || this.$rtc.call.incoming[0].remoteIdentity : null;

      return remoteIdentity && (remoteIdentity.display_name
          || remoteIdentity.uri.user);
    },
    userName() {
      return this.displayName || this.targetUser || '未知用户';
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    isConnecting() {
      return this.$rtc.call.connecting;
    },
    isConnected() {
      return this.$rtc.call.connected;
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
    enableLocalVideo() {
      return this.$model.setting.enableLocalVideo;
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
    hangUp() {
      if (this.callStatus === 'ringing') {
        this.$rtc.call.decline().catch(() => {});
      }
      else {
        this.$rtc.call.disconnect();
      }
    },
    expandMiniContent() {
      this.isInMiniCall = false;
    },
    toAudioCall() {
      this.showMorePanel = false;
      this.isVideoCall = false;
    },
    openPlateModal() {
      this.showMorePanel = false;
      this.$refs.plateModal.visible = true;
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
    displayName(cur, once) {
      this.targetUser = cur || once;
    },
  },
};
</script>

<style lang="less">
  #main-nav-mini-call {
    background-color: rgb(31, 36, 55);
    .call-inner{
      width: 240px;
      height: 136px;
    }
    .audio-controls {
      top: 100%;
      transform: translateY(-100%);
      z-index: 1;
      .button-content {
        button {
          background: rgba(0,0,0,0.65);
          box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
        }
      }
    }
    .target-avatar {
      background-color: #55638C;
    }
    .target-name {
      font-size: 16px;
      color: #FFFFFF;
      text-align: center;
      line-height: 40px;
    }
    .nav-mini-video {
      .video-content {
        height: 100%;
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
      margin-top: 10px;
    }
  }
  .mini-more-panel-popover {
    padding: 4px 0;
    .popover-content {
      width: 180px;
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

</style>
