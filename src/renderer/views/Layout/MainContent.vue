<template>
  <div class="flex h-full main-layout-content bg-white flex-grow">
    <router-view/>
  </div>
</template>

<script>


export default {
  name : 'MainContact',
  data() {
    return {
      hideNav : false,
    };
  },
  computed : {

  },
  mounted() {
  },
  methods : {
  },
};
</script>
<style lang="less">
  .main-layout-content {
    min-width: 816px;
  }
</style>
