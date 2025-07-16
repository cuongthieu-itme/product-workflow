export type FileTypeGen = "image" | "video" | "unknown";

export const generateTypeFile = (filename: string): FileTypeGen => {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
    return "image";
  } else if (["mp4", "webm", "ogg"].includes(extension || "")) {
    return "video";
  }
  return "unknown"; // Default to image if unknown type
};
