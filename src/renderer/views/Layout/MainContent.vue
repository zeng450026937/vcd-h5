<template>
  <div class="h-full w-full">
    <div class="flex h-full w-full main-layout-contact">

      <div class="flex h-full bg-white w-full">
        <router-view/>
      </div>
    </div>
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
  .main-layout-contact {
    min-width: 816px;
  }
</style>
