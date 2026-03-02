import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface RouteParamsState {
  routeParams: Record<string, string>;
  routeName: string;
}

interface RouteParamsActions {
  setRouteName: (name: string) => void;
  setRouteParam: (key: string, value: string) => void;
  setRouteParams: (params: Record<string, string>) => void;
  deleteRouteParam: (keys: string[]) => void;
  clearRouteParams: () => void;
}

const useRouterStore = create(persist<RouteParamsState & RouteParamsActions>(
  (set) => {
    return {
      routeParams: {},
      routeName: '',
      setRouteName: (name: string) => {
        set((state) => ({
          ...state,
          routeName: name
        }));
      },
      setRouteParam: (key: string, value: string) => {
        set((state) => ({
          ...state,
          routeParams: {
            ...state.routeParams,
            [key]: value
          }
        }));
      },
      setRouteParams: (params: Record<string, string>) => {
        set(state => ({
          ...state,
          routeParams: params
        }));
      },
      deleteRouteParam: (key: string[]) => {
        set(state => {
          const copy = state.routeParams;
          for (const k of key) {
            delete copy[k];
          }
          return {
            ...state,
            routeParams: copy
          };
        });
      },
      clearRouteParams: () => {
        set(state => ({
          ...state,
          routeParams: {}
        }));
      }
    };
  },
  {
    name: 'router-store'
  }
));

export default useRouterStore;
