<template>
  <div id="conference-drawer"
            class="shadow h-full bg-white"
            style="width: 280px">
    <div class="flex flex-col h-full">
      <div class="h-10">
        <div class="header no-dragable flex w-full h-full border-b px-4">
          <div class="flex flex-grow h-full items-center">
            <a-iconfont type="icon-guanbi" class="cursor-pointer hover:text-red text-base"
                    @click="closeDrawer"/>
          </div>
          <div class="flex h-full items-center">
            <a-iconfont type="icon-tianjialianxiren"
                    class="ml-4 cursor-pointer text-black9 hover:text-indigo-light text-base"
                    @click="showInviteModal"/>
            <template v-for="(tab, index) in tabList">
              <a-iconfont :key="index" :type="tab.icon"
                      class="ml-4 cursor-pointer text-black9 text-base"
                      :class="{'text-indigo': currentTab === tab.is,
                          'hover:text-indigo-light': currentTab !== tab.is}"
                      @click="switchTab(tab.is)"/>
            </template>
          </div>
        </div>
      </div>
      <div class="flex h-full">
        <keep-alive>
          <component :is="currentTab" @close="closeDrawer"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import TabLockConference from './TabLockConference.vue';
import TabMemberView from './TabMemberView.vue';
import TabChatting from './TabChatting.vue';
import TabSetting from './TabSetting.vue';

import { CONFERENCE } from '../../router/constants';

export default {
  name       : 'ConferenceDrawer',
  components : {
    TabLockConference,
    TabMemberView,
    TabChatting,
    TabSetting,
  },
  data() {
    const tabList = [
      { icon: 'icon-suoding', is: 'TabLockConference' },
      { icon: 'icon-chengyuanliebiao', is: 'TabMemberView' },
      { icon: 'icon-liaotian', is: 'TabChatting' },
      { icon: 'icon-kongzhi', is: 'TabSetting' },
    ];

    return {
      currentTab : '',
      tabList,
    };
  },
  created() {
    const { tab } = this.$router.currentRoute.query;

    this.currentTab = tab || this.tabList[0].is;
  },
  mounted() {
  },
  methods : {
    showInviteModal() {
      // FIXME ugly way
      this.$parent.$children[0].showInviteModal();
    },
    closeDrawer() {
      this.$router.push(CONFERENCE.CONFERENCE_MAIN);
    },
    switchTab(tab) {
      if (this.currentTab === tab) {
        this.closeDrawer();
        
        return;
      }
      this.currentTab = tab;
    },
  },
};
</script>

<style scoped>

</style>
