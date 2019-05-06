<template>
  <div id="common-empty" class="flex flex-col items-center select-none">
    <img :src="imageUrl" alt="">
    <span class="mt-3 text-black9 leading-tighter">{{tip}}</span>
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
        'empty-calendar' : this.$t('empty.calendar'),
        'empty-record'   : this.$t('empty.record'),
        'empty-contact'  : this.$t('empty.contact'),
        'empty-result'   : this.$t('empty.search'),
      };
      
      return this.text || NOTICE_MAP[this.image];
    },
  },
};
</script>
