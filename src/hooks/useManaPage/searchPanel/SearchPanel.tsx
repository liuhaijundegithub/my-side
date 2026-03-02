import React, { useEffect, useState } from 'react';
import style from './index.module.less';
import {Form, Input, Select, DatePicker, Tooltip, DatePickerProps} from 'antd';
import useRouter from '@/hooks/useRouter';
import { CommonHTMLAttributes } from 'navyd/dist/types/global';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { SearchOutlined } from '@ant-design/icons';

export interface SearchPanelForm {
  type: 'input' | 'select' | 'none' | 'date-range'; // none 不作为搜索条件，但会作为搜索方法参数
  label?: string;
  name: string;
  defaultValue?: any;
  allowClear?: boolean;
  placeholder?: string | [string, string];
  multiple?: boolean;
  width?: number;
  maxTagCount?: number;
  options?: Option[] | ((params: StateParams) => Promise<Option[]>);
  dateRangeNum?: number;
}

export interface SearchPanelProps {
  items: (SearchPanelForm | React.FC)[];
  onSearch?: (p: StateParams) => void;
  onReset?: (p: StateParams) => void;
  onFieldChange?: (p: StateParams, name: string, value?: any) => void;
  params?: StateParams;
  className?: string;
  actions?: React.ReactNode;
}

const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();
// Disabled 7 days from the selected date
const rangeControl = (range: number) => {
  const fn: DatePickerProps['disabledDate'] = (current, { from, type }) => {
    if (from) {
      const minDate = from.add(-(range - 1), 'days');
      const maxDate = from.add(range - 1, 'days');

      switch (type) {
      case 'year':
        return current.year() < minDate.year() || current.year() > maxDate.year();

      case 'month':
        return (
          getYearMonth(current) < getYearMonth(minDate) ||
          getYearMonth(current) > getYearMonth(maxDate)
        );

      default:
        return Math.abs(current.diff(from, 'days')) >= range;
      }
    }
    return false;
  };
  return fn;
};
const SearchPanel: React.FC<SearchPanelProps & CommonHTMLAttributes> = ({ items, onSearch, actions, onFieldChange, params = {}, className = '' }) => {
  const [data, setData] = useState([...items]);

  const router = useRouter();
  const routerParams = {
    ...router.getSearchParams(),
    ...router.getParams()
  };
  useEffect(() => {
    data.forEach(async item => {
      if (typeof item === 'function') return;
      const i = item as SearchPanelForm;
      if (typeof i.options === 'function') {
        const a = await i.options(routerParams);
        i.options = a;
      }
      if (i.allowClear === undefined) {
        i.allowClear = true;
      }
      setData([...data]);
    });
  }, [items]);

  const fieldChange = (name: string, value: any) => {
    onFieldChange && onFieldChange(params, name, value);
  };

  return (
    <div className={classNames(style.panel, className)}>
      <div>
        {
          data.map(item => {
            if (typeof item === 'function') {
              const C = item;
              return <C key={React.useId()} />;
            }
            const i = item as SearchPanelForm;
            switch (i.type) {
            case 'input':
              return <Form.Item
                label={i.label}
                key={i.name}
              >
                <Input
                  style={{width: i.width || 200}}
                  defaultValue={i.defaultValue}
                  value={params[i.name]}
                  onChange={e => fieldChange(i.name, e.target.value)}
                  placeholder={i.placeholder as string || '请输入'}
                  suffix={
                    <SearchOutlined />
                  }
                />
              </Form.Item>;
            case 'select':
              return <Form.Item
                label={i.label}
                key={i.name}
              >
                <Select
                  style={{width: i.width || 200}}
                  defaultValue={i.defaultValue}
                  value={params[i.name]}
                  mode={i.multiple ? 'multiple' : undefined}
                  maxTagCount={i.maxTagCount}
                  filterOption={(input, option) => {
                    return (option?.children as unknown as string || '').toLowerCase().includes(input.toLowerCase());
                  }}
                  allowClear={i.allowClear}
                  maxTagPlaceholder={(values) => {
                    return <Tooltip title={<span className="font-12">{
                      values.map(v => <p key={v.key}>{v.label}</p>)
                    }</span>}>
                      <span>+ {values.length }</span>
                    </Tooltip>;
                  }}
                  onChange={e => fieldChange(i.name, e)}
                  placeholder={i.placeholder as string || '请输入'}
                >
                  {
                    typeof i.options === 'object' && i.options?.map(opt => (
                      <Select.Option key={opt.value}>{opt.label}</Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>;
            case 'date-range':
              return <Form.Item label={i.label} key={i.name}>
                <DatePicker.RangePicker
                  placeholder={i.placeholder as [string, string]}
                  value={params[i.name + 'StartDt'] && params[i.name + 'EndDt'] ? [dayjs(params[i.name + 'StartDt']), dayjs(params[i.name + 'EndDt'])] : undefined}
                  onChange={(_, dateString) => {
                    fieldChange(i.name + 'StartDt', dateString[0] ? dayjs(dateString[0]).startOf('day').valueOf() : '');
                    fieldChange(i.name + 'EndDt',dateString[1] ? dayjs(dateString[1]).endOf('day').valueOf() : '');
                  }}
                  disabledDate={i.dateRangeNum ? rangeControl(i.dateRangeNum) : undefined}
                  allowClear={i.allowClear}
                />
              </Form.Item>;
            default:
              return <></>;
            }
          })
        }
      </div>
      {
        actions
      }
    </div>
  );
};

export default SearchPanel;
