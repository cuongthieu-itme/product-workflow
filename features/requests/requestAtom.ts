import { atom } from "jotai";
import { SourceEnum } from "./constants";

export const openMaterialDialogAtom = atom<boolean>(false);
export const openCustomerFormDialogAtom = atom<boolean>(false);
export const sourceAtom = atom<SourceEnum>(SourceEnum.CUSTOMER);
