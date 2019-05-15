import Vue from 'vue';
import '@/renderer/stylus/antd.less';
import '@/renderer/stylus/tailwind.less';
import Antd, { Icon, Spin, message } from 'ant-design-vue';
import './iconfont';

const AIconFont = Icon.createFromIconfontCN({});

Spin.setDefaultIndicator({
  indicator : {
    render() {
      return <a-iconfont slot="indicator" type="icon-loading" style="font-size: 32px" spin />;
    },
  },
});

message.config({
  maxCount : 3,
});

Vue.use(Antd);
Vue.component(AIconFont.name, AIconFont);
