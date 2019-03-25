<template>
  <div class="transfer-content">
    <div class="tree-content">
      <search-bar @search="handleSearch"></search-bar>
      <tree
          :getChild="getChild"
          :loadMode="loadMode"
          @ready="handleReady"
          v-show="!showSearchResult"
          ref="tree"
          @change="handleChange"
          class="tree-list">
      </tree>
      <search-list ref="searchList" v-show="showSearchResult"></search-list>
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
  },
  data() {
    return {
      showSearchResult : false,
      defaultChecked   : null,
    };
  },
  methods : {
    handleSearch(val) {
      if (!val) {
        this.showSearchResult = false;
        this.$refs.searchList.update([]);

        return;
      }
      const result = this.$refs.tree.search(val);

      this.showSearchResult = true;
      this.$nextTick(() => {
        this.$refs.searchList.update(result);
      });
    },
    handleChange(checked) {
      console.log('transfer:', checked);
      this.$refs.checkedList.update(checked);
    },
    handleReady() {
      this.$refs.checkedList.update(this.getChecked());
    },
    handleClear() {
      this.$refs.tree.clear();
    },
    handleCancelChecked(id) {
      this.$refs.tree.cancelChecked(id);
    },
    getChecked() {
      return this.$refs.tree.getChecked();
    },
    setCheckers(ids) {
      return this.$refs.tree.setCheckers(ids).then((checkers) => {
        this.$refs.checkedList.update(checkers);
      });
    },
    create({ data, defaultChecked, maxChecked }) {
      this.defaultChecked = defaultChecked;
      this.$refs.tree.createTree({
        data,
        defaultChecked : defaultChecked ? defaultChecked.id : null,
        maxChecked,
      });
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