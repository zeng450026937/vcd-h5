<template>
  <div id="p-tree" class="flex flex-col h-full">
    <div class="h-full overflow-y-auto">
      <p-tree
          checkable
          :treeData="treeData"
      />
    </div>
    <div class="flex flex-grow"></div>
    <a-divider class="my-0"/>
    <div class="h-12">
      <div class="flex justify-center items-center py-2 bg-white">
        <a-button large type="primary"
                  class="text-sm"
                  @click="printDate"
        >打印中间数据
        </a-button>
      </div>
    </div>
  </div>
</template>

<script>
import PTree from './tree';

export default {
  name       : 'tree',
  components : {
    PTree,
  },
  data() {
    return {
      originTree : {},
    };
  },
  computed : {
    treeData() {
      const { formattedPhoneBook } = this.$model.contact;

      return formattedPhoneBook && formattedPhoneBook.items;
    },
  },
  async mounted() {
    // this.originTree = new TreeStore(this.$rtc.contact.phonebook.list);
    // window.originTree = this.originTree;
  },
  watch : {
    checkedKeys(val) {
      console.log('onCheck', val);
    },
  },
  methods : {
    printDate() {
      //
    },
  },
};
</script>

<style scoped>

</style>
