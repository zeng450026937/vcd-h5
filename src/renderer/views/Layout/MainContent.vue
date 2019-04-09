<template>
  <div class="main-layout-content flex flex-grow">
    <router-view/>
  </div>
</template>

<script>
export default {
  name : 'MainContact',
};
</script>
<style lang="less">
  .main-layout-content {
    min-width: 816px;
  }
</style>
