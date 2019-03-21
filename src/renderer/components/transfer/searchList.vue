<template>
  <div class="search-result-content">
    <recycle-scroller
        :items="list"
        :buffer="20"
        :page-mode="false"
        key-field="id"
        class="scroll-area overflow-y-auto overflow-x-hidden"
    >
      <template v-slot="{item, index}">
        <div class="list-item">
          <!--<a-checkbox v-model="item.checked"></a-checkbox>-->
          <div class="avatar">
            {{/^(.*)\(.*\)$/.test(item.name) ? RegExp.$1.substr(-2, 2) : item.name.substr(-2, 2)}}
          </div>
          <div class="name-content">
            <span class="name">{{item.name}}</span>
            <span v-if="item.number" class="number">{{item.number}}</span>
          </div>
        </div>
      </template>
    </recycle-scroller>
  </div>

</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';

export default {
  name       : 'searchList',
  components : {
    RecycleScroller,
  },
  data() {
    return {
      list       : [],
    };
  },
  methods : {
    update(data) {
      data.forEach((n) => {
        n.size = 56;
      });
      data._isVue = true;
      this.list = data;
    },
    handleCheck(id) {
      debugger;
    },
  },
};
</script>

<style lang="less" scoped>
  .search-result-content {
    height: calc( 100% - 40px );
    overflow-y: auto;
    .scroll-area {
      height: 100%;
    }
  }
  .list-item{
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 10px;
  &:hover{
     background: #E1E5F2;
  .delete-btn {
    display: unset;
  }
  }
  .delete-btn {
    display: none;
  }
  .avatar{
    height: 32px;
    width: 32px;
    background: #55638C;
    border-radius: 50%;
    margin: 0 10px;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .name-content{
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
  .name{
    font-size: 14px;
    height: 20px;
    line-height: 20px;
  }
  .number {
    font-size: 12px;
    color: #777777;
    height: 20px;
    line-height: 20px;
  }
  }

  }
</style>
