<template>
  <a-layout id="member-list" class="h-full bg-white">

    <member-list-wrapper class="list-panel"
                         Meeting
                         Calendar
                         Contacts
                         Settings
                         Feedback

                         :class="{
                            [`member-panel-${activeGroupKey === '1' ? 'opened' : 'closed'}`] : true
                         }"
                         :title="`${$t('conversation.member.alreadyInConference')}（${memberNum}）`" mkey="1"
                         :is-selected="selectedGroup === '1'"
                         @selected="selectGroup">
      <template slot="items">
        <a-input v-show="isOpenSearch"
                 ref="memberSearchInput"
                 class="border-none"
                 :placeholder="$t('conversation.member.searchContact')"
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
          <a-iconfont :title="isOpenSearch
            ? $t('conversation.member.closeSearchFrame')
            : $t('conversation.member.openSearchFrame')"
                      type="icon-sousuo" class="ml-4 text-base" @click.stop="openSearch"/>
          <a-iconfont :title="$t('conversation.member.unMuteAll')"
                      type="icon-maikefeng"
                      class="ml-4 text-base"
                      @click.stop="unMuteAll"/>
          <a-iconfont :title="$t('conversation.member.muteAll')"
                      type="icon-maikefengjinyong"
                      class="ml-4 text-base"
                      @click.stop="muteAll"/>
        </div>
      </template>
    </member-list-wrapper>

    <member-list-wrapper class="list-panel"
                         :class="{
                            [`waiting-panel-${activeGroupKey === '2' ? 'opened' : 'closed'}`] : true
                         }"
                         :title="`${$t('conversation.member.conferenceHall')}（${waitingList.length}）`" mkey="2"
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
                      :title="$t('conversation.member.allowAll')"
                      class="ml-4 text-base cursor-pointer"
                      @click.stop="allowAllAttend"/>
          <a-iconfont type="icon-yichu"
                      :title="$t('conversation.member.refuseAll')"
                      class="ml-4 text-base cursor-pointer"
                      @click.stop="removeAllAttend"/>
        </div>
      </template>
    </member-list-wrapper>

    <member-list-wrapper class="list-panel"
                         :class="{
                            [`apply-panel-${activeGroupKey === '3' ? 'opened' : 'closed'}`] : true
                         }"
                         :title="`${$t('conversation.member.raiseHangs')}（${speakApplyList.length}）`" mkey="3"
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
                      :title="$t('conversation.member.allowAll')"
                      class="ml-4 text-base cursor-pointer"
                      @click.stop="allowAllSpeak"/>
          <a-iconfont type="icon-yichu"
                      :title="$t('conversation.member.refuseAll')"
                      class="ml-4 text-base cursor-pointer"
                      @click.stop="removeAllSpeak"/>
        </div>
      </template>
    </member-list-wrapper>

    <member-list-wrapper class="list-panel"
                         :class="{
                            [`inviting-panel-${activeGroupKey === '4' ? 'opened' : 'closed'}`] : true
                         }"
                         :title="`${$t('conversation.member.otherInvite')}（${inviteRecordList.length}）`" mkey="4"
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
                         :title="$t('conversation.member.reInvite')"
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
import { $t } from '../../i18n';

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
      props : [ 'filterText', 'selectedGroup', 'isOpenSearch', 'activeGroupKey' ],
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
      else if (key === '3') { // 举手发言
        this.hasNewSpeakApply = false;
      }
      this.selectedGroup = key;
    },
    allowAllAttend() { // 允许入会
      this.$rtc.conference.conference.lobby.allow();
    },
    removeAllAttend() { // 拒绝入会
      this.$rtc.conference.conference.lobby.refuse();
    },
    allowAllSpeak() { // 允许全部发言
      const entities = this.speakApplyList.map((speak) => speak.entity);

      this.$rtc.conference.information.users.setAudioFilter(entities, { ingress: false });
    },
    removeAllSpeak() { // 拒绝全部发言
      const entities = this.speakApplyList.map((speak) => speak.entity);

      this.$rtc.conference.information.users.setAudioFilter(entities, { ingress: false });
    },
    openSearch() {
      if (this.activeGroupKey !== '1') {
        this.isOpenSearch = true;
        this.activeGroupKey = '1';
      }
      else {
        this.isOpenSearch = !this.isOpenSearch;
      }
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
        inviting : $t('conversation.member.ringing'),
        failed   : $t('conversation.member.inviteFailed'),
        success  : $t('conversation.member.inviteSucceed'),
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

  .list-panel {
    /*height: 40px;*/
    overflow-y: overlay;
    transition: all ease-in-out;
    > .ant-collapse-item {
      height: 100%;
      > .ant-collapse-header {
        /*position: fixed;*/
        width: 100%;
        z-index: 10;
      }
      > .ant-collapse-content {
        /*padding-top: 40px;*/
        height: calc( 100% - 40px );
        overflow-y: overlay;
      }
    }
  }
  .member-panel {
    &-opened {
      max-height: calc(100% - 120px);
    }
    &-closed {
      max-height: calc(100% - 120px);
      overflow: hidden;
    }
  }
  .waiting-panel {
    &-opened {
      max-height: calc(100% - 120px);
    }
    &-closed {
      max-height: calc(100% - 120px);
      overflow: hidden;
    }
  }
  .apply-panel {
    &-opened {
      max-height: calc(100% - 120px);
    }
    &-closed {
      max-height: calc(100% - 120px);
      overflow: hidden;
    }
  }
  .inviting-panel {
    &-opened {
      max-height: calc(100% - 120px);
    }
    &-closed {
      max-height: calc(100% - 120px);
      overflow: hidden;
    }
  }
}
</style>
