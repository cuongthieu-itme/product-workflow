import { UserType } from "@/features/auth/type";
import { atom } from "jotai";

interface AuthState {
  isAuthenticated: boolean;
  user: UserType | null;
}

export const authAtom = atom<AuthState>({
  isAuthenticated: false,
  user: null,
});
