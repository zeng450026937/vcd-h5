<template>
  <div class="load-failed-content">
    <a-iconfont type="icon-guanyu" class="fail-icon"></a-iconfont>
    <div> {{$t('contact.tree.loadFailed')}}</div>
  </div>
</template>

<script>
export default {
  name : 'loadFailedPanel',
};
</script>

<style lang="less" scoped>
  .load-failed-content {
    width: 100%;
    text-align: center;
    margin-top: 100px;
    color: #4a577f;
    .fail-icon {
      font-size: 50px;
      margin-bottom: 10px;
    }
  }
</style>
