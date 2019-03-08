<template>
  <a-layout id="conference-content" class="bg-transparent h-full">
    <div class="relative h-full w-full" @mousemove="contentClicked">
      <div class="flex flex-col h-full">
        <div class="header no-dragable flex flex-col h-12 z-10"
             :class="{'opacity-0': hideControls}">
          <div class="flex items-center h-full text-white self-end px-4">
            <a-iconfont v-if="hasScreenStream" type="icon-danchufuliu"
                        title="弹出辅流"
                        class="cursor-pointer hover:text-indigo text-base"
                        @click="openShareWindow"/>
            <a-iconfont type="icon-quanping" class="ml-4 cursor-pointer hover:text-indigo text-base"
                        title="最大化/最小化"
                        @click="maxConferenceContent"/>
            <template v-if="isInConferenceMain">
              <a-iconfont type="icon-tianjialianxiren" class="ml-4 cursor-pointer hover:text-indigo-light text-base"
                          title="邀请成员"
                          @click="showInviteModal"/>
              <template v-for="(tab, index) in tabList">
                <a-iconfont :key="index" :type="tab.icon"
                            :title="tab.title"
                            class="ml-4 cursor-pointer hover:text-indigo-light text-base"

                            @click="openDrawer(tab)"/>
              </template>
            </template>
          </div>
        </div>
        <div class="flex flex-grow"></div>
      </div>
      <div :class="remoteVideoClass"
           @dblclick="maxConferenceContent">
        <conference-remote-video :source="centerSource"/>
      </div>
      <div :class="localVideoClasses">
        <conference-local-video/>
      </div>
      <div v-if="hasScreenStream && !isShareWindowOpen"
           :class="shareVideoClasses">
        <conference-share-video
            :source="leftSource"
            @video-clicked="shareScreenClicked"/>
      </div>
      <conference-inviting-modal ref="invitingModal"/>
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

export default {
  name       : 'ConferenceContent',
  components : {
    ConferenceRemoteVideo,
    ConferenceLocalVideo,
    ConferenceShareVideo,
    ConferenceInvitingModal,
  },
  data() {
    const tabList = [
      { icon: 'icon-suoding', comp: 'TabLockConference', title: '锁定会议' },
      { icon: 'icon-chengyuanliebiao', comp: 'TabMemberView', title: '成员列表' },
      { icon: 'icon-liaotian', comp: 'TabChatting', title: '聊天' },
      { icon: 'icon-kongzhi', comp: 'TabSetting', title: '会议设置' },
    ];

    return {
      tabList,
      isInConferenceMain : true,
      shareWindow        : null,
      isShareWindowOpen  : false,
      hideControlsTimer  : null,
      isShareInCenter    : false, // 辅流页面是否显示在主页面
    };
  },
  computed : {
    centerSource() {
      return this.isShareInCenter ? 'screen' : 'remote';
    },
    leftSource() {
      return this.isShareInCenter ? 'remote' : 'screen';
    },
    localVideoClasses() {
      const position = this.isInConferenceMain ? 'right'
        : this.hasScreenStream && !this.isShareWindowOpen ? 'center-right' : 'center';

      return {
        [`local-video-content local-video-content-${position}`] : true,
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
    hasScreenStream() {
      return this.$rtc.conference.shareChannel.remoteStream
        || this.$rtc.conference.shareChannel.localStream;
    },
    hideControls : {
      get() {
        return this.$model.conference.hideControls;
      },
      set(val) {
        this.$model.conference.hideControls = val;
      },
    },
    noticeTextList() {
      return this.$model.conference.noticeTextList;
    },
  },
  mounted() {
    this.contentClicked();
  },
  methods : {
    openShareWindow() {
      const option = 'width=528,height=297,minWidth=528,minHeight=297,directories=no,resizable,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no';

      this.shareWindow = window.open('shareScreen.html', 'screen-share', option);
      this.isShareWindowOpen = true;
      this.shareWindow.onbeforeunload = () => {
        // FIXME TMP SOLUTION
        setTimeout(() => {
          this.isShareWindowOpen = !this.shareWindow.closed;
        }, 100);
      };
    },
    showInviteModal() {
      this.$refs.invitingModal.visible = true;
    },
    openDrawer(tab) {
      this.$router.push({ path: CONFERENCE.CONFERENCE_DRAWER, query: { tab: tab.comp } });
    },
    maxConferenceContent() {
      // FIXME DBLCLICK 双击是如果间隔时间过短，则不会响应事件
      screenfull.toggle(document.getElementById('layout-conference-content'));
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
    $route : {
      handler(val) {
        this.isInConferenceMain = val.path === CONFERENCE.CONFERENCE_MAIN;
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
    noticeTextList(val) {
      if (val && val.length) this.$message.info(val[val.length - 1]);
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
        height: 64px;
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
