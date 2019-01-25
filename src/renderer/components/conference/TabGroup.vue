<template>
  <a-layout id="tab-group" class="h-full bg-white">
    <div class="flex flex-col h-full">
      <div class="header flex items-center">
        <a-button shape="circle"
                  style="transform: translateX(-50%);"
                  icon="close"
                  @click="clickClose"/>
        <div class="flex flex-grow"></div>
        <div class="flex items-center justify-end py-4 px-4 text-2xl text-grey-darkest">
          <div v-for="tab in tabList" :key="tab.key"
               class="flex mx-3 cursor-pointer hover:text-blue-light">
            <a-icon :type="tab.icon"
                    :class="{'text-blue': tab.key === currentTab.key}"
                    @click="selectTab(tab)"/>
          </div>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="content h-full">
        <component :is="currentTab.is"></component>
      </div>
    </div>
  </a-layout>
</template>

<script>
import InviteTab from './InviteTab.vue';
import MemberTab from './MemberTab.vue';
import SettingTab from './SettingTab.vue';
import ChatTab from './ChatTab.vue';

const tabList = [
  {
    key  : 'invite',
    icon : 'user-add',
    is   : 'InviteTab',
  },
  {
    key  : 'member',
    icon : 'team',
    is   : 'MemberTab',
  },
  {
    key  : 'chat',
    icon : 'message',
    is   : 'SettingTab',
  },
  {
    key  : 'setting',
    icon : 'setting',
    is   : 'ChatTab',
  },

];

export default {
  name       : 'TabGroup',
  components : {
    InviteTab,
    MemberTab,
    SettingTab,
    ChatTab,
  },
  data() {
    return {
      currentTab : tabList[0], // invite member chat setting
      tabList,
    };
  },
  mounted() {
    const { type } = this.$router.currentRoute.query;

    this.currentTab = this.tabList.find((t) => t.key === type);
  },
  computed : {
  },
  methods : {
    selectTab(tab) {
      this.currentTab = tab;
    },
    clickClose() {
      this.$router.push('/conference');
    },
  },
};
</script>

<style scoped lang="less">
#tab-group {
  width: 320px;
}
</style>
