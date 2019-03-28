<template>
  <a-layout id="window" class="h-full bg-white">

  </a-layout>
</template>

<script>
export default {
  name     : 'notification',
  computed : {
    kom() {
      return (window.opener && window.opener.kom) || window.kom;
    },

  },
  mounted() {

  },
  methods : {
    checkStatus() {

    },
  },
};
</script>

<style lang="less">
</style>
