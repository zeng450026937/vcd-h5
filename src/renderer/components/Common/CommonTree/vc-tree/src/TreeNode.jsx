import PropTypes from 'ant-design-vue/es/_util/vue-types';
import classNames from 'classnames';
import { initDefaultProps, filterEmpty, getComponentFromProp } from 'ant-design-vue/es/_util/props-util';
import BaseMixin from 'ant-design-vue/es/_util/BaseMixin';
import getTransitionProps from 'ant-design-vue/es/_util/getTransitionProps';
import { cloneElement } from 'ant-design-vue/es/_util/vnode';
import { getNodeChildren, mapChildren, warnOnlyTreeNode } from './util';

function noop() {}
const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';

const defaultTitle = '---';

const TreeNode = {
  name            : 'TreeNode',
  mixins          : [ BaseMixin ],
  __ANT_TREE_NODE : true,
  props           : initDefaultProps(
    {
      eventKey  : PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]), // Pass by parent `cloneElement`
      prefixCls : PropTypes.string,
      // className: PropTypes.string,
      root      : PropTypes.object,
      // onSelect: PropTypes.func,

      // By parent
      expanded    : PropTypes.bool,
      selected    : PropTypes.bool,
      checked     : PropTypes.bool,
      loaded      : PropTypes.bool,
      loading     : PropTypes.bool,
      halfChecked : PropTypes.bool,
      title       : PropTypes.any,
      pos         : PropTypes.string,

      // By user
      isLeaf          : PropTypes.bool,
      selectable      : PropTypes.bool,
      disabled        : PropTypes.bool,
      disableCheckbox : PropTypes.bool,
      icon            : PropTypes.any,
      dataRef         : PropTypes.object,
      switcherIcon    : PropTypes.any,

      label : PropTypes.any,
      value : PropTypes.any,
      level : PropTypes.any,
    },
    {},
  ),
  inject : {
    vcTree     : { default: () => ({}) },
    vcTreeNode : { default: () => ({}) },
  },
  provide() {
    return {
      vcTreeNode : this,
    };
  },

  // Isomorphic needn't load data in server side
  mounted() {
    this.syncLoadData(this.$props);
  },
  updated() {
    this.syncLoadData(this.$props);
  },

  methods : {
    onSelectorClick(e) {
      // Click trigger before select/check operation
      const {
        vcTree: { onNodeClick },
      } = this;

      onNodeClick(e, this);
      if (this.isSelectable()) {
        this.onSelect(e);
      }
      else {
        this.onCheck(e);
      }
    },

    onSelectorDoubleClick(e) {
      const {
        vcTree: { onNodeDoubleClick },
      } = this;

      onNodeDoubleClick(e, this);
    },

    onSelect(e) {
      if (this.isDisabled()) return;

      const {
        vcTree: { onNodeSelect },
      } = this;

      e.preventDefault();
      onNodeSelect(e, this);
    },

    onCheck(e) {
      if (this.isDisabled()) return;

      const { disableCheckbox, checked } = this;
      const {
        vcTree: { checkable, onNodeCheck },
      } = this;

      if (!checkable || disableCheckbox) return;

      e.preventDefault();
      const targetChecked = !checked;

      onNodeCheck(e, this, targetChecked);
    },

    onMouseEnter(e) {
      const {
        vcTree: { onNodeMouseEnter },
      } = this;

      onNodeMouseEnter(e, this);
    },

    onMouseLeave(e) {
      const {
        vcTree: { onNodeMouseLeave },
      } = this;

      onNodeMouseLeave(e, this);
    },

    onContextMenu(e) {
      const {
        vcTree: { onNodeContextMenu },
      } = this;

      onNodeContextMenu(e, this);
    },

    // Disabled item still can be switch
    onExpand(e) { // this.getSelfItems()
      const {
        vcTree: { onNodeExpand },
      } = this;

      onNodeExpand(e, this);
    },

    getNodeChildren() {
      const {
        $slots: { default: children },
      } = this;
      const originList = filterEmpty(children);
      const targetList = getNodeChildren(originList);

      if (originList.length !== targetList.length) {
        warnOnlyTreeNode();
      }

      return targetList;
    },

    getNodeState() {
      const { expanded } = this;

      if (this.isLeaf2()) {
        return null;
      }

      return expanded ? ICON_OPEN : ICON_CLOSE;
    },

    isLeaf2() {
      const { isLeaf, loaded } = this;
      const {
        vcTree: { loadData },
      } = this;

      const hasChildren = this.getNodeChildren().length !== 0;

      if (isLeaf === false) {
        return false;
      }

      return isLeaf || (!loadData && !hasChildren) || (loadData && loaded && !hasChildren);
    },

    isDisabled() {
      const { disabled } = this;
      const {
        vcTree: { disabled: treeDisabled },
      } = this;

      // Follow the logic of Selectable
      if (disabled === false) {
        return false;
      }

      return Boolean(treeDisabled || disabled);
    },

    isSelectable() {
      const { selectable } = this;
      const {
        vcTree: { selectable: treeSelectable },
      } = this;

      // Ignore when selectable is undefined or null
      if (typeof selectable === 'boolean') {
        return selectable;
      }

      return treeSelectable;
    },

    // Load data to avoid default expanded tree without data
    syncLoadData(props) {
      const { expanded, loading, loaded } = props;
      const {
        vcTree: { loadData, onNodeLoad },
      } = this;

      if (loading) return;
      // read from state to avoid loadData at same time
      if (loadData && expanded && !this.isLeaf2()) {
        // We needn't reload data when has children in sync logic
        // It's only needed in node expanded
        const hasChildren = this.getNodeChildren().length !== 0;

        if (!hasChildren && !loaded) {
          onNodeLoad(this);
        }
      }
    },

    // Switcher
    renderSwitcher() {
      const { expanded } = this;
      const {
        vcTree: { prefixCls },
      } = this;
      const switcherIcon = getComponentFromProp(this, 'switcherIcon', {}, false)
        || getComponentFromProp(this.vcTree, 'switcherIcon', {}, false);

      if (this.isLeaf2()) {
        return (
          <span
            key="switcher"
            class={classNames(`${prefixCls}-switcher`, `${prefixCls}-switcher-noop`)}
          >
            {typeof switcherIcon === 'function'
              ? cloneElement(switcherIcon({ ...this.$props, isLeaf: true }))
              : switcherIcon}
          </span>
        );
      }

      const switcherCls = classNames(
        `${prefixCls}-switcher`,
        `${prefixCls}-switcher_${expanded ? ICON_OPEN : ICON_CLOSE}`,
      );

      return (
        <span key="switcher" onClick={this.onExpand} class={switcherCls}>
          {typeof switcherIcon === 'function'
            ? cloneElement(switcherIcon({ ...this.$props, isLeaf: false }))
            : switcherIcon}
        </span>
      );
    },

    // Checkbox
    renderCheckbox() {
      const { checked, halfChecked, disableCheckbox } = this;
      const {
        vcTree: { prefixCls, checkable },
      } = this;
      const disabled = this.isDisabled();

      if (!checkable) return null;

      // [Legacy] Custom element should be separate with `checkable` in future
      const $custom = typeof checkable !== 'boolean' ? checkable : null;

      return (
        <span
          key="checkbox"
          class={classNames(
            `${prefixCls}-checkbox`,
            checked && `${prefixCls}-checkbox-checked`,
            !checked && halfChecked && `${prefixCls}-checkbox-indeterminate`,
            (disabled || disableCheckbox) && `${prefixCls}-checkbox-disabled`,
          )}
          onClick={this.onCheck}
        >
          {$custom}
        </span>
      );
    },

    renderIcon() {
      const { loading } = this;
      const {
        vcTree: { prefixCls },
      } = this;

      return (
        <span
          key="icon"
          class={classNames(
            `${prefixCls}-iconEle`,
            `${prefixCls}-icon__${this.getNodeState() || 'docu'}`,
            loading && `${prefixCls}-icon_loading`,
          )}
        />
      );
    },

    // Icon + Title
    renderSelector(h) {
      h = h || this.$createElement;

      const { selected, icon, loading } = this;
      const {
        vcTree: { prefixCls, showIcon, icon: treeIcon, loadData },
      } = this;
      const disabled = this.isDisabled();
      const title = getComponentFromProp(this, 'title') || defaultTitle;
      const wrapClass = `${prefixCls}-node-content-wrapper`;

      // Icon - Still show loading icon when loading without showIcon
      let $icon;

      if (showIcon) {
        const currentIcon = icon || treeIcon;

        $icon = currentIcon ? (
          <span class={classNames(`${prefixCls}-iconEle`, `${prefixCls}-icon__customize`)}>
            {typeof currentIcon === 'function' ? currentIcon({ ...this.$props }, h) : currentIcon}
          </span>
        ) : (
          this.renderIcon()
        );
      }
      else if (loadData && loading) {
        $icon = this.renderIcon();
      }

      // Title
      const $title = <span class={`${prefixCls}-title`}>{title}</span>;

      return (
        <span
          key="selector"
          ref="selectHandle"
          title={typeof title === 'string' ? title : ''}
          class={classNames(
            `${wrapClass}`,
            `${wrapClass}-${this.getNodeState() || 'normal'}`,
            !disabled && (selected) && `${prefixCls}-node-selected`,
          )}
          aria-grabbed={(!disabled) || undefined}
          onMouseenter={this.onMouseEnter}
          onMouseleave={this.onMouseLeave}
          onContextmenu={this.onContextMenu}
          onClick={this.onSelectorClick}
          onDoubleclick={this.onSelectorDoubleClick}
        >
          {$icon}
          {$title}
        </span>
      );
    },

    // Children list wrapped with `Animation`
    renderChildren() {
      const childrens = [];
      const { expanded, pos } = this;
      const {
        vcTree: { prefixCls, openTransitionName, openAnimation },
      } = this;

      let animProps = {};

      if (openTransitionName) {
        animProps = getTransitionProps(openTransitionName);
      }
      else if (typeof openAnimation === 'object') {
        animProps = { ...openAnimation };
        animProps.props = { css: false, ...animProps.props };
      }

      // Children TreeNode
      const nodeList = this.getNodeChildren();

      if (nodeList.length === 0) {
        return null;
      }

      if (expanded) {
        childrens.push(...nodeList);
      }

      return {
        childrens,
        pos,
      };
    },

    getSelfItems() {
      const selfItems = [];

      const { childrens, pos } = this.renderChildren() || {};
      const { vcTree: { renderTreeNode } } = this;

      let nodes = mapChildren(childrens, (node, index) => renderTreeNode(node, index, pos));

      if (!Array.isArray(nodes)) {
        nodes = [ nodes ];
      }
      if (nodes.length > 0) selfItems.push(nodes);

      return selfItems;
    },
  },


  render(h) {
    const {
      isLeaf,
      expanded,
      selected,
      checked,
      halfChecked,
      loading,
    } = this.$props;
    const {
      vcTree: { prefixCls, filterTreeNode },
    } = this;
    const disabled = this.isDisabled();

    return (
      <div
        class={classNames(prefixCls, {
          [`${prefixCls}-items`] : true,
        })}
        style={{
          'margin-left' : `${26 * ((this.level || this.dataRef.level()) - 2)}px`,
        }}>
        <li
          class={{
            [`${prefixCls}-treenode-disabled`]                                : disabled,
            [`${prefixCls}-treenode-switcher-${expanded ? 'open' : 'close'}`] : !isLeaf,
            [`${prefixCls}-treenode-checkbox-checked`]                        : checked,
            [`${prefixCls}-treenode-checkbox-indeterminate`]                  : halfChecked,
            [`${prefixCls}-treenode-selected`]                                : selected,
            [`${prefixCls}-treenode-loading`]                                 : loading,
            'filter-node'                                                     : filterTreeNode && filterTreeNode(this),
          }}
          role="treeitem"
        >
          {this.renderSwitcher()}
          {this.renderCheckbox()}
          {this.renderSelector(h)}
        </li>

      </div>
    );
  },
};

TreeNode.isTreeNode = 1;

export default TreeNode;
