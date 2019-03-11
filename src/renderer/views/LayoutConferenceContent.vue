<template>
  <a-layout id="layout-conference-content" class="bg-transparent h-full">
    <div class="flex h-full">
      <conference-content/>
      <router-view/>
    </div>
  </a-layout>
</template>

<script>
import ConferenceContent from '../components/Conference/ConferenceContent.vue';

export default {
  name       : 'LayoutConferenceContent',
  components : {
    ConferenceContent,
  },
};
</script>
