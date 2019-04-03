<template>
  <div id="search-result-scroll-area">
    <div ref="search-list" id="search-result-content" @click="handleClick">
      <div class="clusterize-no-data"></div>
    </div>
  </div>

</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import Clusterize from 'clusterize.js';

export default {
  name       : 'searchList',
  components : {
    RecycleScroller,
  },
  props : {
    maxChecked : {
      type : Number,
    },
  },
  data() {
    return {
      list           : [],
      defaultChecked : '',
    };
  },
  methods : {
    createRow(row) {
      return `
        <div class="search-result-row" node-id="${row.id}">
          <input ${row.checked ? 'checked' : ''} id="${row.id}" class="tree-checkbox" ${row.checked ? 'checked' : ''} type="checkbox"/>
          <label
              check-box
              node-id="${row.id}"
              class="tree-checkbox-label"
              for="${row.id}">
          </label>

          <div class="avatar" node-id="${row.id}">
            ${/^(.*)\\\\(.*\\\\)$/.test(row.name) ? RegExp.$1.substr(-2, 2) : row.name.substr(-2, 2)}
          </div>
          <div class="name-content" node-id="${row.id}">
            <span node-id="${row.id}" class="name">${row.name}</span>
            <span node-id="${row.id}" v-if="item.number" class="number">${row.number}</span>
          </div>
        </div>
      `;
    },
    createTemplates(data) {
      return data.map((i) => this.createRow(i));
    },
    createSearchList(data) {
      const cluster = new Clusterize({
        rows         : this.createTemplates(data),
        scrollId     : 'search-result-scroll-area',
        contentId    : 'search-result-content',
        no_data_text : '',
      });

      cluster._isVue = true;

      this.cluster = cluster;
    },
    updateSearchList(data) {
      if (this.cluster) this.cluster.update(this.createTemplates(data));
    },
    update(data) {
      data._isVue = true;

      data.forEach((n) => {
        n.size = 56;
      });

      if (this.cluster) {
        this.updateSearchList(data);
      }
      else {
        this.createSearchList(data);
      }
      this.$refs['search-list'].removeAttribute('tabindex');

      this.list = data;
    },
    clearChecked() {
      this.list.forEach((n) => {
        n.checked = false;
      });
      this.updateSearchList(this.list);
    },
    cancelChecked(id) {
      if (id === this.defaultChecked) return;

      const checkItem = this.list.find((n) => n.id === id);

      if (checkItem) {
        checkItem.checked = false;
        this.updateSearchList(this.list);
      }
    },

    handleClick(e) {
      e.preventDefault();

      const checkedItems = this.$parent.getChecked();

      if (this.maxChecked && checkedItems.length >= this.maxChecked) return;

      const id = e.target.getAttribute('node-id');

      const checkItem = this.list.find((n) => n.id === id);

      if (this.defaultChecked && id === this.defaultChecked.id && checkItem.checked) return;

      checkItem.checked = !checkItem.checked;
      this.updateSearchList(this.list);

      this.$emit('check', { id, checked: checkItem.checked });
    },
  },
};
</script>

<style lang="less" >
  #search-result-scroll-area {
    height: calc(100% - 40px);
    overflow-y: auto;

    .scroll-area {
      height: 100%;
    }
  }

  #search-result-content {

    .search-result-row {
      user-select: none;
      height: 56px;
      display: flex !important;
      align-items: center;
      padding: 0 10px;

      .tree-checkbox {
        &[type="checkbox"] {
          clip: rect(0, 0, 0, 0);
          display: none;
        }

        &[type="checkbox"]:checked + .tree-checkbox-label::before {
          content: '\2713';
          color: #fff;
          background: #4a5fc4;
          border-color: #4a5fc4;
          border-radius: 2px;
          text-align: center;
        }
      }

      .tree-checkbox-label {
        cursor: pointer;
        display: flex;
        align-items: center;
        line-height: 14px;
      }

      .tree-checkbox-label::before {
        content: '\a0';
        display: inline-block;
        border: 1px solid silver;
        width: 16px;
        height: 16px;
        font-weight: bold;
        background: #fff;
        border-radius: 2px;
      }
      .tree-checkbox-label:hover {
        &::before {
          border: 1px solid #4a5fc4;
        }
      }

      &:hover {
        background: #E1E5F2;

        .delete-btn {
          display: unset;
        }
      }

      .delete-btn {
        display: none;
      }

      .avatar {
        height: 32px;
        width: 32px;
        background: #55638C;
        border-radius: 50%;
        margin: 0 10px;
        color: #fff;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .name-content{
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        justify-content: center;
        width: 75%;
        overflow: hidden;

        .name{
          font-size: 14px;
          height: 20px;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 90%;
        }
        .number {
          font-size: 12px;
          color: #777777;
          height: 20px;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 90%;
        }
      }
    }
  }

</style>
