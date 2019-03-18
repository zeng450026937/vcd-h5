<template>
  <a-layout id="local-contact" class="h-full w-full">
    <div class="flex flex-col h-full">
      <div class="h-14 border-b">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>本地联系人</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <div class="flex h-full m-4 bg-white border">
        <div class="border-r w-2/5">
          <div class="h-full overflow-hidden">
            <Tree></Tree>
          </div>
        </div>


        <div class="flex flex-grow w-3/5 bg-white justify-center">

        </div>

      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import Tree from '../../tree/tree.vue';

export default {
  name       : 'LocalContact',
  components : {
    AppHeader,
    Tree,
  },
  data() {
    return {

    };
  },
  created() {

  },
  destroyed() {

  },
  computed : {

  },
  methods : {

  },
};
</script>
