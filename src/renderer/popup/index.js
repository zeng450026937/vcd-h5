import Vue from 'vue';
import PlainModal from './plain-modal';

import Popup from './lib';

Vue.use(Popup);

const popup = new Popup({
  popups : {
    loadingModal : {
      tag        : 'plain-modal',
      components : [
        PlainModal,
      ],
      data : {
        ref   : 'loadingModal',
        props : {
          hideTile       : true,
          hideOk         : true,
          maskClosable   : false,
          destroyOnClose : true,
        },
      },
      children : [
        {
          tag  : 'div',
          data : {
            staticClass : 'flex flex-col items-center select-none',
            slot        : 'content',
          },
          children : [
            {
              tag : 'a-spin',
            },
            {
              tag  : 'span',
              data : {
                staticClass : 'mt-2',
              },
              children : 'content',
            },
          ],
        },
      ],
      params : {
        content : '加载中...',
      },
    },
    ensureModal : {
      tag        : 'plain-modal',
      components : [
        PlainModal,
      ],
      data : {
        ref   : 'ensureModal',
        props : {
          hideTile       : true,
          maskClosable   : false,
          destroyOnClose : true,
        },
      },
      children : [
        {
          tag  : 'div',
          data : {
            staticClass : 'flex flex-col items-center select-none',
            slot        : 'content',
          },
          children : [
            {
              tag         : 'span',
              staticClass : 'mt-2',
              children    : 'content',
            },
          ],
        },
      ],
      params : {
        content : '确认开启会议',
      },
    },
  },
});

if (process.env.NODE_ENV === 'development') {
  window.popup = popup;
}
export default popup;
