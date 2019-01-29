<template>
  <a-layout id="tab-chatting-message-content" class="h-full bg-white">
    <div class="flex flex-col overflow-y-auto pb-10">
      <template v-for="(message, index) in messageRecordList">
        <div :key="index">
          <div class="flex flex-col p-3">
            <div class="flex itemx-center text-xs leading-tight select-none">
              <span class="text-indigo">{{message.from}}</span>
              <span style="margin: 0 6px">@</span>
              <span class="text-indigo">{{message.to}}</span>
              <div class="flex flex-grow"></div>
              <span class="text-black-lightest">{{message.date}}</span>
            </div>
            <div style="margin-top: 6px;" class="bg-grey-light px-2 py-1">
              <div class="leading-normal">{{message.content}}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </a-layout>
</template>

<script>

const messageRecordList = [
  {
    from    : '张三',
    to      : '所有人',
    content : '你有时看云，有时看我，我觉得，你看云时很远，看我时很近。',
    date    : '三天前',
  },
  {
    from    : '李四',
    to      : '王五',
    content : '我知道永逝将临，并不悲伤，下面是海，远看像森林，而我是在这中间的，走过的人说树枝低了，走过的人说树枝在长',
    date    : '16：00',
  },
  {
    from    : '枫城',
    to      : '简',
    content : '小巷，又深又长，我拿着把旧钥匙，敲着厚厚的墙',
    date    : '18：24',
  },
  {
    from    : '枫城',
    to      : '简',
    content : '小巷，又深又长，我拿着把旧钥匙，敲着厚厚的墙',
    date    : '18：24',
  },
  {
    from    : '枫城',
    to      : '简',
    content : '小巷，又深又长，我拿着把旧钥匙，敲着厚厚的墙',
    date    : '18：24',
  },
  {
    from    : '枫城',
    to      : '简',
    content : '小巷，又深又长，我拿着把旧钥匙，敲着厚厚的墙',
    date    : '18：24',
  },
];

export default {
  name : 'TabChattingMessageContent',
  data() {
    return {
      messageRecordList,
    };
  },
};
</script>

<style scoped>

</style>
