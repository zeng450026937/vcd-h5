import PropTypes from 'ant-design-vue/es/_util/vue-types';
import classNames from 'classnames';
import warning from 'warning';
import { hasProp, initDefaultProps, getOptionProps, getSlots } from 'ant-design-vue/es/_util/props-util';
import { cloneElement } from 'ant-design-vue/es/_util/vnode';
import BaseMixin from 'ant-design-vue/es/_util/BaseMixin';
import proxyComponent from 'ant-design-vue/es/_util/proxyComponent';
import VirtualList from 'vue-virtual-scroll-list';

import {
  convertTreeToEntities,
  convertDataToTree,
  internalProcessProps,
  getPosition,
  parseCheckedKeys,
  conductExpandParent,
  calcSelectedKeys,
  arrAdd,
  arrDel,
  mapChildren,
  conductCheck,
  warnOnlyTreeNode,
} from './util';
import TreeNode from './TreeNode';

/**
 * Thought we still use `cloneElement` to pass `key`,
 * other props can pass with context for future refactor.
 */

function getWatch(keys = []) {
  const watch = {};

  keys.forEach((k) => {
    watch[k] = function() {
      this.needSyncKeys[k] = true;
    };
  });
  
  return watch;
}

const Tree = {
  name   : 'Tree',
  mixins : [ BaseMixin ],
  props  : initDefaultProps(
    {
      prefixCls           : PropTypes.string,
      tabIndex            : PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
      children            : PropTypes.any,
      treeData            : PropTypes.array, // Generate treeNode by children
      showLine            : PropTypes.bool,
      showIcon            : PropTypes.bool,
      icon                : PropTypes.oneOfType([ PropTypes.object, PropTypes.func ]),
      focusable           : PropTypes.bool,
      selectable          : PropTypes.bool,
      disabled            : PropTypes.bool,
      multiple            : PropTypes.bool,
      checkable           : PropTypes.oneOfType([ PropTypes.object, PropTypes.bool ]),
      checkStrictly       : PropTypes.bool,
      defaultExpandParent : PropTypes.bool,
      autoExpandParent    : PropTypes.bool,
      defaultExpandAll    : PropTypes.bool,
      defaultExpandedKeys : PropTypes.array,
      expandedKeys        : PropTypes.array,
      defaultCheckedKeys  : PropTypes.array,
      checkedKeys         : PropTypes.oneOfType([ PropTypes.array, PropTypes.object ]),
      defaultSelectedKeys : PropTypes.array,
      selectedKeys        : PropTypes.array,
      // onClick: PropTypes.func,
      // onDoubleClick: PropTypes.func,
      // onExpand: PropTypes.func,
      // onCheck: PropTypes.func,
      // onSelect: PropTypes.func,
      loadData            : PropTypes.func,
      loadedKeys          : PropTypes.array,
      filterTreeNode      : PropTypes.func,
      openTransitionName  : PropTypes.string,
      openAnimation       : PropTypes.oneOfType([ PropTypes.string, PropTypes.object ]),
      switcherIcon        : PropTypes.any,
      _propsSymbol        : PropTypes.any,
    },
    {
      prefixCls           : 'rc-tree',
      showLine            : false,
      showIcon            : true,
      selectable          : true,
      multiple            : false,
      checkable           : false,
      disabled            : false,
      checkStrictly       : false,
      defaultExpandParent : true,
      autoExpandParent    : false,
      defaultExpandAll    : false,
      defaultExpandedKeys : [],
      defaultCheckedKeys  : [],
      defaultSelectedKeys : [],
    }
  ),

  data() {
    warning(this.$props.__propsSymbol__, 'must pass __propsSymbol__');
    warning(this.$props.children, 'please children prop replace slots.default');
    this.needSyncKeys = {};
    const state = {
      _posEntities     : new Map(),
      _keyEntities     : new Map(),
      _expandedKeys    : [],
      _selectedKeys    : [],
      _checkedKeys     : [],
      _halfCheckedKeys : [],
      _loadedKeys      : [],
      _loadingKeys     : [],
      _treeNode        : [],
      _treeList        : [],
      _prevProps       : null,
      _dropPosition    : null,
    };
    
    return {
      ...state,
      ...this.getDerivedStateFromProps(getOptionProps(this), state),
    };
  },
  provide() {
    return {
      vcTree : this,
    };
  },

  watch : {
    ...getWatch([
      'treeData',
      'children',
      'expandedKeys',
      'autoExpandParent',
      'selectedKeys',
      'checkedKeys',
      'loadedKeys',
    ]),
    __propsSymbol__() {
      this.setState(this.getDerivedStateFromProps(getOptionProps(this), this.$data));
      this.needSyncKeys = {};
    },
  },

  methods : {
    getDerivedStateFromProps(props, prevState) {
      const { _prevProps } = prevState;
      const newState = {
        _prevProps : { ...props },
      };
      const self = this;

      function needSync(name) {
        return (!_prevProps && name in props) || (_prevProps && self.needSyncKeys[name]);
      }

      // ================== Tree Node ==================
      let treeNode = null;

      // Check if `treeData` or `children` changed and save into the state.
      if (needSync('treeData')) {
        treeNode = convertDataToTree(this.$createElement, props.treeData);
      }
      else if (needSync('children')) {
        treeNode = props.children;
      }
      // Tree support filter function which will break the tree structure in the vdm.
      // We cache the treeNodes in state so that we can return the treeNode in event trigger.
      if (treeNode) {
        newState._treeNode = treeNode;

        // Calculate the entities data for quick match
        const entitiesMap = convertTreeToEntities(treeNode);

        newState._posEntities = entitiesMap.posEntities;
        newState._keyEntities = entitiesMap.keyEntities;
      }

      const keyEntities = newState._keyEntities || prevState._keyEntities;

      // ================ expandedKeys =================
      if (needSync('expandedKeys') || (_prevProps && needSync('autoExpandParent'))) {
        newState._expandedKeys = props.autoExpandParent || (!_prevProps && props.defaultExpandParent)
          ? conductExpandParent(props.expandedKeys, keyEntities)
          : props.expandedKeys;
      }
      else if (!_prevProps && props.defaultExpandAll) {
        newState._expandedKeys = [ ...keyEntities.keys() ];
      }
      else if (!_prevProps && props.defaultExpandedKeys) {
        newState._expandedKeys = props.autoExpandParent || props.defaultExpandParent
          ? conductExpandParent(props.defaultExpandedKeys, keyEntities)
          : props.defaultExpandedKeys;
      }

      // ================ selectedKeys =================
      if (props.selectable) {
        if (needSync('selectedKeys')) {
          newState._selectedKeys = calcSelectedKeys(props.selectedKeys, props);
        }
        else if (!_prevProps && props.defaultSelectedKeys) {
          newState._selectedKeys = calcSelectedKeys(props.defaultSelectedKeys, props);
        }
      }

      // ================= checkedKeys =================
      if (props.checkable) {
        let checkedKeyEntity;

        if (needSync('checkedKeys')) {
          checkedKeyEntity = parseCheckedKeys(props.checkedKeys) || {};
        }
        else if (!_prevProps && props.defaultCheckedKeys) {
          checkedKeyEntity = parseCheckedKeys(props.defaultCheckedKeys) || {};
        }
        else if (treeNode) {
          // If treeNode changed, we also need check it
          checkedKeyEntity = {
            checkedKeys     : prevState._checkedKeys,
            halfCheckedKeys : prevState._halfCheckedKeys,
          };
        }

        if (checkedKeyEntity) {
          let { checkedKeys = [], halfCheckedKeys = [] } = checkedKeyEntity;

          if (!props.checkStrictly) {
            const conductKeys = conductCheck(checkedKeys, true, keyEntities);

            checkedKeys = conductKeys.checkedKeys;
            halfCheckedKeys = conductKeys.halfCheckedKeys;
          }

          newState._checkedKeys = checkedKeys;
          newState._halfCheckedKeys = halfCheckedKeys;
        }
      }
      // ================= loadedKeys ==================
      if (needSync('loadedKeys')) {
        newState._loadedKeys = props.loadedKeys;
      }

      return newState;
    },
    onNodeClick(e, treeNode) {
      this.__emit('click', e, treeNode);
    },

    onNodeDoubleClick(e, treeNode) {
      this.__emit('doubleclick', e, treeNode);
    },

    onNodeSelect(e, treeNode) {
      let { _selectedKeys: selectedKeys } = this.$data;
      const { _keyEntities: keyEntities } = this.$data;
      const { multiple } = this.$props;
      const { selected, eventKey } = getOptionProps(treeNode);
      const targetSelected = !selected;
      // Update selected keys

      if (!targetSelected) {
        selectedKeys = arrDel(selectedKeys, eventKey);
      }
      else if (!multiple) {
        selectedKeys = [ eventKey ];
      }
      else {
        selectedKeys = arrAdd(selectedKeys, eventKey);
      }

      // [Legacy] Not found related usage in doc or upper libs
      const selectedNodes = selectedKeys
        .map((key) => {
          const entity = keyEntities.get(key);

          if (!entity) return null;

          return entity.node;
        })
        .filter((node) => node);

      this.setUncontrolledState({ _selectedKeys: selectedKeys });

      const eventObj = {
        event       : 'select',
        selected    : targetSelected,
        node        : treeNode,
        selectedNodes,
        nativeEvent : e,
      };

      this.__emit('update:selectedKeys', selectedKeys);
      this.__emit('select', selectedKeys, eventObj);
    },
    onNodeCheck(e, treeNode, checked) {
      const {
        _keyEntities: keyEntities,
        _checkedKeys: oriCheckedKeys,
        _halfCheckedKeys: oriHalfCheckedKeys,
      } = this.$data;
      const { checkStrictly } = this.$props;
      const { eventKey } = getOptionProps(treeNode);

      // Prepare trigger arguments
      let checkedObj;
      const eventObj = {
        event       : 'check',
        node        : treeNode,
        checked,
        nativeEvent : e,
      };

      if (checkStrictly) {
        const checkedKeys = checked
          ? arrAdd(oriCheckedKeys, eventKey)
          : arrDel(oriCheckedKeys, eventKey);
        const halfCheckedKeys = arrDel(oriHalfCheckedKeys, eventKey);

        checkedObj = { checked: checkedKeys, halfChecked: halfCheckedKeys };

        eventObj.checkedNodes = checkedKeys
          .map((key) => keyEntities.get(key))
          .filter((entity) => entity)
          .map((entity) => entity.node);

        this.setUncontrolledState({ _checkedKeys: checkedKeys });
      }
      else {
        const { checkedKeys, halfCheckedKeys } = conductCheck([ eventKey ], checked, keyEntities, {
          checkedKeys     : oriCheckedKeys,
          halfCheckedKeys : oriHalfCheckedKeys,
        });

        checkedObj = checkedKeys;

        // [Legacy] This is used for `rc-tree-select`
        eventObj.checkedNodes = [];
        eventObj.checkedNodesPositions = [];
        eventObj.halfCheckedKeys = halfCheckedKeys;

        checkedKeys.forEach((key) => {
          const entity = keyEntities.get(key);

          if (!entity) return;

          const { node, pos } = entity;

          eventObj.checkedNodes.push(node);
          eventObj.checkedNodesPositions.push({ node, pos });
        });

        this.setUncontrolledState({
          _checkedKeys     : checkedKeys,
          _halfCheckedKeys : halfCheckedKeys,
        });
      }
      this.__emit('check', checkedObj, eventObj);
    },
    onNodeLoad(treeNode) {
      return new Promise((resolve) => {
        // We need to get the latest state of loading/loaded keys
        this.setState(({ _loadedKeys: loadedKeys = [], _loadingKeys: loadingKeys = [] }) => {
          const { loadData } = this.$props;
          const { eventKey } = getOptionProps(treeNode);

          if (
            !loadData
            || loadedKeys.indexOf(eventKey) !== -1
            || loadingKeys.indexOf(eventKey) !== -1
          ) {
            return {};
          }

          // Process load data
          const promise = loadData(treeNode);

          promise.then(() => {
            const newLoadedKeys = arrAdd(this.$data._loadedKeys, eventKey);
            const newLoadingKeys = arrDel(this.$data._loadingKeys, eventKey);

            // onLoad should trigger before internal setState to avoid `loadData` trigger twice.
            // https://github.com/ant-design/ant-design/issues/12464
            const eventObj = {
              event : 'load',
              node  : treeNode,
            };

            this.__emit('load', newLoadedKeys, eventObj);
            this.setUncontrolledState({
              _loadedKeys : newLoadedKeys,
            });
            this.setState({
              _loadingKeys : newLoadingKeys,
            });
            resolve();
          });

          return {
            _loadingKeys : arrAdd(loadingKeys, eventKey),
          };
        });
      });
    },

    onNodeExpand(e, treeNode) { // 传入 事件 和 当前节点
      let { _expandedKeys: expandedKeys } = this.$data;
      const { loadData } = this.$props;
      const { eventKey, expanded } = getOptionProps(treeNode);

      // Update selected keys
      const index = expandedKeys.indexOf(eventKey);
      const targetExpanded = !expanded;

      warning(
        (expanded && index !== -1) || (!expanded && index === -1),
        'Expand state not sync with index check'
      );

      if (targetExpanded) { // 展开 渲染当前节点下的子节点
        expandedKeys = arrAdd(expandedKeys, eventKey);
      }
      else { // 关闭
        expandedKeys = arrDel(expandedKeys, eventKey);
      }

      this.setUncontrolledState({ _expandedKeys: expandedKeys });
      this.__emit('expand', expandedKeys, {
        node        : treeNode,
        expanded    : targetExpanded,
        nativeEvent : e,
      });
      this.__emit('update:expandedKeys', expandedKeys);

      // Async Load data
      if (targetExpanded && loadData) {
        const loadPromise = this.onNodeLoad(treeNode);
        
        return loadPromise
          ? loadPromise.then(() => {
            // [Legacy] Refresh logic
            this.setUncontrolledState({ _expandedKeys: expandedKeys });
          })
          : null;
      }

      return null;
    },

    onNodeMouseEnter(event, node) {
      this.__emit('mouseenter', { event, node });
    },

    onNodeMouseLeave(event, node) {
      this.__emit('mouseleave', { event, node });
    },

    onNodeContextMenu(event, node) {
      event.preventDefault();
      this.__emit('rightClick', { event, node });
    },

    /**
     * Only update the value which is not in props
     */
    setUncontrolledState(state) {
      let needSync = false;
      const newState = {};
      const props = getOptionProps(this);

      Object.keys(state).forEach((name) => {
        if (name.replace('_', '') in props) return;
        needSync = true;
        newState[name] = state[name];
      });

      if (needSync) {
        this.setState(newState);
      }
    },

    isKeyChecked(key) {
      const { _checkedKeys: checkedKeys = [] } = this.$data;
      
      return checkedKeys.indexOf(key) !== -1;
    },

    /**
     * [Legacy] Original logic use `key` as tracking clue.
     * We have to use `cloneElement` to pass `key`.
     */
    renderTreeNode(child, index, level = 0) {
      const {
        _keyEntities: keyEntities,
        _expandedKeys: expandedKeys = [],
        _selectedKeys: selectedKeys = [],
        _halfCheckedKeys: halfCheckedKeys = [],
        _loadedKeys: loadedKeys = [],
        _loadingKeys: loadingKeys = [],
        _dropPosition: dropPosition,
      } = this.$data;
      const pos = getPosition(level, index);

      let key = child.key;

      if (!key && (key === undefined || key === null)) {
        key = pos;
      }
      if (!keyEntities.get(key)) {
        warnOnlyTreeNode();

        return null;
      }

      const nodes = [];

      nodes.push(cloneElement(child, {
        props : {
          eventKey    : key,
          expanded    : expandedKeys.indexOf(key) !== -1,
          selected    : selectedKeys.indexOf(key) !== -1,
          loaded      : loadedKeys.indexOf(key) !== -1,
          loading     : loadingKeys.indexOf(key) !== -1,
          checked     : this.isKeyChecked(key),
          halfChecked : halfCheckedKeys.indexOf(key) !== -1,
          level       : child.componentOptions.propsData.dataRef.level(),
          pos,
        },
        key,
      }));

      const { componentOptions } = child;

      if (expandedKeys.indexOf(key) !== -1 && componentOptions.children && componentOptions.children.length > 0) {
        componentOptions.children.forEach((node, i) => {
          if (expandedKeys.indexOf(key) !== -1
            && node.componentOptions.children
            && node.componentOptions.children.length > 0) {
            nodes.push(this.renderTreeNode(node, i));
          }
          else {
            nodes.push(cloneElement(node, {
              props : {
                eventKey    : node.key,
                expanded    : expandedKeys.indexOf(node.key) !== -1,
                selected    : selectedKeys.indexOf(node.key) !== -1,
                loaded      : loadedKeys.indexOf(node.key) !== -1,
                loading     : loadingKeys.indexOf(node.key) !== -1,
                checked     : this.isKeyChecked(node.key),
                halfChecked : halfCheckedKeys.indexOf(node.key) !== -1,
                level       : node.componentOptions.propsData.dataRef.level(),
                pos,
              },
              key : node.key,
            }));
          }
          // }
        });
      }

      return nodes;
    },
  },

  render() {
    const { _treeNode: treeNode } = this.$data;
    const { prefixCls } = this.$props;

    window.treeNode = treeNode;

    return (
      <div>
        <VirtualList
          className={classNames(prefixCls, {
            [`${prefixCls}-root`] : true,
          })}
          size={38}
          remain={12}
        >
          {mapChildren(treeNode, (node, index) => this.renderTreeNode(node, index))}
        </VirtualList>
      </div>
    );
  },
};

export { Tree };

export default proxyComponent(Tree);
