<template>
  <a-layout id="conference-content" class="bg-media h-full">
    <div class="relative h-full w-full"
         @mousemove="contentClicked"
         @click="contentClicked">
      <div class="flex flex-col h-full">
        <div class="header no-dragable flex flex-col h-10 z-10"
             :class="{'opacity-0': hideControls}">
          <div class="flex items-center h-full text-white self-end px-4">
            <a-iconfont v-if="remoteScreenStream && !isShareWindowOpen" type="icon-danchufuliu"
                        :title="$t('conversation.main.popSharing')"
                        class="cursor-pointer hover:text-indigo text-base"
                        @click="openShareWindow"/>
            <a-iconfont ref="maxIcon"
                        type="icon-quanping" class="ml-4 cursor-pointer hover:text-indigo text-base"
                        :title="$t('conversation.main.maximizeOrMinimize')"
                        @click="maxConferenceContent"/>
            <template v-if="isInConferenceMain">
              <a-tooltip
                  :visible="isInstanceConference"
                  placement="bottom"
                  overlayClassName="instance-conference-tooltip">
                <a-iconfont type="icon-tianjialianxiren"
                            class="ml-4 cursor-pointer hover:text-indigo-light text-base"
                            :title="$t('conversation.main.inviteMember')"
                            @click="showInviteModal"/>
                <template slot="title">
                  <span>{{$t('conversation.tip.inviteMore')}}</span>
                </template>
              </a-tooltip>

              <div v-for="(tab, index) in tabList" :key="index">
                <a-badge :numberStyle= "{backgroundColor: 'white', boxShadow : 'none'}"
                         class="shadow-none"
                         :dot="(hasNewApply && tab.comp === 'TabMemberView')
                          || (hasNewMessage && tab.comp === 'TabChatting')">
                <a-iconfont :type="tab.icon"
                            :title="tab.title"
                            class="ml-4 cursor-pointer hover:text-indigo-light text-base"
                            @click="openDrawer(tab.comp)"/>
                </a-badge>
              </div>
            </template>
          </div>
        </div>
        <div class="flex flex-grow"></div>
      </div>
      <div id="remote-video-wrapper"
           :class="remoteVideoClass">
        <conference-remote-video
            :source="centerSource"
            @video-dblclick="maxConferenceContent"/>
      </div>
      <div :class="localVideoClasses">
        <conference-local-video/>
      </div>
      <div v-if="remoteScreenStream"
           :class="shareVideoClasses">
        <conference-share-video
            :source="leftSource"
            @video-clicked="shareScreenClicked"/>
      </div>
      <conference-inviting-modal ref="invitingModal"
                                 :getContainer="conferenceContent"/>
    </div>
  </a-layout>
</template>

<script>
import screenfull from 'screenfull';
import ConferenceRemoteVideo from './ConferenceRemoteVideo.vue';
import ConferenceLocalVideo from './ConferenceLocalVideo.vue';
import ConferenceShareVideo from './ConferenceShareVideo.vue';
import ConferenceInvitingModal from './ConferenceInvitingModal.vue';
import { CONFERENCE } from '../../router/constants';
import { $t } from '../../i18n';

