import Vue from 'vue';
import '@/renderer/stylus/antd.less';
import '@/renderer/stylus/tailwind.less';
import Antd, { Icon } from 'ant-design-vue';

const AIconFont = Icon.createFromIconfontCN({
  scriptUrl : '//at.alicdn.com/t/font_1011898_3snln87b1f9.js', // 在 iconfont.cn 上生成
});
// Example: -> <a-iconfont slot="prefix" type="icon-bendilianxiren"/>

Vue.use(Antd);
Vue.component(AIconFont.name, AIconFont); // AIconFont.name => a-iconfont
// import {
//   Button, Layout, Icon, Tooltip,
//   Dropdown, Avatar, Spin, AutoComplete, Input,
//   Menu, Popover, Badge, Tabs,
//   List, Tag, Row, Col, Card, DatePicker,
//   Radio, Table, Divider, Breadcrumb,
//   Form, Select, Popconfirm, Modal,
// } from 'ant-design-vue';
//
// const { Content, Header, Footer, Sider } = Layout;
// const MenuItem = Menu.Item;
// const MenuDivider = Menu.Divider;
// const MenuSubMenu = Menu.SubMenu;
// const TabsTabPane = Tabs.TabPane;
// const ListItem = List.Item;
// const ListItemMeta = List.Item.Meta;
// const { RangePicker } = DatePicker;
// const RadioGroup = Radio.Group;
// const RadioButton = Radio.Button;
// const CardGrid = Card.Grid;
// const CardMeta = Card.Meta;
// const BreadcrumbItem = Breadcrumb.Item;
// const FormItem = Form.Item;
//
// const components = [ Button, Button.Group, Layout, Icon,
//   Tooltip, Dropdown, Avatar, Spin, AutoComplete, Input,
//   Menu, MenuItem, MenuDivider, Popover, Badge, Tabs, TabsTabPane, List,
//   ListItem, ListItemMeta, Tag, Tag.CheckableTag, MenuSubMenu, Row, Col,
//   Card, CardGrid, CardMeta, DatePicker, RangePicker, Radio, RadioGroup,
//   RadioButton, Table, Divider, Breadcrumb, BreadcrumbItem, Form,
//   FormItem, Select, Select.Option, Popconfirm, Modal, Content, Header, Footer, Sider ];
//
// components.forEach((c) => {
//   Vue.component(c.name, c);
// });
