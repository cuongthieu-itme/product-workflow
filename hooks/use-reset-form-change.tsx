import { useEffect } from "react";
import type { FieldValues, UseFormWatch } from "react-hook-form";

export function useResetOnFormChange<
  T extends FieldValues,
  K extends keyof T = never
>(watch: UseFormWatch<T>, reset: () => void, fields?: readonly K[]) {
  useEffect(() => {
    const subscription = watch((values) => {
      const v = values as Partial<Record<keyof T, unknown>>;

      const shouldReset = fields
        ? (fields as readonly (keyof T)[]).some((k) => Boolean(v[k]))
        : Object.values(v).some(Boolean);

      if (shouldReset) reset();
    });

    return () => subscription.unsubscribe();
  }, [watch, reset, fields]);
}
