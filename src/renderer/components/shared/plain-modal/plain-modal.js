import './plain-modal.less';

const plainModal = {
  name  : 'plain-modal',
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
    maskClosable : {
      type    : Boolean,
      default : true,
    },
    destroyOnClose : {
      type    : Boolean,
      default : true,
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
      this.$emit('cancel');
    },
    genTitle() {
      const h = this.$createElement;
      const children = [];

      if (this.showIcon) {
        children.push(h('a-icon', {
          staticClass : 'text-base',
          props       : {
            type : this.modalType.icon,
          },
        }));
      }
      children.push(h('span', {
        staticClass : 'ml-2',
      }, this.title));

      return children;
    },
    genFooter() {
      const h = this.$createElement;
      const children = [];

      if (!this.hideOk) {
        children.push(h('a-button', {
          staticClass : 'w-1/2 mx-2 border-green-dark text-green-dark rounded-sm',
          props       : {
            ghost : true,
          },
          on : {
            click : this.handleOk,
          },
        }, '确认'));
      }
      if (!this.hideCancel) {
        children.push(h('a-button', {
          staticClass : 'w-1/2 mx-2 border-grey-dark text-grey-dark rounded-sm',
          props       : {
            ghost : true,
          },
          on : {
            click : this.handleCancel,
          },
        }, '取消'));
      }

      return children;
    },
  },
  render(h) {
    const children = [];
    const titleSlot = h('div', {
      staticClass : 'flex items-center',
      slot        : 'title',
    }, this.genTitle());

    const footerSlot = h('div', {
      staticClass : 'flex justify-around',
      slot        : 'footer',
    }, this.genFooter());

    const content = this.content ? h('div', { staticClass: 'text-center' }, this.content) : '';

    children.push(titleSlot);
    children.push(footerSlot);
    if (content) children.push(content);
    children.push(this.$slots.content);

    return h('a-modal', {
      attrs : {
        id : 'plain-modal',
      },
      props : {
        wrapClassName  : 'plain-modal-wrapper',
        centered       : true,
        closable       : false,
        width          : 240,
        visible        : this.visible,
        maskClosable   : this.maskClosable,
        destroyOnClose : this.destroyOnClose,
      },
      on : {
        cancel : this.handleCancel,
      },
    }, children);
  },
};

export default plainModal;