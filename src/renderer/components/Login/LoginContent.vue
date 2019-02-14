<template>
  <a-layout id="login-content" class="bg-transparent h-full">
    <router-view/>
  </a-layout>
</template>

<script>
export default {
  name : 'LoginContent',
  mounted() {
    // this.$router.push('/login/loginContent/ymsLogin');
  },
};
</script>

<style scoped>

</style>
