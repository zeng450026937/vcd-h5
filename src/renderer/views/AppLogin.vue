<template>
  <a-layout id="app-login" class="bg-transparent h-full">
    <router-view/>
  </a-layout>
</template>

<script>
export default {
  name       : 'AppLogin',
  components : {
  },
  computed : {

  },
  created() {
    this.$router.push('/login/yms');
  },
  watch : {

  },
};
</script>

<style scoped>

</style>
