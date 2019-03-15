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
                         @selected="selectGroup">
      <template slot="items">
        <template v-for="item in waitingList">
          <member-list-item :item="item" :key="item.entity"/>
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
                         @selected="selectGroup">
      <template slot="items">
        <template v-for="item in speakApplyList">
          <member-list-item :item="item" :key="item.entity"/>
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
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'filterText', 'selectedGroup', 'selectedMember', 'isOpenSearch' ],
  },
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
    isPresenter() { // current => the current login user
      return this.$model.conference.isPresenter;
    },
  },
  methods : {
    selectGroup(key) {
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
        this.$model.conference.updateAudioStatus(user, true);
      });
    },
    removeAllSpeak() { // 拒绝全部发言
      this.speakApplyList.forEach((user) => {
        this.$model.conference.updateAudioStatus(user, false);
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
};
</script>

<style lang="less">
#member-list{
  .ant-collapse-content-box {
    padding: 0 !important;
  }
}
</style>
