/* eslint-disable import/no-extraneous-dependencies */
import { desktopCapturer } from 'electron';

export default {
  data() {
    return {
      // 先执行 getSources
      screenList      : [], // 屏幕列表
      applicationList : [], // 应用列表
    };
  },
  computed : {
    windowList() {
      return [...this.screenList, ...this.applicationList];
    }
    // windowList() {
    //   return [ {
    //     title : '屏幕分享',
    //     list  : [ ...this.screenList ],
    //   },
    //   {
    //     title : '应用分享',
    //     list  : [ ...this.applicationList ],
    //
    //   } ];
    // },
  },
  methods : {
    async getSources() {
      return new Promise((resolve, reject) => {
        desktopCapturer.getSources(
          {
            types         : [ 'window', 'screen' ],
            thumbnailSize : { width: 400, height: 400 },
          },
          (error, sources) => {
            if (error) {
              reject(error);
              throw error;
            }
      
            this.screenList = [];
            this.applicationList = [];
      
            sources.forEach((source) => {
              switch (true) {
                case /^screen/.test(source.id):
                  source.url = source.thumbnail.toDataURL();
                  this.screenList.push(source);
                  break;
                case /^window/.test(source.id):
                  source.url = source.thumbnail.toDataURL();
                  this.applicationList.push(source);
                  break;
                default:
                  break;
              }
            });
            resolve({
              screenList      : this.screenList,
              applicationList : this.applicationList });
          }
        );
      });
    },
  },
};