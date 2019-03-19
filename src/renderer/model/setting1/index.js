import Vuem from '../vuem';
import { loadConfig, saveConfig, nextTick } from './utils';
import modelList from './models';

const root = new Vuem();

modelList.forEach((item) => {
  root.mount(item.name, item.model);
});

root.provide({
  created() {
    nextTick(() => {
      loadConfig(this);
      this.$broadcast('setting', this);
    });
  },
  methods : {
    save(modelName) {
      saveConfig(this, modelName);
      this.$broadcast('setting', this);
    },
  },
});

export default root;
