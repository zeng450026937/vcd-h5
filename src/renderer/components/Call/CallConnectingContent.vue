<template>
  <a-layout id="call-connecting-content" class="h-full">
    <div class="flex flex-col h-full">
      <div class="call-connecting-content-header flex flex-col h-12">
        <div class="flex items-center h-full text-white self-end px-5 no-dragable">
          <a-iconfont type="icon-quanping" class="ml-5 cursor-pointer hover:text-indigo text-base"/>
          <a-iconfont type="icon-kongzhi" class="ml-5 cursor-pointer hover:text-indigo text-base"/>
        </div>
      </div>
      <div class="call-content flex flex-grow flex-col items-center justify-center">
        <a-avatar :size="160" class="target-avatar border-8">
          <span class="target-name">{{userName}}</span>
        </a-avatar>
        <span class="text-white text-2xl leading-loose mt-5">{{callText}}</span>
      </div>
      <div class="flex flex-shrink">
        <call-controls/>
      </div>
    </div>
  </a-layout>
</template>

<script>
import CallControls from './CallControls.vue';

export default {
  name       : 'CallConnectingContent',
  components : {
    CallControls,
  },
  computed : {
    callText() {
      const titleMap = {
        connecting   : `正在呼叫 ${this.userName}`,
        connected    : `正在与 ${this.userName} 进行通话`,
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
  },
  watch : {
    displayName(cur, once) {
      this.targetUser = cur || once;
    },
  },
};
</script>

<style lang="less">
  #call-connecting-content{
    background-color: rgb(31, 36, 55);
    .call-connecting-content-header {
      background-image: linear-gradient(-180deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.00) 98%);
    }
    .target-avatar {
      background-color: #55638C;
    }
    .target-name {
      font-size: 32px;
      color: #FFFFFF;
      text-align: center;
      line-height: 40px;
    }
  }
</style>