export default {
  name       : 'ConferenceContent',
  components : {
    ConferenceRemoteVideo,
    ConferenceLocalVideo,
    ConferenceShareVideo,
    ConferenceInvitingModal,
  },
  data() {
    return {
      shareWindow         : null,
      shareControlsWindow : null,
      isShareControlsOpen : false,
      hideControlsTimer   : null,
    };
  },
  sketch : [
    {
      ns    : 'conference.sketch',
      props : [ 'hideControls', 'isShareInCenter',
        'isShareWindowOpen', 'isInConferenceMain',
        'currentTab', 'isVideoConference',
        'updateHoldPosition', 'isInstanceConference' ],
    },
    {
      ns    : 'conference.member',
      props : [ 'hasNewMeetingApply', 'hasNewSpeakApply' ],
    },
    {
      ns    : 'conference.chat',
      props : [ 'hasNewMessage' ],
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
    tabList() {
      const tabList = [
        { icon: 'icon-suoding', comp: 'TabLockConference', title: $t('conversation.main.lockConference') },
        { icon: 'icon-chengyuanliebiao', comp: 'TabMemberView', title: $t('conversation.main.memberList') },
        { icon: 'icon-liaotian', comp: 'TabChatting', title: $t('conversation.main.chat') },
        { icon: 'icon-kongzhi', comp: 'TabSetting', title: $t('conversation.main.setting') },
      ];

      const { currentUser } = this.$model.conference;

      if (currentUser && currentUser.isCastViewer()) tabList.splice(1, 1); // 广播方
      else if (currentUser && currentUser.isOnHold()) tabList.splice(1, 2); // 会议大厅

      return tabList;
    },
    conferenceContent() {
      return () => document.getElementById('layout-conference-content');
    },
    mediaStatus() {
      return this.$rtc.media.localMedia.status;
    },
    deviceException() {
      return this.mediaStatus.active && (!this.mediaStatus.video || !this.mediaStatus.audio);
    },
    hasNewApply() {
      return this.hasNewMeetingApply || this.hasNewSpeakApply;
    },
    centerSource() {
      return this.isShareInCenter ? 'screen' : 'remote';
    },
    leftSource() {
      return this.isShareInCenter ? 'remote' : 'screen';
    },
    localVideoClasses() {
      const position = this.isInConferenceMain ? 'right'
        : this.remoteScreenStream && !this.isShareWindowOpen ? 'center-right' : 'center';

      return {
        [`local-video-content local-video-content-${position}`] : true,
        'z-end'                                                 : !this.isVideoConference,
      };
    },
    shareVideoClasses() {
      const position = this.isInConferenceMain ? 'left' : 'center';

      return {
        [`share-video-content share-video-content-${position}`] : true,
      };
    },
    remoteVideoClass() {
      return {
        'remote-video-content absolute h-full w-full pin-t pin-r' : true,
      };
    },
    remoteScreenStream() {
      return this.$rtc.conference.shareChannel.remoteStream;
    },
    localScreenStream() {
      return this.$rtc.conference.shareChannel.localStream;
    },
    hasScreenStream() {
      return !!this.remoteScreenStream || !!this.localScreenStream;
    },
    shareStreamStatus() {
      return this.$rtc.media.screenMedia.statusAnalyser.status.video;
    },
  },
  mounted() {
    this.contentClicked();
  },
  methods : {
    openShareWindow() {
      if (this.isShareWindowOpen) return;

      const option = 'width=528,height=297,minWidth=528,minHeight=297,'
        + 'directories=no,resizable,titlebar=no,toolbar=no,'
        + 'location=no,status=no,menubar=no,scrollbars=no';

      this.shareWindow = window.open('shareScreen.html', 'screen-share', option);
      this.isShareWindowOpen = true;
      this.shareWindow.onbeforeunload = () => {
        // FIXME TMP SOLUTION
        setTimeout(() => {
          this.isShareWindowOpen = !this.shareWindow.closed;
        }, 800);
      };
    },
    openShareControls() {
      if (this.isShareControlsOpen) return;
      this.$dispatch('application.openShareControls').then((window) => {
        this.shareControlsWindow = window;
        this.isShareControlsOpen = true;
      });
    },
    showInviteModal() {
      this.$refs.invitingModal.visible = true;
    },
    openDrawer(tab) {
      if (this.hasNewMessage && tab === 'TabChatting') {
        this.hasNewMessage = false;
      }
      this.currentTab = tab;
      this.isInConferenceMain = false;
    },
    maxConferenceContent() {
      // FIXME DBLCLICK 双击是如果间隔时间过短，则不会响应事件
      screenfull.toggle(this.conferenceContent()).then(() => {
        this.updateHoldPosition = true;
      });
    },
    contentClicked() {
      if (!this.hideControls && this.hideControlsTimer) {
        clearTimeout(this.hideControlsTimer);
      }

      this.hideControls = false;

      if (this.deviceException) {
        return;
      }
      this.hideControlsTimer = setTimeout(() => {
        this.hideControls = !this.deviceException;
        clearTimeout(this.hideControlsTimer);
      }, 6000);
    },
    shareScreenClicked() {
      this.isShareInCenter = !this.isShareInCenter;
    },
  },
  watch : {
    isInConferenceMain : {
      handler(val) {
        if (val) {
          this.$router.push({ path: CONFERENCE.CONFERENCE_MAIN });
        }
        else {
          this.$router.push({ path: CONFERENCE.CONFERENCE_DRAWER });
        }
      },
      immediate : true,
    },
    localScreenStream(val) {
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
    hasScreenStream(val) {
      // 第一次打开辅流将其显示在主页面

      this.isShareInCenter = this.remoteScreenStream;

      // if (val) {
      //   this.$rtc.media.screenMedia.acquireStream();
      // }
      // else {
      //   this.$rtc.media.screenMedia.releaseStream();
      // }
    },
    remoteScreenStream(val) {
      // 观看他人内容共享时自动最大化VCD窗口
      if (val && this.maximizedWhenRemoteSharing) {
        this.$dispatch('application.maximize', { unBack: true });
      }
    },
    deviceException(val) {
      this.contentClicked();
    },
    isShareWindowOpen(val) {
      if (val) this.isShareInCenter = false;
    },
    shareStreamStatus(val) {
      if (!this.isSwitching && this.localScreenStream && !val) {
        // 分享的应用被关闭
        this.$message.warn($t('conversation.share.message.sharingEnded'));
        this.$rtc.conference.shareChannel.disconnect();
      }
    },
  },
};
</script>

<style lang="less">
#conference-content {
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
  .instance-conference-tooltip {
    .ant-tooltip-content {
      .ant-tooltip-arrow {
        border-bottom-color: #d7def3;
      }
      .ant-tooltip-inner {
        background-color: #d7def3;
        font-size: 12px;
        color: #4A5FC4;
        text-align: center;
        line-height: 20px;
      }
    }
  }
</style>
