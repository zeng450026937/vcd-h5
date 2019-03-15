<template>
  <div id="conference-drawer"
       class="shadow h-full bg-white"
       style="width: 280px">
    <div class="flex flex-col h-full">
      <div class="h-10">
        <div class="header no-dragable flex w-full h-full border-b px-4">
          <div class="flex flex-grow h-full items-center">
            <a-iconfont type="icon-guanbi" class="cursor-pointer hover:text-red text-base"
                        title="关闭"
                        @click="isInConferenceMain = true"/>
          </div>
          <div class="flex h-full items-center">
            <a-iconfont type="icon-tianjialianxiren"
                        title="邀请成员"
                        class="ml-4 cursor-pointer text-black9 hover:text-indigo-light text-base"
                        @click="showInviteModal"/>
            <template v-for="(tab, index) in tabList">
              <a-iconfont :key="index" :type="tab.icon"
                          :title="tab.title"
                          class="ml-4 cursor-pointer text-black9 text-base"
                          :class="{'text-indigo': currentTab === tab.is,
                          'hover:text-indigo-light': currentTab !== tab.is}"
                          @click="switchTab(tab.is)"/>
            </template>
          </div>
        </div>
      </div>
      <div class="flex h-full">
        <component :is="currentTab" @close="isInConferenceMain = true"></component>
      </div>
    </div>
  </div>
</template>

<script>
import TabLockConference from './TabLockConference.vue';
import TabMemberView from './TabMemberView.vue';
import TabChatting from './TabChatting.vue';
import TabSetting from './TabSetting.vue';

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
      { icon: 'icon-suoding', is: 'TabLockConference', title: '锁定会议' },
      { icon: 'icon-chengyuanliebiao', is: 'TabMemberView', title: '成员列表' },
      { icon: 'icon-liaotian', is: 'TabChatting', title: '聊天' },
      { icon: 'icon-kongzhi', is: 'TabSetting', title: '会议设置' },
    ];

    return {
      tabList,
    };
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'isInConferenceMain', 'currentTab' ],
  },
  methods : {
    showInviteModal() {
      // FIXME ugly way
      this.$parent.$children[0].showInviteModal();
    },
    switchTab(tab) {
      if (this.currentTab === tab) {
        this.isInConferenceMain = true;
        
        return;
      }
      this.currentTab = tab;
    },
  },
};
</script>
