<template>
  <div></div>
</template>

<script>
export default {
  name : 'ConferenceNotice',
  mounted() {
    this.$nextTick(() => {
      this.$message.info('当前网络状况不佳，建议切换为音频通话。');
    });
  },
};
</script>

<style scoped>

</style>
