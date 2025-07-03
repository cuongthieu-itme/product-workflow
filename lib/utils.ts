import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Recursively convert every JS Date inside an object/array
 * to Firestore Timestamp (required before writing to Firestore).
 */
export function convertDateToTimestamp<T = unknown>(data: T): T {
  if (data === null || data === undefined) return data as T;

  if (data instanceof Date) {
    // @ts-ignore – Timestamp has correct overloads
    return Timestamp.fromDate(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return data.map((item) => convertDateToTimestamp(item)) as unknown as T;
  }

  if (typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const key in data) {
      // @ts-expect-error – dynamic assignment
      result[key] = convertDateToTimestamp(
        (data as Record<string, unknown>)[key]
      );
    }
    return result as T;
  }

  return data as T;
}

/**
 * Recursively convert every Firestore Timestamp inside an object/array
 * back to JS Date (useful when reading from Firestore).
 */
export function convertTimestampToDate<T = unknown>(data: T): T {
  if (data === null || data === undefined) return data as T;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – runtime check for Timestamp (avoid import cycle issues)
  if (data instanceof Timestamp) {
    // @ts-expect-error – Timestamp has toDate()
    return data.toDate() as T;
  }

  if (Array.isArray(data)) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return data.map((item) => convertTimestampToDate(item)) as unknown as T;
  }

  if (typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const key in data) {
      // @ts-expect-error – dynamic assignment
      result[key] = convertTimestampToDate(
        (data as Record<string, unknown>)[key]
      );
    }
    return result as T;
  }

  return data as T;
}
