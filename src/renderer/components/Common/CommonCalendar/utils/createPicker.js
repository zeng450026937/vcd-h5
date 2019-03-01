/* eslint-disable import/no-extraneous-dependencies,no-shadow */
import * as moment from 'moment';
import omit from 'lodash/omit';
import classNames from 'classnames';
import MonthCalendar from 'ant-design-vue/es/vc-calendar/src/MonthCalendar';
import interopDefault from 'ant-design-vue/es/_util/interopDefault';
import BaseMixin from 'ant-design-vue/es/_util/BaseMixin';
import {
  hasProp,
  getOptionProps,
  initDefaultProps,
  mergeProps,
} from 'ant-design-vue/es/_util/props-util';
import VcCalendar from '../Calendar';

export default function createPicker(TheCalendar, props) {
  return {
    props : initDefaultProps(props, {
      prefixCls : 'ant-calendar',
      showToday : true,
    }),
    mixins : [ BaseMixin ],
    model  : {
      prop  : 'value',
      event : 'change',
    },
    data() {
      const value = this.value || this.defaultValue;

      if (value && !interopDefault(moment).isMoment(value)) {
        throw new Error('The value/defaultValue of DatePicker or MonthPicker must be a moment object');
      }

      return {
        sValue   : value,
        showDate : value,
      };
    },

    watch : {
      value : function value(val) {
        const state = {};

        state.sValue = val;
        if (val !== this.sValue) {
          state.showDate = val;
        }
        this.setState(state);
      },
    },
    methods : {
      handleChange(value) {
        if (!hasProp(this, 'value')) {
          this.setState({
            sValue   : value,
            showDate : value,
          });
        }
        this.$emit('change', value, (value && value.format(this.format)) || '');
      },
      handleCalendarChange(value) {
        this.setState({ showDate: value });
      },
      handleSelect(value) {
        this.$emit('select', {
          raw    : value,
          format : (value && value.format(this.format)) || '',
        });
      },
      onToday() {
        this.$refs.calendar.onToday();
      },
    },

    render(h) {
      const { $listeners, $scopedSlots } = this;
      const { sValue: value, showDate } = this.$data;

      const props = getOptionProps(this);
      const { prefixCls, locale, localeCode } = props;
      const dateRender = props.dateRender || $scopedSlots.dateRender;
      const monthCellContentRender = props.monthCellContentRender || $scopedSlots.monthCellContentRender;
      const placeholder = 'placeholder' in props ? props.placeholder : locale.lang.placeholder;

      const disabledTime = props.showTime ? props.disabledTime : null;

      const calendarClassName = classNames({
        [`${prefixCls}-time`]  : props.showTime,
        [`${prefixCls}-month`] : MonthCalendar === TheCalendar,
      });

      if (value && localeCode) {
        value.locale(localeCode);
      }

      const pickerProps = { props: {}, on: {} };
      const calendarProps = { props: {}, on: {} };
      const pickerStyle = {};

      if (props.showTime) {
        // fix https://github.com/ant-design/ant-design/issues/1902
        calendarProps.on.select = this.handleChange;
        pickerStyle.width = '195px';
      }
      else {
        pickerProps.on.change = this.handleChange;
      }
      if (Reflect.has(props, 'mode')) {
        calendarProps.props.mode = props.mode;
      }
      const theCalendarProps = mergeProps(calendarProps, {
        props : {
          disabledDate         : props.disabledDate,
          disabledTime,
          locale               : locale.lang,
          timePicker           : props.timePicker,
          defaultValue         : props.defaultPickerValue || interopDefault(moment)(),
          dateInputPlaceholder : placeholder,
          prefixCls,
          dateRender,
          format               : props.format,
          showToday            : props.showToday,
          monthCellContentRender,
          value                : showDate,
        },
        on : {
          select : this.handleSelect,
          change : this.handleCalendarChange,
        },
        class       : calendarClassName,
        scopedSlots : $scopedSlots,
      });
      const calendar = h(TheCalendar, theCalendarProps);

      const vcDatePickerProps = {
        ref   : 'calendar',
        props : {
          ...props,
          ...pickerProps.props,
          calendar,
          value,
          prefixCls : `${prefixCls}-picker-container`,
        },
        on : {
          ...omit($listeners, 'change'),
          ...pickerProps.on,
        },
        style : props.popupStyle,
      };


      return h(VcCalendar, vcDatePickerProps);
    },
  };
}
