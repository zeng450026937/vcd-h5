<template>
  <div></div>
</template>

<script>
export default {
  name     : 'ConferenceNotice',
  computed : {
    noticeTextList() {
      return this.$model.conference.noticeTextList;
    },
  },
  mounted() {
    this.$nextTick(() => {
      // this.$message.info('当前网络状况不佳，建议切换为音频通话。');
    });
  },
  watch : {
    noticeTextList(val) {
      if (val && val.length) this.$message.info(val[val.length - 1]);
    },
  },
};
</script>

<style scoped>

</style>
