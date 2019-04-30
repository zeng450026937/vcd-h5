import PropTypes from 'ant-design-vue/es/_util/vue-types';
import BaseMixin from 'ant-design-vue/es/_util/BaseMixin';
import { getOptionProps, hasProp, getEvents } from 'ant-design-vue/es/_util/props-util';
import { cloneElement } from 'ant-design-vue/es/_util/vnode';
import createChainedFunction from 'ant-design-vue/es/_util/createChainedFunction';
import moment from 'moment';
import { setTimeout } from 'timers';

function isMoment(value) { // 是否是 Moment 类型
  if (Array.isArray(value)) {
    return value.length === 0 || value.findIndex((val) => val === undefined || moment.isMoment(val)) !== -1;
  }
  else {
    return value === undefined || moment.isMoment(value);
  }
}
const MomentType = PropTypes.custom(isMoment);
const Picker = {
  props : {
    animation            : PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]),
    disabled             : PropTypes.bool,
    transitionName       : PropTypes.string,
    format               : PropTypes.string,
    children             : PropTypes.func,
    getCalendarContainer : PropTypes.func,
    calendar             : PropTypes.any,
    open                 : PropTypes.bool,
    defaultOpen          : PropTypes.bool.def(false),
    prefixCls            : PropTypes.string.def('rc-calendar-picker'),
    placement            : PropTypes.any.def('bottomLeft'),
    value                : PropTypes.oneOfType([ MomentType, PropTypes.arrayOf(MomentType) ]),
    defaultValue         : PropTypes.oneOfType([ MomentType, PropTypes.arrayOf(MomentType) ]),
    align                : PropTypes.object.def({}),
    dropdownClassName    : PropTypes.string,
  },
  mixins : [ BaseMixin ],

  data : function data() {
    const value = this.$props.value || this.$props.defaultValue;

    return {
      sValue : value,
    };
  },

  watch : {
    value(val) {
      this.setState({
        sValue : val,
      });
    },
  },
  updated() {
    Promise.resolve().then(this.focusCalendar);
  },
  methods : {
    onCalendarSelect : function onCalendarSelect(value) {
      if (!hasProp(this, 'value')) {
        this.setState({
          sValue : value,
        });
      }
      this.__emit('change', value);
    },

    getCalendarElement() {
      const props = this.$props;
      const calendarProps = getOptionProps(props.calendar);
      const calendarEvents = getEvents(props.calendar);
      const value = this.sValue;

      const extraProps = {
        ref   : 'calendarInstance',
        props : {
          defaultValue  : value || calendarProps.defaultValue,
          selectedValue : value,
        },
        on : {
          ok     : createChainedFunction(calendarEvents.ok, this.onCalendarOk),
          select : createChainedFunction(calendarEvents.select, this.onCalendarSelect),
          clear  : createChainedFunction(calendarEvents.clear, this.onCalendarClear),
        },
      };

      return cloneElement(props.calendar, extraProps);
    },
    focusCalendar() {
      if (this.calendarInstance && this.calendarInstance.componentInstance) {
        this.calendarInstance.componentInstance.focus();
      }
    },
    onToday() {
      this.$children[0].onToday();
    },
    setDate(date) {
      if (!date) return;
      this.$children[0].onSelect(isMoment(date) ? date : moment(date));
    },
  },

  render(h) {
    return h('div', {}, [ this.getCalendarElement() ]);
  },
};

export default Picker;
