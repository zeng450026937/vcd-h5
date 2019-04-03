<template>
  <a-layout id="call-content" class="bg-media h-full">
    <div class="relative h-full w-full"
         @mousemove="contentClicked"
         @click="contentClicked">
      <div class="flex flex-col h-full">
        <div class="header no-dragable flex flex-col h-10 z-10"
             :class="{'opacity-0': hideControls}">
          <div class="flex items-center h-full text-white self-end px-4">
            <a-iconfont v-if="hasScreenStream && !isShareWindowOpen" type="icon-danchufuliu"
                        title="弹出辅流"
                        class="cursor-pointer hover:text-indigo text-base"
                        @click="openShareWindow"/>
            <a-iconfont type="icon-quanping" class="ml-4 cursor-pointer hover:text-indigo text-base"
                        title="最大化/最小化"
                        @click="maxCallContent"/>
            <template v-if="isInCallMain">
              <template v-if="isConnected">
                <a-iconfont type="icon-tianjialianxiren" class="ml-5 cursor-pointer hover:text-indigo text-base"
                            @click="showInviteModal"/>
                <a-badge :numberStyle="{backgroundColor: 'white', boxShadow : 'none'}"
                         class="shadow-none"
                         :dot="hasNewMessage">
                  <a-iconfont type="icon-liaotian" class="ml-5 cursor-pointer hover:text-indigo text-base"
                              @click="openDrawer('TabChatting')"/>
                </a-badge>
              </template>
              <a-iconfont type="icon-kongzhi" class="ml-5 cursor-pointer hover:text-indigo text-base"
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
      <div v-show="isVideoCall"
           :class="localVideoClasses">
        <call-local-video/>
      </div>
      <div v-if="hasScreenStream && !isShareWindowOpen"
           :class="shareVideoClasses">
        <call-share-video
            :source="leftSource"
            @video-clicked="shareScreenClicked"/>
      </div>
      <call-inviting-modal ref="invitingModal"
                           :getContainer="callContent"/>
    </div>
    <hold-item-group/>
  </a-layout>
</template>

<script>
import screenfull from 'screenfull';
import CallRemoteVideo from './CallRemoteVideo.vue';
import CallLocalVideo from './CallLocalVideo.vue';
import CallShareVideo from './CallShareVideo.vue';
import CallInvitingModal from './CallInvitingModal.vue';
import HoldItemGroup from '../Conference/HoldItemGroup.vue';
import { CALL } from '../../router/constants';

export default {
  name       : 'CallContent',
  components : {
    CallInvitingModal,
    CallRemoteVideo,
    CallLocalVideo,
    CallShareVideo,
    HoldItemGroup,
  },
  data() {
    return {
      shareWindow       : null,
      hideControlsTimer : null,
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
  ],
  computed : {
    callContent() {
      return () => document.getElementById('layout-call-content');
    },
    isConnected() {
      return this.$rtc.call.connected;
    },
    callText() {
      const titleMap = {
        connecting   : `正在呼叫 ${this.userName}`,
        connected    : `正在与 ${this.userName} 进行通话`,
        ringing      : `${this.userName} 正在来电`,
        disconnected : `与 ${this.userName} 的通话已结束`,
      };

      return titleMap[this.callStatus] || '当前通话已失效';
    },
    callStatus() {
      return this.$model.state.callStatus;
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
    centerSource() {
      return this.isShareInCenter ? 'screen' : 'call-remote';
    },
    leftSource() {
      return this.isShareInCenter ? 'call-remote' : 'screen';
    },
    localVideoClasses() {
      const position = this.isInCallMain ? 'right'
        : this.hasScreenStream && !this.isShareWindowOpen ? 'center-right' : 'center';

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
    hasScreenStream() {
      return false;
    },
  },
  mounted() {
    this.contentClicked();
  },
  methods : {
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
    showInviteModal() {
      this.$refs.invitingModal.visible = true;
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
      }, 600000);
    },
    shareScreenClicked() {
      this.isShareInCenter = !this.isShareInCenter;
    },
  },
  watch : {
    displayName(cur, once) {
      this.targetUser = cur || once;
    },
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
      this.isShareInCenter = !!val;
    },
    isShareWindowOpen(val) {
      if (val) this.isShareInCenter = false;
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
