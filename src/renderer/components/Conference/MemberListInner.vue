<template>
  <a-collapse id="member-list-inner" :bordered="false" v-model="activeKey">
    <a-collapse-panel v-for="(l, i) in list" :key="String(i)" :showArrow="false" >

      <div class="flex items-center" slot="header">
        <span class="flex flex-grow">{{l.title}}</span>
        <a-iconfont type="icon-right" class="anticon anticon-right"/>
      </div>

      <template v-for="item in l.list">
        <member-list-item :item="item" :key="item.entity"/>
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
  data() {
    return {
      activeKey : [],
    };
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'filterText' ],
  },
  computed : {
    isCollapseOpen() {
      return !!this.filterText;
    },
  },
  mounted() {
    this.openAllCollapse(); // 默认打开全部的 collapse
  },
  methods : {
    openAllCollapse(val = true) {
      if (val && this.activeKey.length < this.list.length) {
        this.activeKey.length = 0;
        for (let i = 0; i < this.list.length; i++) {
          this.activeKey.push(String(i));
        }
      }
    },
  },
  watch : {
    isCollapseOpen : {
      handler   : 'openAllCollapse',
      immediate : true,
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
