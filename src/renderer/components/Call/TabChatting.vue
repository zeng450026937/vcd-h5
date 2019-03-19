<template>
  <a-layout id="tab-chatting" class="h-full bg-white">
    <div class="flex flex-col h-full">
      <div class="display-message-content" style="height: 75%">
        <tab-chatting-message-content/>
      </div>
      <div class="send-message-content border-t" style="height: 25%">
        <div class="h-full p-3 flex flex-col">
          <div>
            <div class="flex items-center">
              <span class="whitespace-no-wrap text-xs leading-tight">发给
                <span class="text-indigo">{{displayName}}</span>
              </span>
            </div>
          </div>
          <div class="flex mt-2 h-full">
            <div class="w-5/6 mr-2">
              <a-textarea v-model="message" placeholder="请输入您将要发送的消息" class="h-full"/>
            </div>
            <div class="w-1/6 bg-under-painting">
              <a-button type="primary"
                        class="w-full h-full p-0 text-xs"
                        :class="{'bg-disabled': isSendingDisabled}"
                        :disabled="isSendingDisabled || !message"
                        @click="sendMessage">
                <span v-if="isSendingDisabled" class="text-base text-white">{{timeout}}</span>
                <a-iconfont v-else type="icon-fasong" class="text-base"/>
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import 'moment/locale/zh-cn';
import TabChattingMessageContent from './TabChattingMessageContent.vue';

export default {
  name       : 'TabChatting',
  components : {
    TabChattingMessageContent,
  },
  data() {
    return {
      message           : '',
      isSendingDisabled : false,
      timeout           : 3,
      sendingTimer      : null,
    };
  },
  computed : {
    displayName() {
      const remoteIdentity = this.$model.state.callStatus !== 'disconnected'
        ? this.$rtc.call.remoteIdentity
        || this.$rtc.call.incoming[0].remoteIdentity : null;

      return remoteIdentity && (remoteIdentity.display_name
        || remoteIdentity.uri.user);
    },
  },
  methods : {
    sendMessage() {
      this.$model.call.chat.sendMessage('我', this.displayName, this.message, 'send');
      this.message = '';
      this.isSendingDisabled = true;
      this.sendingTimer = setInterval(() => {
        this.timeout--;
        if (this.timeout === 0) {
          clearInterval(this.sendingTimer);
          this.timeout = 3;
          this.isSendingDisabled = false;
        }
      }, 1000);
    },
  },
};
</script>
