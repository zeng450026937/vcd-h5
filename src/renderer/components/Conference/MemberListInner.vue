<template>
  <a-collapse id="member-list-inner" :bordered="false" >
    <a-collapse-panel v-for="(l, i) in list" :key="i" :showArrow="false" >

      <div class="flex items-center" slot="header">
        <span class="flex flex-grow">{{l.title}}</span>
        <a-iconfont type="icon-right" class="anticon anticon-right"/>
      </div>

      <template v-for="item in l.list">
        <member-list-item :item="item" :key="item.uid"/>
      </template>
    </a-collapse-panel>
  </a-collapse>
</template>

<script>
import MemberListItem from './MemberListItem.vue';

export default {
  name       : 'MemberListInner',
  components : {
    MemberListItem,
  },
  props : {
    list : {
      type : Array,
      default() {
        return [];
      },
    },
  },
};
</script>

<style lang="less">
  #member-list-inner {
    .ant-collapse-item {
      border-bottom: none;

      .ant-collapse-header {
        padding: 3px 16px 3px 16px;
        background: #F7F8FC;
        font-size: 12px;
        color: #666666;
        line-height: 20px;
      }
    }
  }
</style>
