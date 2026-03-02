import { ColumnsType } from 'antd/es/table';
import { useReactive } from 'ahooks';

interface UsePageStateProps<S, T> {
  columns?: UniColumn<T>[];
  searchParams?: S
}
export default function<S, T> (
  loadFn?: (...args: S[]) => Promise<BackendData<T[]> | BackendPaginationData<T[]>>,
  props: UsePageStateProps<S, T> = {}
) {
  const {
    columns = [] as ColumnsType<T>,
    searchParams = {}
  } = props;
  const pagination = useReactive({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const state = useReactive({
    loading: true,
    list: [] as T[],
    columns
  });
  const s = useReactive(Object.assign({}, searchParams)) as S;

  const load: () => Promise<T[]> = function () {
    return new Promise((resolve, reject) => {
      if (!loadFn) return false;
      state.loading = true;
      loadFn({
        ...s,
        pageSize: pagination.pageSize,
        pageNum: pagination.current
      })
        .then(res => {
          if (Array.isArray(res.data)) {
            state.list = res.data;
            resolve(res.data);
          } else {
            state.list = res.data.dataList;
            pagination.total = res.data.totalCount;
            resolve(res.data.dataList);
          }
        })
        .catch((e) => {
          console.error(e);
          reject(e);
          state.loading = false;
        })
        .finally(() => {
          state.loading = false;
        });
    });
  };

  return {
    pagination,
    state,
    load,
    searchParams: s
  };
}
