<template>
  <a-layout id="conference-content" class="bg-transparent h-full">
    <div class="relative h-full w-full">
      <div class="flex flex-col h-full">
        <div v-if="isInConferenceMain" class="header flex flex-col h-12 dragable z-10">
          <div class="flex items-center h-full text-white self-end px-5 no-dragable">
            <a-iconfont v-if="hasScreenStream" type="icon-danchufuliu"
                        class="cursor-pointer hover:text-indigo text-base"
                        @click="openShareWindow"/>
            <a-iconfont type="icon-quanping" class="ml-5 cursor-pointer hover:text-indigo text-base"/>
            <a-iconfont type="icon-suoding" class="ml-5 cursor-pointer hover:text-indigo text-base"/>
            <a-iconfont type="icon-tianjialianxiren" class="ml-5 cursor-pointer hover:text-indigo-light text-base"
                    @click="showInviteModal"/>
            <template v-for="(tab, index) in tabList">
              <a-iconfont :key="index" :type="tab.icon"
                      class="ml-5 cursor-pointer hover:text-indigo-light text-base"
                      @click="openDrawer(tab)"/>
            </template>
          </div>
        </div>
        <div class="flex flex-grow"></div>
        <!--TODO hard code modify after year-->
        <conference-controls ref="conferenceControls"/>
      </div>
      <div class="remote-video-content absolute h-full w-full pin-t pin-r">
        <conference-remote-video/>
      </div>
      <div class="local-video-content">
        <conference-local-video/>
      </div>
      <div v-if="hasScreenStream && !isshareWindowOpen" class="share-video-content">
        <conference-share-video/>
      </div>
      <conference-notice/>
    </div>
  </a-layout>
</template>

<script>
import ConferenceRemoteVideo from './ConferenceRemoteVideo.vue';
import ConferenceLocalVideo from './ConferenceLocalVideo.vue';
import ConferenceShareVideo from './ConferenceShareVideo.vue';
import ConferenceNotice from './ConferenceNotice.vue';
import ConferenceControls from './ConferenceControls.vue';
import { CONFERENCE } from '../../router/constants';

export default {
  name : 'ConferenceContent',
  data() {
    const tabList = [
      { icon: 'icon-chengyuanliebiao', comp: 'TabMemberView' },
      { icon: 'icon-liaotian', comp: 'TabChatting' },
      { icon: 'icon-kongzhi', comp: 'TabSetting' },
    ];

    return {
      tabList,
      isInConferenceMain : true,
      shareWindow        : null,
      isshareWindowOpen  : false,
    };
  },
  components : {
    ConferenceRemoteVideo,
    ConferenceLocalVideo,
    ConferenceShareVideo,
    ConferenceNotice,
    ConferenceControls,
  },
  computed : {
    hasScreenStream() {
      return this.$rtc.conference.shareChannel.remoteStream
        || this.$rtc.conference.shareChannel.localStream;
    },
  },
  mounted() {
  },
  methods : {
    openShareWindow() {
      const option = 'width=528,height=297,directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no';

      this.shareWindow = window.open('/shareScreen.html', 'screenShare', option);
      this.isshareWindowOpen = true;
      this.shareWindow.onbeforeunload = () => {
        // FIXME TMP SOLUTION
        setTimeout(() => {
          this.isshareWindowOpen = !this.shareWindow.closed;
        }, 100);
      };
    },
    showInviteModal() {
      this.$refs.conferenceControls.$refs.invitingModal.visible = true;
    },
    openDrawer(tab) {
      this.$router.push({ path: CONFERENCE.CONFERENCE_DRAWER, query: { tab: tab.comp } });
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
#conference-content {
  .header {
    background-image: linear-gradient(-180deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.00) 98%);
  }
  .button-content {
    button {
      background: rgba(0,0,0,0.65);
    }
  }
  .local-video-content {
    position: absolute;
    left: 100%;
    top: 100%;
    transform: translate(-100%, -100%);
  }
  .share-video-content {
    position: absolute;
    left: 0;
    top: 100%;
    transform: translateY(-100%);
  }
}
  .more-panel-popover {
    .ant-popover-arrow {
      z-index: -1;
      background: rgba(0,0,0,0.65);
    }
    .ant-popover-inner {
      background: rgba(0,0,0,0.65);
    }
    .ant-popover-inner-content {
      padding: 4px 0;
      .popover-content {
        width: 180px;
        height: 96px;
        .popover-content-item {
          cursor: pointer;
          &:hover {
            background-color: rgba(255, 255, 255, 0.2);
          }
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
