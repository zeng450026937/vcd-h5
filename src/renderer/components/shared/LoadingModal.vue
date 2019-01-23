<template>
  <a-modal
      v-model="visible"
      title="Title"
      onOk="handleOk"
  >
  </a-modal>
</template>

<script>
export default {
  name : 'LoadingModal',
  data() {
    return {
      visible : false,
    };
  },
};
</script>

<style scoped>

</style>
