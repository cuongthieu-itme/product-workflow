import { useEffect, useState } from "react";

/**
 * Trả về giá trị đã được debounce.
 *
 * @param value   Giá trị gốc cần debounce
 * @param delay   Thời gian chờ (ms). Mặc định 300 ms
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // huỷ timeout khi value thay đổi
  }, [value, delay]);

  return debounced;
}
