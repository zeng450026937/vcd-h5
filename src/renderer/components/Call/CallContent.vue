<template>
  <a-layout id="call-content" class="bg-media h-full">
    <div class="relative h-full w-full"
         @mousemove="contentClicked"
         @click="contentClicked">
      <div class="flex flex-col h-full">
        <div class="header no-dragable flex flex-col h-10 z-10"
             :class="{'opacity-0': hideControls}">
          <div class="flex items-center h-full text-white self-end px-4">
            <a-iconfont v-if="hasRemoteScreenStream && !isShareWindowOpen" type="icon-danchufuliu"
                        :title="$t('conversation.main.popSharing')"
                        class="cursor-pointer hover:text-indigo text-base"
                        @click="openShareWindow"/>
            <a-iconfont type="icon-quanping" class="ml-4 cursor-pointer hover:text-indigo text-base"
                        :title="$t('conversation.main.maximizeOrMinimize')"
                        @click="maxCallContent"/>
            <template v-if="isInCallMain">
              <template v-if="isConnected">
                <a-iconfont type="icon-tianjialianxiren" class="ml-4 cursor-pointer hover:text-indigo text-base"
                            @click="upgrade"/>
                <a-badge :numberStyle="{backgroundColor: 'white', boxShadow : 'none'}"
                         class="shadow-none"
                         :dot="hasNewMessage">
                  <a-iconfont type="icon-liaotian" class="ml-4 cursor-pointer hover:text-indigo text-base"
                              @click="openDrawer('TabChatting')"/>
                </a-badge>
              </template>
              <a-iconfont type="icon-kongzhi" class="ml-4 cursor-pointer hover:text-indigo text-base"
                          @click="openDrawer('TabSetting')"/>
            </template>
          </div>
        </div>
        <div class="flex flex-grow"></div>
      </div>
      <div :class="remoteVideoClass">
        <call-remote-video
            :source="centerSource"
            @video-dblclick="maxCallContent"/>
      </div>
      <div v-if="isConnected && isVideoCall"
           v-show="isVideoCall"
           :class="localVideoClasses">
        <call-local-video/>
      </div>
      <div v-if="hasRemoteScreenStream && !isShareWindowOpen"
           :class="shareVideoClasses">
        <call-share-video
            :source="leftSource"
            @video-clicked="shareScreenClicked"/>
      </div>
      <!--<call-inviting-modal ref="invitingModal"-->
                           <!--:getContainer="callContent"/>-->
    </div>
    <!--<hold-item-group/>-->
  </a-layout>
</template>

<script>
import screenfull from 'screenfull';
import CallRemoteVideo from './CallRemoteVideo.vue';
import CallLocalVideo from './CallLocalVideo.vue';
import CallShareVideo from './CallShareVideo.vue';
import CallInvitingModal from './CallInvitingModal.vue';
// import HoldItemGroup from '../Conference/HoldItemGroup.vue';
import { CALL } from '../../router/constants';

