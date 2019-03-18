import Vuem from 'vuem';
import { loadConfig, saveConfig, nextTick } from './utils';
import modelList from './models';

const root = new Vuem();

modelList.forEach((item) => {
  root.mount(item.name, item.model);
});

root.provide({
  data() {
    return {
        
    };
  },
  created() {
    nextTick(() => {
      loadConfig(this);
    });
  },
  methods : {
    save(modelName) {
      saveConfig(this, modelName);
    },
  },
});

export default root;
