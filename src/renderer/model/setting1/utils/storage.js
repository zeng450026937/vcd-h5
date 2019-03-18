import storage from '../../../storage';

export default { 
  getStorage(tableName) {
    return storage.query(tableName);
  },
  setStorage(tableName, data) {
    storage.insert(tableName, data);
  },
};
