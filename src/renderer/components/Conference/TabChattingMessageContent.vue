<template>
  <a-layout id="tab-chatting-message-content" class="h-full bg-white">
    <div class="flex flex-col-reverse overflow-y-auto pb-10">
      <template v-for="(message, index) in messageRecordList">
        <div :key="index">
          <div class="flex flex-col p-3">
            <div class="flex items-center text-xs leading-tight select-none">
              <span class="text-indigo">{{message.from}}</span>
              <span style="margin: 0 6px">@</span>
              <span class="text-indigo">{{message.to}}</span>
              <div class="flex flex-grow"></div>
              <span class="text-black-lightest">{{message.date}}</span>
            </div>
            <div style="margin-top: 6px;" class="rounded-sm bg-grey-light px-2 py-1">
              <div class="leading-normal">{{message.content}}</div>
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
        from    : '我',
        to      : '陌生人',
        content : '',
        date    : '18：24',
      },
    };
  },
  computed : {
    messageRecordList() {
      return cloneDeep(this.$model.chat.messageRecordList).reverse();
    },
  },
};
</script>

<style scoped>

</style>
