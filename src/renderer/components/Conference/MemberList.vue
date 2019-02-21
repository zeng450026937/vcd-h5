<template>
  <a-layout id="member-list" class="h-full bg-white">

    <member-list-wrapper :title="`已入会（${memberNum}）`" mkey="1"
                         :is-selected="selectedGroup === '1'"
                         @selected="selectGroup">
      <template slot="items">
        <member-list-inner :list="memberList"/>
      </template>
      <template slot="operation">
        <div class="text-white" v-if="selectedGroup === '1'">
          <a-iconfont type="icon-sousuo" class="ml-4 text-base"/>
          <a-iconfont type="icon-maikefeng" class="ml-4 text-base"/>
          <a-iconfont type="icon-maikefengjinyong" class="ml-4 text-base"/>
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
          <a-iconfont type="icon-tongguo" class="ml-4 text-base cursor-pointer" @click.stop="allowAllAttend"/>
          <a-iconfont type="icon-yichu" class="ml-4 text-base cursor-pointer" @click.stop="removeAllAttend"/>
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
          <a-iconfont type="icon-tongguo" class="ml-4 text-base cursor-pointer" @click.stop="allowAllSpeak"/>
          <a-iconfont type="icon-yichu" class="ml-4 text-base cursor-pointer" @click.stop="removeAllSpeak"/>
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
  data() {
    return {
      selectedGroup  : '',
      selectedMember : '',
    };
  },
  computed : {
    memberList() {
      return this.$model.conference.memberList;
    },
    memberNum() {
      let count = 0;

      this.memberList.forEach((m) => count += m.list.length);
      
      return count;
    },
    waitingList() {
      return this.$model.conference.waitingList;
    },
    speakApplyList() {
      return this.$model.conference.speakApplyList;
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
