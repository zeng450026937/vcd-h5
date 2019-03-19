<template>
  <a-layout id="call-content" class="h-full bg-media">
    <div class="flex flex-col h-full">
      <div class="call-content-header flex flex-col h-10">
        <div class="flex items-center h-full text-white self-end px-5 no-dragable">
          <a-iconfont type="icon-quanping" class="ml-5 cursor-pointer hover:text-indigo text-base"
                      @click="maxCallContent"/>
          <template v-if="isInCallMain">
            <template v-if="isConnected">
              <a-iconfont type="icon-tianjialianxiren" class="ml-5 cursor-pointer hover:text-indigo text-base"
                          @click="showInviteModal"/>
              <a-badge :numberStyle="{backgroundColor: 'white', boxShadow : 'none'}"
                       class="shadow-none"
                       :dot="hasNewMessage">
                <a-iconfont type="icon-liaotian" class="ml-5 cursor-pointer hover:text-indigo text-base"
                            @click="openDrawer('TabChatting')"/>
              </a-badge>
            </template>
            <a-iconfont type="icon-kongzhi" class="ml-5 cursor-pointer hover:text-indigo text-base"
                        @click="openDrawer('TabSetting')"/>
          </template>
        </div>
      </div>
      <div v-if="isConnected" class="flex flex-grow flex-col items-center justify-center">
        <a-iconfont type="icon-huiyishi" class="display-icon"/>
        <span class="display-name mt-5">音频会议</span>
      </div>
      <div v-else class="call-content flex flex-grow flex-col items-center justify-center">
        <a-avatar :size="160" class="target-avatar border-8">
          <span class="target-name">{{userName}}</span>
        </a-avatar>
        <span class="text-white text-2xl leading-loose mt-5">{{callText}}</span>
      </div>
      <div class="flex flex-shrink">
        <call-controls/>
      </div>
      <call-inviting-modal ref="invitingModal"/>
    </div>
  </a-layout>
</template>

<script>
import screenfull from 'screenfull';
import CallControls from './CallControls.vue';
import { CALL } from '../../router/constants';
import CallInvitingModal from './CallInvitingModal.vue';

export default {
  name       : 'CallContent',
  components : {
    CallControls,
    CallInvitingModal,
  },
  sketch : [
    {
      ns    : 'call.sketch',
      props : [ 'isInCallMain', 'currentTab' ],
    },
    {
      ns    : 'call.chat',
      props : [ 'hasNewMessage' ],
    },
  ],
  computed : {
    isConnecting() {
      return this.$rtc.call.connecting;
    },
    isConnected() {
      return this.$rtc.call.connected;
    },

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
  methods : {
    showInviteModal() {
      this.$refs.invitingModal.visible = true;
    },
    openDrawer(tab) {
      if (this.hasNewMessage && tab === 'TabChatting') {
        this.hasNewMessage = false;
      }
      this.currentTab = tab;
      this.isInCallMain = false;
    },
    maxCallContent() {
      screenfull.toggle(document.getElementById('layout-call-content'));
    },
  },
  watch : {
    displayName(cur, once) {
      this.targetUser = cur || once;
    },
    isInCallMain : {
      handler(val) {
        if (val) {
          this.$router.push({ path: CALL.CALL_MAIN });
        }
        else {
          this.$router.push({ path: CALL.CALL_DRAWER });
        }
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
  #call-content{
    .call-content-header {
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
    .display-icon {
      opacity: 0.4;
      color: white;
      font-size: 84px;
    }
    .display-name {
      opacity: 0.4;
      font-size: 24px;
      color: #FFFFFF;
      text-align: center;
      line-height: 24px;
    }
  }
</style>
