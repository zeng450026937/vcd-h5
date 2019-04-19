<template>
  <a-layout class="justify-center items-center bg-white p-10">
    <div v-if="group" class="flex flex-col items-center" style="word-break: break-all">
      <div class="text-xl">{{group.company}}</div>
      <div class="text-base mt-4 text-center">{{group.group}}</div>
      <div v-if="loadMode!=='SPLIT'" class="text-base mt-4">-{{group.amount}} 人-</div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name  : 'ContactGroupInfo',
  props : {
    group : {
      type : Object,
      default() {
        return {
          company : 0,
          group   : '企业联系人',
          amount  : 0,
        };
      },
    },
  },
  computed : {
    loadMode() {
      return this.$model.contact.loadMode;
    },
  },
  filters : {
    amountFilter(amount) {
      return amount || amount === 0 ? `- ${amount} -` : '';
    },
  },
};
</script>
