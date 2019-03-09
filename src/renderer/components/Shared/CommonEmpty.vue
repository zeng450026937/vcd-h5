<template>
  <div id="common-empty" class="flex flex-col items-center select-none">
    <img :src="imageUrl" alt="">
    <span class="empty-text">{{tip}}</span>
  </div>
</template>

<script>
/* eslint-disable import/no-dynamic-require,global-require */
export default {
  name  : 'CommonEmpty',
  props : {
    text : {
      type    : String,
      default : '',
    },
    image : {
      type    : String,
      default : 'empty-result',
    },
  },
  computed : {
    imageUrl() {
      return require(`./static/${this.image}.png`);
    },
    tip() {
      const NOTICE_MAP = {
        'empty-calendar' : '暂无日程信息',
        'empty-record'   : '暂无通话记录',
        'empty-contact'  : '暂无联系人信息',
        'empty-result'   : '暂无搜索结果',
      };
      
      return this.text || NOTICE_MAP[this.image];
    },
  },
};
</script>

<style scoped lang="less">
#common-empty {
  .empty-text {
    margin-top: 13px;
    font-size: 14px;
    color: #777777;
    text-align: center;
    line-height: 22px;
  }
}
</style>
