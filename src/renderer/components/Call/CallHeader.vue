<template>
  <div id="call-header" class="bg-meeting-top h-9">
    <div class="px-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable w-1 my-1 mr-12">
        <template v-if="callStatus === 'connected'">
          <a-iconfont type="icon-tonghuabaohu"
                      title="通话保护"
                      class="text-white text-base mr-4 no-dragable"/>
          <a-iconfont :type="`icon-wangluozhuangtai_${signal}`"
                      title="信号"
                      class="text-white text-base mr-4 no-dragable cursor-pointer"
                      @click="showStatistics"/>
          <span class="text-white text-xs leading-tight truncate mr-4">{{duration}}</span>
        </template>
        <span class="text-white text-xs leading-tight truncate">{{title}}</span>
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
  data() {
    return {
      targetUser : '',
    };
  },
  computed : {
    title() {
      const titleMap = {
        connecting   : `正在呼叫 ${this.userName}`,
        connected    : `与 ${this.userName} 通话中`,
        ringing      : `${this.userName} 正在来电`,
        disconnected : `与 ${this.userName} 的通话已结束`,
      };

      return titleMap[this.callStatus] || '当前通话已失效';
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    displayName() {
      const remoteIdentity = this.callStatus !== 'disconnected'
        ? this.$rtc.call.remoteIdentity
        || this.$rtc.call.incoming[0].remoteIdentity : null;

      return remoteIdentity && (remoteIdentity.display_name
        || remoteIdentity.uri.user);
    },
    userName() {
      return this.displayName || this.targetUser || '未知用户';
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
  watch : {
    displayName(cur, once) {
      this.targetUser = cur || once;
    },
  },
};
</script>
