<template>
  <a-layout id="member-list" class="h-full bg-white">

    <member-list-wrapper :title="`已入会（${memberNum}）`" mkey="1"
                         :is-selected="selectedGroup === '1'"
                         @selected="selectGroup">
      <template slot="items">
        <a-input v-show="isOpenSearch"
                 ref="memberSearchInput"
                 class="border-none"
                 placeholder="搜索联系人"
                 v-model="filterText">
          <a-iconfont v-show="filterText"
                      slot="suffix"
                      type="icon-guanbi"
                      class="text-sm text-grey cursor-pointer hover:text-red"
                      @click="filterText = ''"/>
        </a-input>
        <member-list-inner :list="memberList"/>
      </template>
      <template slot="operation">
        <div class="text-white" v-if="selectedGroup === '1'">
          <a-iconfont :title="isOpenSearch ? '关闭搜索框': '打开搜索框'"
                      type="icon-sousuo" class="ml-4 text-base" @click.stop="openSearch"/>
          <a-iconfont title="解除全员禁言" type="icon-maikefeng" class="ml-4 text-base" @click.stop="unMuteAll"/>
          <a-iconfont title="全员禁言" type="icon-maikefengjinyong" class="ml-4 text-base" @click.stop="muteAll"/>
        </div>
      </template>
    </member-list-wrapper>

    <member-list-wrapper :title="`会议大厅（${waitingList.length}）`" mkey="2"
                         :is-selected="selectedGroup === '2'"
                         :show-dot="hasNewMeetingApply"
                         @selected="selectGroup">
      <template slot="items">
        <template v-for="item in waitingList">
          <member-list-item group="waiting" :item="item" :key="item.entity"/>
        </template>
      </template>
      <template slot="operation">
        <div class="text-white" v-if="selectedGroup === '2' && isPresenter && waitingList.length > 0">
          <a-iconfont type="icon-tongguo"
                      title="全部允许"
                      class="ml-4 text-base cursor-pointer"
                      @click.stop="allowAllAttend"/>
          <a-iconfont type="icon-yichu"
                      title="全部拒绝"
                      class="ml-4 text-base cursor-pointer"
                      @click.stop="removeAllAttend"/>
        </div>
      </template>
    </member-list-wrapper>

    <member-list-wrapper :title="`举手发言（${speakApplyList.length}）`" mkey="3"
                         :is-selected="selectedGroup === '3'"
                         :show-dot="hasNewSpeakApply"
                         @selected="selectGroup">
      <template slot="items">
        <template v-for="item in speakApplyList">
          <member-list-item group="audioApply" :item="item" :key="item.entity"/>
        </template>
      </template>
      <template slot="operation">
        <div class="text-white" v-if="selectedGroup === '3' && isPresenter && speakApplyList.length > 0">
          <a-iconfont type="icon-tongguo"
                      title="全部允许"
                      class="ml-4 text-base cursor-pointer"
                      @click.stop="allowAllSpeak"/>
          <a-iconfont type="icon-yichu"
                      title="全部拒绝"
                      class="ml-4 text-base cursor-pointer"
                      @click.stop="removeAllSpeak"/>
        </div>
      </template>
    </member-list-wrapper>

    <member-list-wrapper :title="`第三方邀请（${inviteRecordList.length}）`" mkey="4"
                         :is-selected="selectedGroup === '4'"
                         @selected="selectGroup">
      <template slot="items">
        <template v-for="item in inviteRecordList">
          <div :key="item.entity" class="h-10 flex px-4 items-center flex-between">
            <span class="flex flex-grow w-1">
              <span class="truncate">{{item.address}}</span>
            </span>
            <span class="ml-2 text-xs"
                  :class="{[`text-${item.status === 'failed' ? 'red-light' : 'green'}`]: true}"
            >{{item.status | filterRecordStatus}}

            <a-iconfont  v-if="item.status === 'failed'"
                         type="icon-shuaxin"
                        title="重新邀请"
                        class="text-sm cursor-pointer text-black9 ml-2"
                        @click="reInvite(item)"></a-iconfont>
            </span>
          </div>
        </template>
      </template>
    </member-list-wrapper>

  </a-layout>
</template>

<script>
import MemberListWrapper from './MemberListWrapper.vue';
import MemberListInner from './MemberListInner.vue';
import MemberListItem from './MemberListItem.vue';

export default {
  name       : 'MemberList',
  components : {
    MemberListWrapper,
    MemberListInner,
    MemberListItem,
  },
  sketch : [
    {
      ns    : 'conference.sketch',
      props : [ 'filterText', 'selectedGroup', 'isOpenSearch' ],
    },
    {
      ns    : 'conference.member',
      props : [ 'hasNewMeetingApply', 'hasNewSpeakApply' ],
    },
  ],
  computed : {
    memberList() {
      return this.$model.conference.member.memberList;
    },
    memberNum() {
      return this.memberList.reduce((sum, val) => val.list.length + sum, 0);
    },
    waitingList() {
      return this.$model.conference.member.waitingList;
    },
    speakApplyList() {
      return this.$model.conference.member.speakApplyList;
    },
    inviteRecordList() {
      return this.$model.conference.invite.inviteRecordList;
    },
    isPresenter() { // current => the current login user
      return this.$model.conference.isPresenter;
    },
  },
  methods : {
    selectGroup(key) {
      if (key === '2') { // 会议大厅
        this.hasNewMeetingApply = false;
      }
      else if (key === '3') { // jushoudayan1
        this.hasNewSpeakApply = false;
      }
      this.selectedGroup = key;
    },
    allowAllAttend() { // 允许入会
      console.warn(this.waitingList);
      this.waitingList.forEach((user) => {
        user.allow(true);
      });
    },
    removeAllAttend() { // 拒绝入会
      this.waitingList.forEach((user) => {
        user.allow(false);
      });
    },
    allowAllSpeak() { // 允许全部发言
      this.speakApplyList.forEach((user) => {
        this.$dispatch('conference.updateAudioStatus', { user, ingress: true });
      });
    },
    removeAllSpeak() { // 拒绝全部发言
      this.speakApplyList.forEach((user) => {
        this.$dispatch('conference.updateAudioStatus', { user, ingress: false });
      });
    },
    openSearch() {
      this.isOpenSearch = !this.isOpenSearch;
    },
    muteAll() {
      this.$rtc.conference.conference.view.setDefaultFilter({
        ingress : false,
      })
        .then(() => {
        })
        .catch(() => {
        });
    },
    unMuteAll() {
      this.$rtc.conference.conference.view.setDefaultFilter({
        ingress : true,
      })
        .then(() => {
        })
        .catch(() => {
        });
    },
    reInvite(record) {
      this.$dispatch('conference.invite.invite', record);
    },
  },
  watch : {
    isOpenSearch : {
      async handler(val) {
        if (val) {
          await this.$nextTick();
          await this.$refs.memberSearchInput.$nextTick();
          this.$refs.memberSearchInput.focus();
        }
      },
      immediate : true,
    },
  },
  filters : {
    filterRecordStatus(status) {
      return {
        inviting : '呼叫中...',
        failed   : '邀请失败',
        success  : '邀请成功',
      }[status];
    },
  },
};
</script>

<style lang="less">
#member-list{
  .ant-collapse-content-box {
    padding: 0 !important;
  }
}
</style>
