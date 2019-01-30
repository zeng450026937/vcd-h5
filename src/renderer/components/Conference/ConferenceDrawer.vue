<template>
  <div id="conference-drawer"
            class="shadow h-full"
            style="width: 280px">
    <div class="flex flex-col h-full">
      <div class="h-10">
        <div class="header flex w-full h-full border-b px-4">
          <div class="flex flex-grow h-full items-center">
            <a-icon type="close" class="cursor-pointer hover:text-red"
                    @click="closeDrawer"/>
          </div>
          <div class="flex h-full items-center">
            <a-icon type="user-add"
                    class="ml-6 cursor-pointer hover:text-indigo-light"
                    @click="showInviteModal"/>
            <template v-for="(tab, index) in tabList">
              <a-icon :key="index" :type="tab.icon"
                      class="ml-6 cursor-pointer"
                      :class="{'text-indigo': currentTab === tab.is,
                    'hover:text-indigo-light': currentTab !== tab.is}"
                      @click="currentTab = tab.is"/>
            </template>
          </div>
        </div>
      </div>
      <div class="flex h-full">
        <component :is="currentTab"></component>
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
      { icon: 'lock', is: 'TabLockConference' },
      { icon: 'team', is: 'TabMemberView' },
      { icon: 'message', is: 'TabChatting' },
      { icon: 'setting', is: 'TabSetting' },
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
      this.$parent.$children[0].$refs.invitingModal.visible = true;
      // console.warn(this.$refs);
    },
    closeDrawer() {
      this.$router.push(CONFERENCE.CONFERENCE_MAIN);
    },
  },
};
</script>

<style scoped>

</style>
