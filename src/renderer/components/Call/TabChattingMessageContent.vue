<template>
  <a-layout id="tab-chatting-message-content" class="h-full bg-white">
    <div class="flex flex-col-reverse overflow-y-auto pb-10">
      <template v-for="(message, index) in messageRecordList">
        <div :key="index">
          <div class="flex flex-col px-3 pt-3">
            <div class="flex items-center text-xs leading-tight select-none">
              <span :class="{'text-indigo': message.type === 'receive'}">{{message.from}}</span>
              <span style="margin: 0 6px">@</span>
              <span :class="{'text-indigo': !message.isPrivate || message.type === 'send'}">{{message.to}}</span>
              <div class="flex flex-grow"></div>
              <span class="text-black6">{{message.date}}</span>
            </div>
            <div style="margin-top: 6px;word-break: break-all;"
                 class="rounded-sm px-2 py-1"
                 :class="{[`bg-chat-${message.type === 'receive' ? 'others': 'mine'}`] : true}">
              <div class="leading-normal whitespace-pre-wrap">{{message.content}}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </a-layout>
</template>

<script>
import { cloneDeep } from 'lodash';

export default {
  name : 'TabChattingMessageContent',
  data() {
    return {
      message : {
        from    : this.$t('conversation.chat.me'),
        to      : this.$t('conversation.chat.stranger'),
        content : '',
        date    : '18：24',
      },
    };
  },
  computed : {
    messageRecordList() {
      return cloneDeep(this.$model.call.chat.messageRecordList).reverse();
    },
  },
};
</script>
