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
            <a-button shape="circle"
                      size="large" icon="video-camera"
                      class="w-12 h-12 text-xl text-white mx-2"
            ></a-button>
            <a-button shape="circle"
                      size="large" icon="phone"
                      class="w-12 h-12 text-xl text-white mx-2"
            ></a-button>
            <a-button shape="circle"
                      size="large" icon="share-alt"
                      class="w-12 h-12 text-xl text-white mx-2"
            ></a-button>
            <a-button shape="circle"
                      size="large" icon="ellipsis"
                      class="w-12 h-12 text-xl text-white mx-2"
            ></a-button>
            <a-button shape="circle"
                      size="large" icon="export"
                      class="w-12 h-12 text-xl text-white mx-2 bg-red-light"
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
    </div>
  </a-layout>
</template>

<script>
  import ConferenceRemoteVideo from './ConferenceRemoteVideo.vue';
  import ConferenceLocalVideo from './ConferenceLocalVideo.vue';
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
      showHeader : true,
    };
  },
  components : {
    ConferenceRemoteVideo,
    ConferenceLocalVideo,
  },
  mounted() {
  },
  methods : {
    openDrawer(tab) {
      this.$router.push({ path: CONFERENCE.CONFERENCE_DRAWER, query: { tab: tab.comp } });
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

<style scoped lang="less">
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
</style>
