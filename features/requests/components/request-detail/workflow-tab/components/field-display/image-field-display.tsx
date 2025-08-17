import { getImageUrl } from "@/features/settings/utils";

interface ImageFieldDisplayProps {
  fieldValue: string;
  previousStepValue?: string;
  altText?: string;
}

export const ImageFieldDisplay = ({
  fieldValue,
  previousStepValue,
  altText = "image",
}: ImageFieldDisplayProps) => {
  const imageSrc = previousStepValue || fieldValue;

  if (!imageSrc) {
    return <span className="text-gray-500 italic">Chưa có hình ảnh</span>;
  }

  return (
    <div className="relative w-full">
      <img
        src={getImageUrl(imageSrc)}
        alt={altText}
        className="w-full h-48 rounded-md border object-cover"
      />
    </div>
  );
};
