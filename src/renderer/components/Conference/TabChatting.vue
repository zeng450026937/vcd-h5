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
              <a-select v-model="target" class="w-full ml-2">
                <a-select-option v-for="(user, index) in targetList"
                                 :value="user.entity"
                                 :key="index">{{user.displayText}}</a-select-option>
              </a-select>
            </div>
          </div>
          <div class="flex mt-2 h-full">
            <div class="w-5/6 mr-2">
              <a-textarea v-model="message" placeholder="请输入您将要发送的消息" class="h-full"/>
            </div>
            <div class="w-1/6 bg-grey-light">
              <a-button type="primary" class="w-full h-full p-0 text-xs" @click="sendMessage">
                <a-iconfont type="icon-fasong" class="text-base"/>
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import moment from 'moment';
import 'moment/locale/zh-cn';
import TabChattingMessageContent from './TabChattingMessageContent.vue';

export default {
  name       : 'TabChatting',
  components : {
    TabChattingMessageContent,
  },
  data() {
    return {
      message : '',
      target  : 'all',
    };
  },
  computed : {
    userList() {
      return this.$model.conference.userList.filter((user) => !user.isCurrentUser());
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
  },
  methods : {
    async sendMessage() {
      const { conference } = this.$rtc.conference;

      if (!conference.isChatAvariable()) {
        await conference.connectChat();
      }
      const startTime = moment(new Date(), 'YYYYMMDD').format('HH:mm');
      const messageObject = {
        from    : this.$rtc.account.username,
        content : this.message,
        date    : startTime,
      };

      if (this.target === 'all') {
        conference.sendMessage(this.message);
        messageObject.to = '所有人';
      }
      else {
        const user = conference.users.getUser(this.target);

        conference.sendMessage(this.message, [ user.entity ]);
        messageObject.to = user.displayText;
      }

      this.$model.chat.messageRecordList.push(messageObject);
      this.message = '';
    },
  },
};
</script>

<style scoped>

</style>
