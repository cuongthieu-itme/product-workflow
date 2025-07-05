type Void = undefined | null | "";

/**
 * Loại bỏ các key có giá trị undefined | null | '' ngay cả ở level type.
 *
 * @example
 *   const clean = omitVoid({ a: 1, b: undefined, c: null, d: '' });
 *   // clean có kiểu { a: number }
 */
type OmitVoid<T> = {
  [K in keyof T as T[K] extends Void ? never : K]: T[K];
};

export function omitVoid<T extends object>(obj?: T): OmitVoid<T> {
  if (!obj || typeof obj !== "object") {
    // Nếu obj là undefined, null hoặc không phải object, trả về {}
    return {} as OmitVoid<T>;
  }
  // Ép kiểu entries để giữ key gốc & value gốc
  const entries = Object.entries(obj) as [keyof T, T[keyof T]][];

  return Object.fromEntries(
    entries.filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as OmitVoid<T>;
}
