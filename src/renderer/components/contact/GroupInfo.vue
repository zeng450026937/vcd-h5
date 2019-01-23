<template>
  <a-layout class="justify-center items-center bg-white">
    <div v-if="group" class="flex flex-col items-center">
      <div class="text-xl">{{group.company}}</div>
      <div class="text-base mt-4 text-center">{{group.group}}</div>
      <div class="text-base mt-4">{{group.amount | amountFilter}}</div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name  : 'GroupInfo',
  props : {
    group : {
      type : Object,
      default() {
        return {
          company : '厦门亿联网络技术股份有限公司',
          group   : '企业联系人',
          amount  : 1000,
        };
      },
    },
  },
  filters : {
    amountFilter(amount) {
      return amount || amount === 0 ? `- ${amount} -` : '';
    },
  },
};
</script>

<style scoped>

</style>
