<template>
  <div class="transfer-content">
    <div class="tree-content">
      <search-bar ref="searchBar" @search="handleSearch"></search-bar>
      <tree
          :getChild="getChild"
          :loadMode="loadMode"
          @ready="handleReady"
          v-show="!showSearchResult"
          ref="tree"
          @change="handleChange"
          class="tree-list">
      </tree>
      <search-list @check="handleCheck" ref="searchList" v-show="showSearchResult"></search-list>
    </div>
    <div class="arrow">
      <a-iconfont type="icon-right" class="text-grey text-3xl cursor-pointer"></a-iconfont>
    </div>
    <div class="list-content">
      <checked-list
          :maxChecked="maxChecked"
          :defaultChecked="defaultChecked"
          @cancel-checked="handleCancelChecked"
          @clear="handleClear"
          ref="checkedList">
      </checked-list>
    </div>

  </div>
</template>

<script>
import CommonEmpty from '../Shared/CommonEmpty.vue';
import searchBar from './searchBar.vue';
import Tree from '../tree/index.vue';
import CheckedList from './checkedList.vue';
import SearchList from './searchList.vue';

const LOAD_MODE = {
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};


export default {
  name       : 'transfer',
  components : {
    searchBar,
    Tree,
    CommonEmpty,
    CheckedList,
    SearchList,
  },
  props : {
    maxChecked : {
      type : Number,
    },
    loadMode : {
      type    : String,
      default : LOAD_MODE.OVERALL,
    },
    getChild : {
      type : Function,
    },
    search : {
      type : Function,
    },
  },
  data() {
    return {
      showSearchResult : false,
      defaultChecked   : null,
    };
  },
  methods : {
    async handleSearch(val) {
      if (!val) {
        this.showSearchResult = false;
        this.$refs.searchList.update([]);

        return;
      }
      let result;

      if (this.loadMode === LOAD_MODE.SPLIT) {
        result = await this.search(val);
        this.correctChecked(result);
      }
      else {
        result = this.$refs.tree.search(val);
      }

      this.showSearchResult = true;
      this.$nextTick(() => {
        this.$refs.searchList.update(result);
      });
    },
    correctChecked(data) {
      data.forEach((n) => {
        const node = this.$refs.tree.getAsyncCheckedNode(n.id) || this.$refs.tree.getNode(n.id);

        if (node) n.checked = node.checked;
      });
    },
    handleChange(checked) {
      console.log('transfer:', checked);
      this.$refs.checkedList.update(checked);
      this.$emit('change', checked);
    },
    handleCheck({ id, checked }) {
      this.$refs.tree.check(id, checked);
    },
    handleReady() {
      this.$refs.checkedList.update(this.getChecked());
    },
    handleClear() {
      this.$refs.tree.clear();
      this.$refs.searchList.clearChecked();
    },
    handleCancelChecked(id) {
      this.$refs.tree.cancelChecked(id);
      this.$refs.searchList.cancelChecked(id);
    },
    getChecked() {
      return this.$refs.tree.getChecked();
    },
    setCheckedList(checkedList) {
      return this.$refs.tree.setCheckedList(checkedList).then((checked) => {
        this.$refs.checkedList.update(checked);
      });
    },
    reset() {
      this.showSearchResult = false;
      this.$refs.searchBar.text = '';
    },
    create({ data, defaultChecked }) {
      this.reset();
      this.defaultChecked = defaultChecked;
      this.$refs.tree.createTree({
        data,
        defaultChecked : defaultChecked ? defaultChecked.id : null,
        maxChecked     : this.maxChecked,
      });
      this.$refs.searchList.defaultChecked = defaultChecked;
    },
  },
};
</script>

<style lang="less" scoped>
  .transfer-content {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;

    .tree-content {
      width: 45%;
      height: 100%;
      border: 1px solid #ccc;
      background: #fff;
      .tree-list {
        height: calc( 100% - 40px ) !important;
      }
    }
    .arrow {
      width: 10%;
      text-align: center;
    }

    .list-content {
      width: 45%;
      height: 100%;
      background: #fff;
    }
  }

</style>
