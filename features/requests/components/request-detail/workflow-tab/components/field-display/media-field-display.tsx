import { getImageUrl } from "@/features/settings/utils";
import { isVideoUrl } from "./utils";

interface MediaFieldDisplayProps {
  fieldValue: string[];
}

export const MediaFieldDisplay = ({ fieldValue }: MediaFieldDisplayProps) => {
  const filteredValue = fieldValue.filter(Boolean);

  if (filteredValue.length === 0) {
    return <span className="text-gray-500 italic">Chưa có dữ liệu</span>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {filteredValue.map((url: string, idx: number) => (
        <div key={idx} className="relative w-full">
          {isVideoUrl(url) ? (
            <video
              src={getImageUrl(url)}
              controls
              className="w-full rounded-md border"
            />
          ) : (
            <img
              src={getImageUrl(url)}
              alt={`media-${idx}`}
              className="w-full rounded-md border object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
};
