<template>
  <div id="call-header" class="bg-meeting-top h-9">
    <div class="pl-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable w-1 my-1 mr-12">
        <template v-if="callStatus === 'connected'">
          <a-iconfont type="icon-tonghuabaohu"
                      :title="$t('conversation.header.safeConversation')"
                      class="text-white text-base mr-4 no-dragable"/>
          <a-iconfont :type="`icon-wangluozhuangtai_${signal}`"
                      :title="$t('conversation.header.signal')"
                      class="text-white text-base mr-4 no-dragable cursor-pointer"
                      @click="showStatistics"/>
          <span class="text-white text-xs leading-tight truncate mr-4">{{duration}}</span>
        </template>
        <template v-if="userName">
        <div class="text-white max-w-4/5 text-xs leading-tight truncate">
          <span>{{$t('conversation.title.with')}}</span>
          <span class="truncate"> {{this.userName}} </span>
        </div>
        <span class="text-white text-xs leading-tight ml-1">{{$t('conversation.title.communicating')}}</span>
        </template>
        <div v-else class="text-white text-xs leading-tight">
          通话已结束
        </div>
      </div>
      <common-header class="text-white"/>
    </div>
    <conference-statistics-modal content="call" ref="statisticsModal"/>
  </div>
</template>

<script>
import CommonHeader from '../Shared/CommonHeader.vue';
import ConferenceStatisticsModal from '../Conference/ConferenceStatisticsModal.vue';

export default {
  name       : 'CallHeader',
  components : {
    CommonHeader,
    ConferenceStatisticsModal,
  },
  computed : {
    callStatus() {
      return this.$model.state.callStatus;
    },
    targetInfo() {
      return this.$model.call.targetInfo;
    },
    isIncoming() { // 来电
      return this.$rtc.call.direction === 'incoming';
    },
    displayName() {
      const remoteIdentity = this.callStatus !== 'disconnected'
        ? this.$rtc.call.remoteIdentity
        || this.$rtc.call.incoming[0].remoteIdentity : null;

      return remoteIdentity && remoteIdentity.display_name;
    },
    userName() {
      return this.isIncoming ? this.displayName : this.targetInfo.name;
    },
    duration() {
      return this.$model.call.state.duration;
    },
    signal() {
      return this.$model.call.state.signal;
    },
  },
  methods : {
    showStatistics() {
      this.$refs.statisticsModal.visible = true;
    },
  },
};
</script>
