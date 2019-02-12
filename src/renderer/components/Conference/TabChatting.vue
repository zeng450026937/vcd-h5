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
              <a-select defaultValue="lucy" v-model="message.to" class="w-full ml-2">
                <a-select-option value="Jack">Jack</a-select-option>
                <a-select-option value="Lucy">Lucy</a-select-option>
                <a-select-option value="张三">张三</a-select-option>
                <a-select-option value="Yiminghe">yiminghe</a-select-option>
              </a-select>
            </div>
          </div>
          <div class="flex mt-2 h-full">
            <div class="w-5/6 mr-2">
              <a-textarea v-model="message.content" placeholder="请输入您将要发送的消息" class="h-full"/>
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
import { cloneDeep } from 'lodash';
import TabChattingMessageContent from './TabChattingMessageContent.vue';

export default {
  name       : 'TabChatting',
  components : {
    TabChattingMessageContent,
  },
  data() {
    return {
      message : {
        from    : '我',
        to      : 'Lucy',
        content : '',
        date    : '今天',
      },
    };
  },
  methods : {
    sendMessage() {
      this.$model.chat.messageRecordList.push(cloneDeep(this.message));
    },
  },
};
</script>

<style scoped>

</style>
