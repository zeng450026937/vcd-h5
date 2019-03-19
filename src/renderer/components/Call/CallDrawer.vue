<template>
  <div id="call-drawer"
       class="shadow h-full bg-white"
       style="width: 280px">
    <div class="flex flex-col h-full">
      <div class="h-10">
        <div class="header flex w-full h-full border-b px-4">
          <div class="flex flex-grow h-full items-center">
            <a-iconfont type="icon-guanbi" class="cursor-pointer hover:text-red text-base"
                        @click="closeDrawer"/>
          </div>
          <div class="flex h-full items-center">
            <a-iconfont type="icon-tianjialianxiren"
                        class="ml-4 cursor-pointer text-black9 hover:text-indigo-light text-base"
                        @click="showInviteModal"/>
            <template v-for="(tab, index) in tabList">
              <a-badge :key="index"
                       :numberStyle="{backgroundColor: 'red', boxShadow : 'none'}"
                       class="shadow-none"
                       :dot="hasNewMessage && index === 0">
                <a-iconfont :key="index" :type="tab.icon"
                            class="ml-4 cursor-pointer text-black9 text-base"
                            :class="{'text-indigo': currentTab === tab.is,
                            'hover:text-indigo-light': currentTab !== tab.is}"
                            @click="switchTab(tab.is)"/>
              </a-badge>
            </template>
          </div>
        </div>
      </div>
      <div class="flex h-full">
        <component :is="currentTab" @close="closeDrawer"></component>
      </div>
    </div>
  </div>
</template>

<script>
import TabSetting from './TabSetting.vue';
import TabChatting from './TabChatting.vue';

export default {
  name       : 'CallDrawer',
  components : {
    TabSetting,
    TabChatting,
  },
  sketch : [
    {
      ns    : 'call.sketch',
      props : [ 'isInCallMain', 'currentTab' ],
    },
    {
      ns    : 'call.chat',
      props : [ 'hasNewMessage' ],
    },
  ],

  data() {
    const tabList = [
      { icon: 'icon-liaotian', is: 'TabChatting' },
      { icon: 'icon-kongzhi', is: 'TabSetting' },
    ];

    return {
      tabList,
    };
  },
  mounted() {
  },
  methods : {
    showInviteModal() {
      // FIXME modify
      this.$parent.$children[0].showInviteModal();
    },
    closeDrawer() {
      this.isInCallMain = true;
    },
    switchTab(tab) {
      if (this.hasNewMessage && tab === 'TabChatting') {
        this.hasNewMessage = false;
      }
      if (this.currentTab === tab) {
        this.isInCallMain = true;

        return;
      }
      this.currentTab = tab;
    },
  },
};
</script>
