<template>
  <a-collapse :bordered="false" :showArrow=false id="member-list-wrapper">
    <a-collapse-panel :showArrow="false"  :key="mkey">
      <div class="flex items-center" slot="header">
        <a-iconfont type="icon-right2" class="wrapper-direction anticon anticon-right"/>
        <span class="flex ml-2">{{title}}</span>
      </div>
      <slot name="items"/>
    </a-collapse-panel>
  </a-collapse>
</template>

<script>
export default {
  name  : 'MemberListWrapper',
  props : {
    title : {
      type    : String,
      default : '已入会',
    },
    mkey : {
      type    : [ String, Number ],
      default : Date.now(),
    },
  },
};
</script>

<style lang="less">
#member-list-wrapper {
  .ant-collapse-item {
    border-bottom: none;
    .ant-collapse-header {
      padding: 9px 16px 9px 16px;
      .arrow {
        line-height: 40px;
      }
    }
  }
  .wrapper-direction {
    color: #999;
  }
}
</style>
