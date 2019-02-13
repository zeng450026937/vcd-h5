<template>
  <a-layout id="member-list" class="h-full bg-white">

    <member-list-wrapper :title="`已入会（${memberNum}）`" mkey="1">
      <template slot="items">
        <member-list-inner :list="memberList"/>
      </template>
    </member-list-wrapper>

    <member-list-wrapper :title="`会议大厅（${waitingList.length}）`" mkey="2">
      <template slot="items">
        <template v-for="item in waitingList">
          <member-list-item :item="item" :key="item.uid"/>
        </template>
      </template>
    </member-list-wrapper>

    <member-list-wrapper :title="`举手发言（${speakApplyList.length}）`" mkey="3">
      <template slot="items">
        <template v-for="item in speakApplyList">
          <member-list-item :item="item" :key="item.uid"/>
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
  data() {
    return {
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
