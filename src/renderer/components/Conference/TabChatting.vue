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
              <span class="whitespace-no-wrap text-xs leading-tight">发给</span>
              <a-select v-model="target" class="w-full ml-2" :disabled="isOnHold">
                <a-select-option v-for="(user, index) in targetList"
                                 :value="user.entity"
                                 :key="index">{{user.displayText}}</a-select-option>
              </a-select>
            </div>
          </div>
          <div class="flex mt-2 h-full">
            <div class="w-5/6 mr-2">
              <a-textarea v-model="message"
                          :placeholder="isOnHold ? '暂无发消息的权限' : '请输入您将要发送的消息'"
                          :read-only="isOnHold"
                          @keydown.enter.prevent=""
                          @keyup.enter.prevent = 'sendMessage'
                          class="h-full"/>
            </div>
            <div class="w-1/6 bg-grey-light">
              <a-button type="primary"
                        class="w-full h-full p-0 text-xs"
                        :class="{'bg-disabled': isSendingDisabled}"
                        :disabled="isSendingDisabled || !message || isOnHold"
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
import TabChattingMessageContent from './TabChattingMessageContent.vue';

export default {
  name       : 'TabChatting',
  components : {
    TabChattingMessageContent,
  },
  data() {
    return {
      message           : '',
      target            : 'all',
      isSendingDisabled : false,
      timeout           : 3,
      sendingTimer      : null,
    };
  },
  computed : {
    userList() {
      return this.$model.conference.member.userList.filter((user) => !user.isCurrentUser());
    },
    targetList() {
      return [
        {
          entity      : 'all',
          displayText : '全体',
        },
        ...this.userList,
      ];
    },
    isOnHold() {
      return this.$model.conference.currentUser.isOnHold();
    },
  },
  methods : {
    sendMessage(e) {
      if (this.isSendingDisabled || !this.message || this.isOnHold) return;
      this.$model.conference.chat.sendMessage('我', this.target, this.message, 'send');
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
