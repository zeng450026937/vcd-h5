<template>
  <a-layout id="layout-main" class="h-full flex">
    <router-view name="sidebar"/>
    <router-view/>
  </a-layout>
</template>

<script>
export default {
  name : 'LayoutMain',
};
</script>

<style scoped>

</style>
