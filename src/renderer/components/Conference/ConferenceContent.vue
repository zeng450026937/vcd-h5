<template>
  <a-layout id="conference-content" class="bg-transparent h-full">
    <div class="relative h-full w-full">
      <div class="flex flex-col h-full">
        <div v-if="isInConferenceMain" class="header flex flex-col h-12 dragable z-10">
          <div class="flex items-center h-full text-white self-end px-4 no-dragable">
            <a-icon type="fullscreen" class="cursor-pointer hover:text-indigo"/>
            <a-icon type="user-add" class="ml-6 cursor-pointer hover:text-indigo-light"
                    @click="showInviteModal"/>
            <template v-for="(tab, index) in tabList">
              <a-icon :key="index" :type="tab.icon"
                      class="ml-6 cursor-pointer hover:text-indigo-light"
                      @click="openDrawer(tab)"/>
            </template>
          </div>
        </div>
        <div class="flex flex-grow"></div>
        <!--TODO hard code modify after year-->
        <conference-controls/>
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
import ConferenceControls from './ConferenceControls.vue';
import { CONFERENCE } from '../../router/constants';

export default {
  name : 'ConferenceContent',
  data() {
    const tabList = [
      { icon: 'team', comp: 'TabMemberView' },
      { icon: 'message', comp: 'TabChatting' },
      { icon: 'setting', comp: 'TabSetting' },
    ];

    return {
      tabList,
      isInConferenceMain : true,
    };
  },
  components : {
    ConferenceRemoteVideo,
    ConferenceLocalVideo,
    ConferenceNotice,
    ConferenceControls,
  },
  mounted() {
  },
  methods : {
    showInviteModal() {
      this.$refs.invitingModal.visible = true;
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
