import path from 'path';

export default {
  name  : 'NoFound',
  props : {
    path : {
      type    : String,
      default : '',
    },
    text : {
      type    : String,
      default : '404 当前页面不见啦~',
    },
    size : {
      type    : Number,
      default : 100,
    },
  },
  computed : {
    iconPath() {
      return this.path || path.resolve(__public, 'icon/404.png');
    },
  },

  render(h) {
    const child = h('div', {
      staticClass : 'flex flex-col items-center',
    },
    [ h('a-avatar', {
      props : {
        size : this.size,
      },
      attrs : {
        src : this.iconPath,
      },
    }),
    h('span', {
      staticClass : 'mt-2',
    }, this.text) ]);

    return h('a-layout', {
      staticClass : 'flex-col text-grey justify-center items-center text-xs select-none h-full bg-white',
    }, [ child ]);
  },
};
