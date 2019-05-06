<template>
  <a-collapse accordion
              :bordered="false" :showArrow=false
              :class="{'selected-group': isSelected}"
              id="member-list-wrapper"
              v-model="activeGroupKey">
    <a-collapse-panel :showArrow="false"  :key="mkey">
      <div class="panel-item-content flex items-center w-full"
           slot="header" @click="collapseChanged">
        <a-iconfont type="icon-right2" class="wrapper-direction anticon anticon-right"/>
          <span class="flex ml-2 flex-grow">
            <a-badge class="leading-tight" :dot="showDot">
              <span>{{title}}</span>
            </a-badge>
          </span>
        <slot name="operation"/>
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
      type     : String,
      required : true,
    },
    mkey : {
      type    : [ String, Number ],
      default : Date.now(),
    },
    isSelected : {
      type    : Boolean,
      default : false,
    },
    showDot : {
      type    : Boolean,
      default : false,
    },
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'activeGroupKey' ],
  },
  methods : {
    collapseChanged() {
      this.$emit('selected', this.mkey);
    },
  },
};
</script>

<style lang="less">
#member-list-wrapper {
  border-radius: unset;
  border-bottom: 1px solid #E0E0E0;
  .ant-collapse-item {
    border-bottom: none;
    .ant-collapse-header {
      padding: 0;
      .panel-item-content {
        padding: 9px 16px 9px 16px;
      }
      .arrow {
        line-height: 40px;
      }
    }
  }

  .wrapper-direction {
    color: #999;
  }
}

.selected-group {
  > .ant-collapse-item {

    > .ant-collapse-header {
      background-color: #4A5FC4;
      color: white !important;

      .wrapper-direction {
        color: white !important;
      }
    }
  }
}
</style>
