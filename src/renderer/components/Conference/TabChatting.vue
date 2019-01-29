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
              <a-select defaultValue="lucy" class="w-full ml-2">
                <a-select-option value="jack">Jack</a-select-option>
                <a-select-option value="lucy">Lucy</a-select-option>
                <a-select-option value="disabled">张三</a-select-option>
                <a-select-option value="Yiminghe">yiminghe</a-select-option>
              </a-select>
            </div>
          </div>
          <div class="flex mt-2 h-full">
            <div class="w-5/6 mr-2">
              <a-textarea placeholder="请输入您将要发送的消息" class="h-full"/>
            </div>
            <div class="w-1/6 bg-grey-light">
              <a-button type="primary" class="w-full h-full p-0 text-xs">发送</a-button>
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
};
</script>

<style scoped>

</style>
