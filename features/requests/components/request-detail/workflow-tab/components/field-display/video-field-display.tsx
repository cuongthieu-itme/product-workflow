import { getImageUrl } from "@/features/settings/utils";

interface VideoFieldDisplayProps {
  fieldValue: string;
  previousStepValue?: string;
}

export const VideoFieldDisplay = ({
  fieldValue,
  previousStepValue,
}: VideoFieldDisplayProps) => {
  const videoSrc = previousStepValue || fieldValue;

  if (!videoSrc) {
    return <span className="text-gray-500 italic">Chưa có video</span>;
  }

  return (
    <div className="relative w-full">
      <video
        src={getImageUrl(videoSrc)}
        controls
        className="w-full rounded-md border"
      />
    </div>
  );
};
