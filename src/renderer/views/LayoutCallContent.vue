<template>
  <a-layout id="layout-conference-content" class="bg-transparent h-full">
    <div class="flex h-full">
      <router-view/>
    </div>
  </a-layout>
</template>

<script>
export default {
  name       : 'LayoutCallContent',
  components : {
  },
};
</script>

<style scoped>

</style>
