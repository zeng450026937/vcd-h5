<template>
  <a-layout id="conference-content" class="bg-transparent h-full">
    <div class="relative h-full w-full">
      <div class="flex flex-col h-full">
        <div v-if="showHeader" class="header flex flex-col h-12 dragable z-10">
          <div class="flex items-center h-full text-white self-end px-4 no-dragable">
            <a-icon type="fullscreen" class="cursor-pointer hover:text-indigo"/>
            <template v-for="(tab, index) in tabList">
              <a-icon :key="index" :type="tab.icon"
                      class="ml-6 cursor-pointer hover:text-indigo-light"
                      @click="openDrawer(tab)"/>
            </template>
          </div>
        </div>
        <div class="flex flex-grow"></div>
        <div class="flex justify-center py-5 items-center">
          <div class="button-content flex h-12 items-center z-10">
            <a-button shape="circle" icon="video-camera"
                      class="w-12 h-12 text-xl text-white mx-2"
            ></a-button>
            <a-button shape="circle" icon="phone"
                      class="w-12 h-12 text-xl text-white mx-2"
            ></a-button>
            <a-button shape="circle" icon="share-alt"
                      class="w-12 h-12 text-xl text-white mx-2"
            ></a-button>
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
            <a-button shape="circle" icon="export"
                      class="w-12 h-12 text-xl text-white mx-2 bg-red-light"
                      @click="leaveConference"
            ></a-button>
          </div>
        </div>
      </div>
      <div class="remote-video-content absolute h-full w-full pin-t pin-r">
        <conference-remote-video/>
      </div>
      <div class="local-video-content">
        <conference-local-video/>
      </div>
      <conference-notice/>
    </div>
  </a-layout>
</template>

<script>
import ConferenceRemoteVideo from './ConferenceRemoteVideo.vue';
import ConferenceLocalVideo from './ConferenceLocalVideo.vue';
import ConferenceNotice from './ConferenceNotice.vue';
import { CONFERENCE } from '../../router/constants';

export default {
  name : 'ConferenceContent',
  data() {
    const tabList = [
      { icon: 'user-add', comp: 'TabInviting' },
      { icon: 'team', comp: 'TabMemberView' },
      { icon: 'message', comp: 'TabChatting' },
      { icon: 'setting', comp: 'TabSetting' },
    ];

    return {
      tabList,
      showHeader    : true,
      showMorePanel : false,
    };
  },
  components : {
    ConferenceRemoteVideo,
    ConferenceLocalVideo,
    ConferenceNotice,
  },
  mounted() {
  },
  methods : {
    openDrawer(tab) {
      this.$router.push({ path: CONFERENCE.CONFERENCE_DRAWER, query: { tab: tab.comp } });
    },
    leaveConference() {
      this.$rtc.conference.leave();
    },
  },
  watch : {
    $route : {
      handler(val) {
        this.showHeader = val.path === CONFERENCE.CONFERENCE_MAIN;
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
