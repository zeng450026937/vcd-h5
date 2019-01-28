<template>
  <a-layout id="layout-login" class="h-full bg-transparent">
    <div class="flex flex-col h-full">
      <router-view name="header"/>
      <router-view/>
    </div>
  </a-layout>
</template>

<script>
export default {
  name : 'LayoutLogin',
};
</script>

<style scoped>

</style>
