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
              <a-iconfont :key="index" :type="tab.icon"
                          class="ml-4 cursor-pointer text-black9 text-base"
                          :class="{'text-indigo': currentTab === tab.is,
                    'hover:text-indigo-light': currentTab !== tab.is}"
                          @click="currentTab = tab.is"/>
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
import { CALL } from '../../router/constants';

export default {
  name       : 'CallDrawer',
  components : {
    TabSetting,
    TabChatting,
  },

  data() {
    const tabList = [
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
      console.warn(this.$parent.$children[0].showInviteModal());
    },
    closeDrawer() {
      this.$router.push(CALL.CALL_MAIN);
    },
  },
};
</script>
