<template>
  <div id="call-drawer"
       class="shadow h-full bg-white"
       style="width: 280px">
    <div class="flex flex-col h-full">
      <div class="h-10">
        <div class="header flex w-full h-full border-b px-4">
          <div class="flex flex-grow h-full items-center">
            <a-iconfont type="icon-guanbi"
                        class="cursor-pointer hover:text-red text-base"
                        :title="$t('common.controls.close')"
                        @click="closeDrawer"/>
          </div>
          <div class="flex h-full items-center">
            <a-iconfont v-if="isConnected"
                        type="icon-tianjialianxiren"
                        class="ml-4 cursor-pointer text-black9 hover:text-indigo-light text-base"
                        @click="upgrade"/>
            <template v-for="(tab, index) in tabList">
              <a-badge :key="index"
                       :numberStyle="{backgroundColor: 'red', boxShadow : 'none'}"
                       class="shadow-none"
                       :dot="hasNewMessage && index === 0">
                <a-iconfont v-if="isConnected || index !== 0"
                            :key="index" :type="tab.icon"
                            :title="tab.title"
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
        <component :is="currentTab" @close="closeDrawer"/>
      </div>
    </div>
  </div>
</template>

<script>
import TabSetting from '../../../components/Call/TabSetting.vue';
import TabChatting from '../../../components/Call/TabChatting.vue';
import { $t } from '../../../i18n';

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
    {
      ns    : 'conference.sketch',
      props : [ 'updateHoldPosition' ],
    },
  ],

  data() {
    const tabList = [
      { icon: 'icon-liaotian', is: 'TabChatting', title: $t('conversation.main.chat') },
      { icon: 'icon-kongzhi', is: 'TabSetting', title: $t('conversation.main.setting') },
    ];

    return {
      tabList,
    };
  },
  async mounted() {
    await this.$nextTick();
    this.updateHoldPosition = true;
  },
  computed : {
    isConnected() {
      return this.$rtc.call.connected;
    },
  },
  methods : {
    upgrade() {
      this.$dispatch('call.upgrade');
    },
    closeDrawer() {
      this.isInCallMain = true;
      this.currentTab = '';
    },
    switchTab(tab) {
      if (this.hasNewMessage && tab === 'TabChatting') {
        this.hasNewMessage = false;
      }
      if (this.currentTab === tab) {
        this.closeDrawer();

        return;
      }
      this.currentTab = tab;
    },
  },
};
</script>
