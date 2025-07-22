import { SourceEnum } from "./constants";
import { RequestInputType } from "./schema";
import { RequestDetail } from "./type";

interface ToRequestFormInputParams {
  detail?: RequestDetail;
  sourceSelected: SourceEnum;
}

export function toRequestFormInput({
  detail,
  sourceSelected,
}: ToRequestFormInputParams): RequestInputType {


  return {
    title: detail?.title ?? "",
    description: detail?.description ?? "",
    productLink: detail?.productLink?.map((u) => ({ url: u })) ?? [{ url: "" }],
    media: detail?.media ?? [],
    source: detail?.source ?? sourceSelected,
    customerId: detail?.customerId ?? undefined,
    createdById: detail?.createdById,
    materials:
      detail?.requestMaterials?.map((rm) => ({
        materialId: rm.material.id,
        quantity: rm.quantity,
        requestInput: rm.requestInput,
      })) ?? [],
    sourceOtherId: detail?.sourceOtherId ?? undefined,
  };
}