export default {
  name       : 'CallContent',
  components : {
    CallInvitingModal,
    CallRemoteVideo,
    CallLocalVideo,
    CallShareVideo,
    // HoldItemGroup,
  },
  data() {
    return {
      shareWindow         : null,
      hideControlsTimer   : null,
      isShareControlsOpen : false,
    };
  },
  sketch : [
    {
      ns    : 'call.sketch',
      props : [ 'hideControls', 'isShareInCenter', 'isShareWindowOpen', 'isInCallMain', 'currentTab' ],
    },
    {
      ns    : 'call.chat',
      props : [ 'hasNewMessage' ],
    },
    {
      ns    : 'call',
      props : [ 'isVideoCall' ],
    },
    {
      ns    : 'conference.sketch',
      props : [ 'updateHoldPosition' ],
    },
    {
      ns    : 'conference.share',
      props : [ 'isSwitching' ],
    },
    {
      ns    : 'setting',
      props : [ 'maximizedWhenRemoteSharing', 'minimizedWhenLocalSharing' ],
    },
  ],
  computed : {
    // callContent() {
    //   return () => document.getElementById('layout-call-content');
    // },
    isConnected() {
      return this.$rtc.call.connected;
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    centerSource() {
      return this.isShareInCenter ? 'call-screen' : 'call-remote';
    },
    leftSource() {
      return this.isShareInCenter ? 'call-remote' : 'call-screen';
    },
    localVideoClasses() {
      const position = this.isInCallMain ? 'right'
        : this.hasRemoteScreenStream && !this.isShareWindowOpen ? 'center-right' : 'center';

      return {
        [`local-video-content local-video-content-${position}`] : true,
      };
    },
    shareVideoClasses() {
      const position = this.isInCallMain ? 'left' : 'center';

      return {
        [`share-video-content share-video-content-${position}`] : true,
      };
    },
    remoteVideoClass() {
      return {
        'remote-video-content absolute h-full w-full pin-t pin-r' : true,
      };
    },
    hasRemoteScreenStream() {
      return this.$rtc.call.share.remoteStream;
    },
    hasLocalScreenStream() {
      return this.$rtc.call.share.localStream;
    },
    hasScreenStream() {
      return !!this.hasRemoteScreenStream || !!this.hasLocalScreenStream;
    },
    shareStreamStatus() {
      return this.$rtc.media.screenMedia.statusAnalyser.status.video;
    },
  },
  mounted() {
    this.contentClicked();
  },
  methods : {
    openShareControls() {
      if (this.isShareControlsOpen) return;
      this.$dispatch('application.openShareControls').then((window) => {
        this.shareControlsWindow = window;
        this.isShareControlsOpen = true;
      });
    },
    openShareWindow() {
      if (this.isShareWindowOpen) return;

      const option = 'width=528,height=297,minWidth=528,minHeight=297,directories=no,resizable,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no';

      this.shareWindow = window.open('shareScreen.html', 'screen-share', option);
      this.isShareWindowOpen = true;
      this.shareWindow.onbeforeunload = () => {
        // FIXME TMP SOLUTION
        setTimeout(() => {
          this.isShareWindowOpen = !this.shareWindow.closed;
        }, 1000);
      };
    },
    upgrade() {
      this.$dispatch('call.upgrade');
    },
    openDrawer(tab) {
      if (this.hasNewMessage && tab === 'TabChatting') {
        this.hasNewMessage = false;
      }
      this.currentTab = tab;
      this.isInCallMain = false;
    },
    maxCallContent() {
      screenfull.toggle(document.getElementById('layout-call-content')).then(() => {
        this.updateHoldPosition = true;
      });
    },
    contentClicked() {
      if (!this.hideControls && this.hideControlsTimer) {
        clearTimeout(this.hideControlsTimer);
      }
      this.hideControls = false;

      this.hideControlsTimer = setTimeout(() => {
        this.hideControls = true;
      }, 6000);
    },
    shareScreenClicked() {
      this.isShareInCenter = !this.isShareInCenter;
    },
  },
  watch : {
    isInCallMain : {
      handler(val) {
        if (val) {
          this.$router.push({ path: CALL.CALL_MAIN });
        }
        else {
          this.$router.push({ path: CALL.CALL_DRAWER });
        }
      },
      immediate : true,
    },
    hasScreenStream(val) {
      // 第一次打开辅流将其显示在主页面
      this.isShareInCenter = this.hasRemoteScreenStream;
    },
    isShareWindowOpen(val) {
      if (val) this.isShareInCenter = false;
    },
    shareStreamStatus(val) {
      if (!this.isSwitching && this.hasLocalScreenStream && !val) {
        // 分享的应用被关闭
        this.$message.warn(this.$t('conversation.share.message.sharingEnded'));
        this.$rtc.call.share.disconnect();
      }
    },
    hasRemoteScreenStream(val) {
      // 观看他人内容共享时自动最大化VCD窗口
      if (val && this.maximizedWhenRemoteSharing) {
        this.$dispatch('application.maximize', { unBack: true });
      }
    },
    hasLocalScreenStream(val) {
      if (val) {
        this.openShareControls();
        if (this.minimizedWhenLocalSharing) {
          this.$dispatch('application.minimize');
        }
      }
      else if (this.shareControlsWindow) {
        this.shareControlsWindow.close();
        this.isShareControlsOpen = false;
        if (this.minimizedWhenLocalSharing) {
          this.$dispatch('application.show');
        }
      }
    },
  },
};
</script>

<style lang="less">
  #call-content {
    .header {
      background-image: linear-gradient(-180deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.00) 98%);
      transition: opacity ease-out .5s;
    }
    .button-content {
      button {
        background: rgba(0,0,0,0.65);
      }
    }
    .local-video-content {
      position: absolute;
      top: 100%;
      &-right {
        left: 100%;
        transform: translate(calc( -100% - 4px ), calc( -100% - 4px ));
      }
      &-center-right {
        left: 50%;
        transform: translateY(-100%);
      }
      &-center {
        left: 50%;
        transform: translate(-50%, -100%);
      }
    }

    .share-video-content {
      position: absolute;
      top: 100%;
      &-left {
        left: 0;
        transform: translate(4px, calc( -100% - 4px ));
      }
      &-center {
        left: 50%;
        transform: translate(-100%, -100%);
      }
    }
  }
  .more-panel-popover {
    .ant-popover-inner-content {
      padding: 4px 0;
      .popover-content {
        width: 180px;
        /*height: 64px;*/
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
