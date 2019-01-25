import Vue from 'vue';
import PlainModal from '../components/shared/plain-modal';

import Popup from './lib';

Vue.use(Popup);
const popup = new Popup({
  popups : {
    loadingModal : {
      tag        : 'plain-modal',
      components : [
        PlainModal,
      ],
      date : {
        ref   : 'loadingModal',
        props : {
          hideOk         : true,
          maskClosable   : false,
          destroyOnClose : true,
        },
      },
      children : [
        {
          tag  : 'div',
          date : {
            staticClass : 'flex flex-col items-center select-none',
            slot        : 'content',
          },
          children : [
            {
              tag : 'a-spin',
            },
            {
              tag      : 'span',
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
      date : {
        ref   : 'ensureModal',
        props : {
          maskClosable   : false,
          destroyOnClose : true,
        },
      },
      children : [
        {
          tag  : 'div',
          date : {
            staticClass : 'flex flex-col items-center select-none',
            slot        : 'content',
          },
          children : [
            {
              tag      : 'span',
              children : 'content',
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
