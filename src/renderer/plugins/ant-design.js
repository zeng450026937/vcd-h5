import Vue from 'vue';
import '@/renderer/stylus/antd.less';
import '@/renderer/stylus/tailwind.less';
import Antd, { Icon, message } from 'ant-design-vue';
import iconfont from './iconfont';

const AIconFont = Icon.createFromIconfontCN({
  scriptUrl : iconfont, // 在 iconfont.cn 上生成
});

message.config({
  maxCount : 3,
});

Vue.use(Antd);
Vue.component(AIconFont.name, AIconFont);
