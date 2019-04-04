<template>
  <a-layout id="layout-call-content" class="bg-transparent h-full">
    <div class="flex h-full">
      <call-content/>
      <router-view/>
    </div>
  </a-layout>
</template>

<script>
import CallContent from '../../components/Call/CallContent.vue';

export default {
  name       : 'LayoutCallContent',
  components : {
    CallContent,
  },
};
</script>
