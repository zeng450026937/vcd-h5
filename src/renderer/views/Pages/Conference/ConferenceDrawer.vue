<template>
  <div id="conference-drawer"
       class="shadow h-full bg-white"
       style="width: 280px">
    <div class="flex flex-col h-full">
      <div class="h-10">
        <div class="header no-dragable flex w-full h-full border-b px-4">
          <div class="flex flex-grow h-full items-center">
            <a-iconfont type="icon-guanbi" class="cursor-pointer hover:text-red text-base"
                        :title="$t('common.controls.close')"
                        @click="closeDrawer"/>
          </div>
          <div class="flex h-full items-center">
            <a-iconfont v-if="isRegistered"
                        type="icon-tianjialianxiren"
                        :title="$t('conversation.main.inviteMember')"
                        class="ml-4 cursor-pointer text-black9 hover:text-indigo-light text-base"
                        @click="showInviteModal"/>
            <div v-for="(tab, index) in tabList" :key="index">
              <a-badge :numberStyle="{backgroundColor: 'red', boxShadow : 'none'}"
                       class="shadow-none"
                       :dot="(hasNewApply && tab.comp === 'TabMemberView')
                          || (hasNewMessage && tab.comp === 'TabChatting')">
                <a-iconfont :type="tab.icon"
                            :title="tab.title"
                            class="ml-4 cursor-pointer text-black9 text-base"
                            :class="{'text-indigo': currentTab === tab.comp,
                            'hover:text-indigo-light': currentTab !== tab.comp}"
                            @click="switchTab(tab.comp)"/>
              </a-badge>
            </div>
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
import TabLockConference from '../../../components/Conference/TabLockConference.vue';
import TabMemberView from '../../../components/Conference/TabMemberView.vue';
import TabChatting from '../../../components/Conference/TabChatting.vue';
import TabSetting from '../../../components/Conference/TabSetting.vue';
import { $t } from '../../../i18n';

export default {
  name       : 'ConferenceDrawer',
  components : {
    TabLockConference,
    TabMemberView,
    TabChatting,
    TabSetting,
  },
  sketch : [
    {
      ns    : 'conference.sketch',
      props : [ 'isInConferenceMain', 'currentTab', 'updateHoldPosition' ],
    },
    {
      ns    : 'conference.member',
      props : [ 'hasNewMeetingApply', 'hasNewSpeakApply' ],
    },
    {
      ns    : 'conference.chat',
      props : [ 'hasNewMessage' ],
    },
  ],
  computed : {
    tabList() {
      const tabList = [
        { icon: 'icon-suoding', comp: 'TabLockConference', title: $t('conversation.main.lockConference') },
        { icon: 'icon-chengyuanliebiao', comp: 'TabMemberView', title: $t('conversation.main.memberList') },
        { icon: 'icon-liaotian', comp: 'TabChatting', title: $t('conversation.main.chat') },
        { icon: 'icon-kongzhi', comp: 'TabSetting', title: $t('conversation.main.setting') },
      ];

      const { currentUser } = this.$model.conference;

      if (currentUser && currentUser.isCastViewer()) tabList.splice(1, 1); // 广播方
      else if (currentUser && currentUser.isOnHold()) tabList.splice(1, 2); // 会议大厅

      return tabList;
    },
    hasNewApply() {
      return this.hasNewMeetingApply || this.hasNewSpeakApply;
    },
    isRegistered() {
      return this.$rtc.account.connected;
    },
  },
  async mounted() {
    await this.$nextTick();
    this.updateHoldPosition = true;
  },
  methods : {
    closeDrawer() {
      this.isInConferenceMain = true;
      this.currentTab = '';
    },
    showInviteModal() {
      // FIXME modify
      this.$parent.$children[0].showInviteModal();
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
