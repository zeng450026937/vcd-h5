<template>
  <a-layout id="app-main">
    <router-view/>
  </a-layout>
</template>

<script>
export default {
  name : 'AppMain',
  mounted() {
    this.$router.push('/main/contact');
  },
};
</script>

<style scoped>

</style>
