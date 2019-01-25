<template>
  <a-modal
      id="plain-modal"
      :visible="visible"
      wrapClassName="plain-modal-wrapper"
      centered
      :closable="false"
      :width="240"
      @cancel="handleCancel">
    <div class="flex items-center" slot="title">
      <a-icon v-if="showIcon" class="text-base" :type="modalType.icon"/>
      <span class="ml-2">
        {{title}}
      </span>
    </div>
    <div class="flex justify-around" slot="footer">
      <a-button v-if="!hideOk"
                class="w-1/2 mx-2 border-green-dark text-green-dark rounded-sm"
                ghost
                @click="handleOk">
        确认
      </a-button>
      <a-button v-if="!hideCancel"
                class="w-1/2 mx-2 border-grey-dark text-grey-dark rounded-sm"
                ghost
                @click="handleCancel">取消</a-button>
    </div>
    <div v-if="content" class="text-center">{{content}}</div>
    <slot name="content"></slot>
  </a-modal>
</template>

<script>
export default {
  name  : 'PlainModal',
  props : {
    type : {
      type    : String,
      default : 'info', // info success error warning none
    },
    title : {
      type    : String,
      default : '提示',
    },
    content : {
      type    : String,
      default : '',
    },
    hideOk : {
      type    : Boolean,
      default : false,
    },
    hideCancel : {
      type    : Boolean,
      default : false,
    },
  },
  data() {
    return {
      visible : false,
    };
  },
  computed : {
    showIcon() {
      return this.type !== 'none';
    },
    modalType() {
      const typeMap = {
        info : {
          class : {
            'anticon-info-circle' : true,
          },
          icon : 'info-circle',
        },
        success : {
          class : {
            'anticon-check-circle' : true,
          },
          icon : 'check-circle',
        },
        error : {
          class : {
            'anticon-close-circle' : true,
          },
          icon : 'close-circle',
        },
        warning : {
          class : {
            'anticon-exclamation-circle' : true,
          },
          icon : 'exclamation-circle',
        },
      };

      return typeMap[this.type];
    },
  },
  methods : {
    handleOk() {
      this.$emit('ok');
    },
    handleCancel() {
      this.visible = false;
    },
  },
};
</script>

<style lang="less">
.plain-modal-wrapper{
  .ant-modal-content {
    border-radius: 1px;
    .ant-modal-header {
      padding: 8px 20px;
    }
    .ant-modal-body{
      padding: 16px 12px;
    }
    .ant-modal-footer{
      border-top: none;
    }
  }
  .anticon-info-circle {
    color: #1890ff;
  }
  .anticon-check-circle {
    color: #52c41a;
  }
  .anticon-close-circle {
    color: #f5222d;
  }
  .anticon-exclamation-circle {
    color: #faad14;
  }
}
</style>
