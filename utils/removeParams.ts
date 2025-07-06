import { KEY_EMPTY_SELECT } from "@/components/form/select";

type Void = undefined | null | "";

/**
 * Loại bỏ
 *  1. Mọi key có giá trị undefined | null | ""
 *  2. (tuỳ chọn) các key chỉ định trong tham số omitKeys
 */
export type OmitVoid<T, K extends keyof T = never> = {
  [P in keyof T as P extends K // ➊ bỏ nếu nằm trong danh sách omitKeys
    ? never
    : T[P] extends Void // ➋ bỏ nếu giá trị kiểu Void
    ? never
    : P]: T[P]; //
};

export function omitVoid<T extends object, K extends keyof T = never>(
  obj?: T,
  omitKeys: readonly K[] = [] // optional list các key cần bỏ
): OmitVoid<T, K> {
  if (!obj || typeof obj !== "object") return {} as OmitVoid<T, K>;

  const skip = new Set<keyof T>(omitKeys as readonly (keyof T)[]);
  const entries = Object.entries(obj) as [keyof T, T[keyof T]][];

  return Object.fromEntries(
    entries.filter(
      ([k, v]) =>
        !skip.has(k) &&
        v !== undefined &&
        v !== null &&
        v !== "" &&
        v !== KEY_EMPTY_SELECT // ➌ bỏ nếu là giá trị đặc biệt của empty select
    )
  ) as OmitVoid<T, K>;
}
