import { Pagination, PaginationProps, Table, TableProps, ConfigProvider } from 'antd';
import style from './Table.module.less';
import React, { useEffect, useMemo, useState } from 'react';
import Empty from '@common/components/empty/Empty';
import { Key } from 'antd/es/table/interface';
import { throttle } from 'lodash';
import { getuuid } from '@/utils/tools';
import withIf from '@/common/hoc/withIf';
import useTableActions from '@/hooks/useTableActions';

// interface UniTableRowSelection<T> extends TableRowSelection<T> {
//   selectedKeys?: Key[];
// }

export interface UniTableProps<T = any> extends TableProps<T> {
  list: Array<T>,
  selectedKeys?: Key[];
  onPagechange?: (pageNum: number, pageSize: number) => void;
  pagination?: PaginationProps;
  /**
   * @param record 当前操作的数据
   * @param active 是否选中
   * @param selectedData 当前选中的数据集合
   */
  onSelectChange?: ( selectedData: T[], record: T[], active: boolean) => void;
  showIndex?: boolean; // 是否显示序号
  centered?: boolean; // 是不是居中显示
  emptyProp?: React.ReactNode;
  columns: UniColumn<T>[];
  onScrollToBottom?: () => void;
  rowkey?: string;
  autoHeight?: boolean;
  disabledCheckItems?: StateParams[];
}

function UniTable<T> (props: UniTableProps<T>) {

  const pageChange = (pageNum: number, pageSize: number) => {
    props.onPagechange && props.onPagechange(pageNum, pageSize);
  };

  // 选择变化
  const rowSelectionChange = (changedRecord: T, selected: boolean, selectedRows: T[]) => {
    props.onSelectChange && props.onSelectChange(selectedRows, [changedRecord], selected);
  };

  // 全选变化
  const onSelectAll = (selected: boolean, _: unknown, changedRecords: T[]) => {
    props.onSelectChange && props.onSelectChange(selected ? changedRecords: [], changedRecords, selected);
  };

  const {
    list = [],
    columns = [],
    selectedKeys
  } = props;

  const listIndex = useMemo(() => {
    return list.map((item, index) => ({
      ...item,
      index: props.pagination ? ((props.pagination.current! - 1) * props.pagination.pageSize! + index + 1) : index + 1,
      rowKey: (item as any || {})[props.rowKey] || getuuid()
    }));
  }, [list, props.showIndex, props.pagination, props.rowKey]);

  const columnsIndex = useMemo(() => {
    let c = [...columns];
    if (props.showIndex) {
      // 序号列永远居中
      c.unshift({ title: '序号', dataIndex: 'index', width: 70, key: 'index', align: 'center', fixed: 'left' });
    }
    if (props.centered) {
      c = c.map(item => ({ ...item, align: 'center' }));
    }

    // 处理actions
    c.forEach(i => {
      if (i.actions) {
        i.render = (_, record) => {
          const Actions = useTableActions(i.actions!, record);
          return <Actions />;
        };
      }
    });
    return c;
  }, [columns, props.showIndex]);

  const renderEmpty = (() => <Empty className="flex-center">
    {props.emptyProp ? props.emptyProp : <div>暂无记录</div>}
  </Empty>);

  const tableRef = React.createRef<HTMLDivElement>();
  useEffect(() => {
    const el = tableRef.current?.querySelector('.ant-table-body');
    if (el) {
      // 监听滚动事件 判断是不是滚动到最底部
      const onScroll = throttle(() => {
        if (Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) < 5) {
          props.onScrollToBottom && props.onScrollToBottom();
        }
      }, 100, { leading: true });
      el.addEventListener('scroll', onScroll);
      return () => {
        el.removeEventListener('scroll', onScroll);
      };
    }
  }, [listIndex]);

  const [tableHeight, setTableHeight] = useState<string | null>(null);

  useEffect(() => {

    if (!props.autoHeight) return;
    let baseHeight = 55 + 30;
    if (props.pagination) baseHeight += 50;

    const el = tableRef.current!;
    const resizehandle = throttle(() => {
      const { y } = el.getBoundingClientRect();
      const height = `calc(100vh - ${y}px - ${baseHeight}px)`;
      setTableHeight(height);
    }, 200);
    const observer = new MutationObserver(() => {
      resizehandle();
      // 在这里处理高度变化的逻辑
    });

    // 配置观察选项
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    };

    observer.observe(tableRef.current!, config);

    return () => {
      observer.disconnect();
    };
  }, [props.autoHeight, props.list, props.pagination]);
  return (
    <div ref={tableRef}>
      {/* table */}
      <ConfigProvider renderEmpty={renderEmpty}>
        <Table
          rowKey="rowKey"
          rowSelection={selectedKeys ? {
            selectedRowKeys: selectedKeys,
            onSelectAll,
            onSelect: rowSelectionChange,
            getCheckboxProps: props.disabledCheckItems ? (record: T) => {
              const f = props.disabledCheckItems?.some(i => i[props.rowKey as string] === (record as StateParams)[props.rowKey as string]);
              return {
                disabled: f
              };
            } : undefined
          } : undefined}
          expandable={{ showExpandColumn: false }}
          dataSource={listIndex}
          { ...props }
          pagination={false}
          columns={columnsIndex}
          scroll={props.scroll ? props.scroll : tableHeight ? { y: tableHeight } : undefined }
        />
      </ConfigProvider>

      {/* 分页 */}
      {
        props.pagination && <>
          <div className={style['pagination']}>
            <div>
              共 <span className="red margin">{ props.pagination.total || 0 }</span> 条记录
            </div>
            <Pagination
              showSizeChanger
              showQuickJumper
              current={props.pagination.current}
              pageSize={props.pagination.pageSize}
              total={props.pagination.total}
              onChange={pageChange}
            />
          </div>
        </>
      }
    </div>
  );
}

export default withIf<UniTableProps>(UniTable);