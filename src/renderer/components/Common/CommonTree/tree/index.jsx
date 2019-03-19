import Tree from './Tree';

Tree.TreeNode.name = 'ATreeNode';
/* istanbul ignore next */
Tree.install = function(Vue) {
  Vue.component(Tree.name, Tree);
  Vue.component(Tree.TreeNode.name, Tree.TreeNode);
};

export default Tree;
