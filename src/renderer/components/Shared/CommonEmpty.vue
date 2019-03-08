<template>
  <div id="common-empty" class="flex flex-col items-center select-none">
    <img src="./static/empty.svg" alt="">
    <span>{{text}}</span>
  </div>
</template>

<script>
export default {
  name  : 'CommonEmpty',
  props : {
    text : {
      type    : String,
      default : '404 当前页面不见啦...',
    },
  },
};
</script>

<style scoped>

</style>
