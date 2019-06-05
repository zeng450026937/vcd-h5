<template>
  <div class="transfer-search-content">
    <a-input v-model="text"
             :placeholder="$t('contact.tree.search')"
             class="search-area rounded-none border-none">
      <div slot="suffix">
        <a-iconfont
            v-show="text"
            type="icon-guanbi"
            class="text-sm text-black9 text-base cursor-pointer mr-2 hover:text-red"
            @click="text = ''"></a-iconfont>
        <a-iconfont
            type="icon-sousuo"
            class="text-sm text-black9 text-base">
        </a-iconfont>
      </div>

    </a-input>
  </div>
</template>

<script>
export default {
  name : 'searchBar',
  data() {
    return {
      text : '',
    };
  },
  watch : {
    text(val) {
      this.$emit('search', val);
    },
  },
  methods : {
  },
};
</script>

<style lang="less">
.transfer-search-content {
  @apply h-8;
  .search-area{
    @apply h-full w-full;
    .ant-input {
      border: none !important;
      background: #F0F0F0;
    }
  }
}
</style>
