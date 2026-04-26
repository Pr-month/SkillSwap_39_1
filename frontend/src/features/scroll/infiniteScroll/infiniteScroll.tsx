import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './infiniteScroll.module.css';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  threshold?: number;
  minItems?: number;
}

export const InfiniteScroll = <T extends { _id: string }>({
  items,
  renderItem,
  hasMore,
  onLoadMore,
  loading = false,
  threshold = 100,
  minItems = 20,
}: InfiniteScrollProps<T>) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [columnsCount, setColumnsCount] = useState(3);

  // Определяем количество колонок по ширине экрана
  const getColumnsCount = useCallback((): number => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  // Вычисляем нужное количество строк
  const calculateRowsNeeded = useCallback(
    (itemsCount: number, columns: number): number => {
      const minRows = Math.ceil(minItems / columns);
      const actualRows = Math.ceil(itemsCount / columns);
      return Math.max(minRows, actualRows);
    },
    [minItems],
  );

  // Обновляем отображаемые элементы
  const updateDisplayedItems = useCallback(
    (currentItems: T[], columns: number) => {
      const rowsNeeded = calculateRowsNeeded(currentItems.length, columns);
      const itemsToShow = rowsNeeded * columns;
      setDisplayedItems(currentItems.slice(0, itemsToShow));
    },
    [calculateRowsNeeded],
  );

  // Обработка изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      const newColumnsCount = getColumnsCount();
      setColumnsCount(newColumnsCount);
      updateDisplayedItems(items, newColumnsCount);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items, getColumnsCount, updateDisplayedItems]);

  // Настройка IntersectionObserver
  useEffect(() => {
    if (!containerRef || !hasMore || !loaderRef.current) {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
      return;
    }

    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    };

    const onIntersect: IntersectionObserverCallback = entries => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading && hasMore) {
        onLoadMore();
      }
    };

    observer.current = new IntersectionObserver(onIntersect, options);
    observer.current.observe(loaderRef.current);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, [containerRef, hasMore, loading, onLoadMore, threshold]);

  // Обновление отображаемых элементов при изменении данных
  useEffect(() => {
    updateDisplayedItems(items, columnsCount);
  }, [items, columnsCount, updateDisplayedItems]);

  return (
    <div ref={setContainerRef} className={styles.container}>
      <div className={styles.itemsGrid}>
        {displayedItems.map(item => (
          <div key={item._id} className={styles.itemWrapper}>
            {renderItem(item)}
          </div>
        ))}
      </div>

      {/* Показываем блок только если есть что грузить или идёт загрузка */}
      {(hasMore || loading) && (
        <div ref={loaderRef} className={styles.loader}>
          {loading && <div className={styles.loading}>Загрузка...</div>}
        </div>
      )}
    </div>
  );
};
