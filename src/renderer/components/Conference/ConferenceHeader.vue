<template>
  <div id="conference-header" class="bg-meeting-top h-9">
    <div class="pl-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable my-1 mr-12">
        <a-iconfont v-if="isLocked"
                    type="icon-suoding"
                    :title="$t('conversation.header.conferenceLocked')"
                    class="text-white text-base no-dragable mr-4"/>
        <a-iconfont type="icon-tonghuabaohu"
                    :title="$t('conversation.header.safeConversation')"
                    class="text-white text-base no-dragable mr-4"/>
        <a-iconfont :type="`icon-wangluozhuangtai_${signal}`"
                    :title="$t('conversation.header.signal')"
                    class="text-white no-dragable text-base mr-4 cursor-pointer"
                    @click="showStatistics"/>
        <span class="text-white text-xs leading-tight truncate mr-4">{{duration}}</span>
        <div class="w-1 flex flex-grow">
          <span class="text-white text-xs leading-tight truncate">{{subject}}（ID：{{conferenceId}}）</span>
        </div>
      </div>
      <common-header class="text-white"/>
    </div>
    <conference-statistics-modal ref="statisticsModal"/>
  </div>
</template>

<script>
import CommonHeader from '../Shared/CommonHeader.vue';
import ConferenceStatisticsModal from './ConferenceStatisticsModal.vue';

export default {
  name       : 'ConferenceHeader',
  components : {
    CommonHeader,
    ConferenceStatisticsModal,
  },
  computed : {
    description() {
      return this.$rtc.conference.information.description;
    },
    conferenceId() {
      return this.description.conferenceId;
    },
    subject() {
      return this.description.subject;
    },
    duration() {
      return this.$model.conference.state.duration;
    },
    signal() {
      return this.$model.conference.state.signal;
    },
    isLocked() {
      return this.$rtc.conference.information.state.getLock().admissionPolicy !== 'anonymous';
    },
  },
  methods : {
    showStatistics() {
      this.$refs.statisticsModal.visible = true;
    },
  },
};
</script>
