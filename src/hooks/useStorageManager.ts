// useStorageManager.ts
import { useState, useEffect, useCallback } from 'react';

type StorageType = 'local' | 'session';

const useStorageManager = <T>(storageType: StorageType = 'local') => {
  // 获取存储对象
  const getStorage = useCallback((): Storage | null => {
    if (typeof window === 'undefined') return null;
    return storageType === 'local' ? localStorage : sessionStorage;
  }, [storageType]);

  // 初始化
  const [storageMap, setStorageMap] = useState<Record<string, T>>(() => {
    const storage = getStorage();
    if (!storage) return {};

    const map: Record<string, T> = {};
    const keys = Object.keys(storage);

    keys.forEach(key => {
      try {
        const value = storage.getItem(key);
        if (value) {
          map[key] = JSON.parse(value) as T;
        }
      } catch (error) {
        console.error(`解析${storageType}Storage键值"${key}"时出错:`, error);
      }
    });
    return map;
  });

  // 更新存储添加处理
  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;

    Object.entries(storageMap).forEach(([key, value]) => {
      try {
        if (value === undefined || value === null) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`更新${storageType}Storage键值"${key}"时出错:`, error);
      }
    });

    // 清理不再存在的键
    const currentKeys = Object.keys(storageMap);
    const storageKeys = Object.keys(storage);

    storageKeys.forEach(key => {
      if (!currentKeys.includes(key)) {
        storage.removeItem(key);
      }
    });
  }, [storageMap, storageType, getStorage]);

  // 设置单个值
  const setItem = useCallback((key: string, value: T) => {
    setStorageMap(prev => ({ ...prev, [key]: value }));
  }, []);

  // 获取单个值
  const getItem = useCallback((key: string): T | undefined => {
    return storageMap[key];
  }, [storageMap]);

  // 删除单个值
  const removeItem = useCallback((key: string) => {
    setStorageMap(prev => {
      const newMap = { ...prev };
      delete newMap[key];
      return newMap;
    });
  }, []);

  // 批量删除值
  const removeItems = useCallback((keys: string[]) => {
    setStorageMap(prev => {
      const newMap = { ...prev };
      keys.forEach(key => delete newMap[key]);
      return newMap;
    });
  }, []);

  // 只保留指定的键
  const keepOnlyItems = useCallback((keysToKeep: string[]) => {
    setStorageMap(prev => {
      const newMap: Record<string, T> = {};
      keysToKeep.forEach(key => {
        if (prev[key] !== undefined) {
          newMap[key] = prev[key];
        }
      });
      return newMap;
    });
  }, []);

  // 清空所有值
  const clearAll = useCallback(() => {
    setStorageMap({});
  }, []);

  return {
    storageMap,
    setItem,
    getItem,
    removeItem,
    removeItems,
    keepOnlyItems,
    clearAll,
    keys: Object.keys(storageMap)
  };
};

export default useStorageManager;