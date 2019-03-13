<template>
  <div id="conference-header" class="bg-meeting-top h-9">
    <div class="px-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable my-1 mr-12" @dblclick="maxAppContent">
        <a-iconfont v-if="isLocked"
                    type="icon-suoding"
                    title="会议已锁定"
                    class="text-white text-base no-dragable mr-4"/>
        <a-iconfont type="icon-tonghuabaohu"
                    title="通话保护"
                    class="text-white text-base no-dragable mr-4"/>
        <a-iconfont :type="`icon-wangluozhuangtai_${signal}`"
                    title="信号"
                    class="text-white no-dragable text-base mr-4 cursor-pointer"/>
        <span class="text-white text-xs leading-tight truncate mr-4">{{duration}}</span>
        <div class="w-1 flex flex-grow">
          <span class="text-white text-xs leading-tight truncate">{{subject}}（ID：{{conferenceId}}）</span>
        </div>
      </div>
      <common-header class="text-white"/>
    </div>
  </div>
</template>

<script>
import CommonHeader from '../Shared/CommonHeader.vue';

export default {
  name       : 'ConferenceHeader',
  components : {
    CommonHeader,
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
      return this.$model.confState.duration;
    },
    signal() {
      return this.$model.confState.signal;
    },
    isLocked() {
      return this.$rtc.conference.information.state.getLock().admissionPolicy !== 'anonymous';
    },
  },
  methods : {
    maxAppContent() {
      console.warn('MAX');
    },
  },
};
</script>
