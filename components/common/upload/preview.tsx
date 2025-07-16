import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/features/settings/utils";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

interface PreviewFileItemProps {
  id: string;
  src: string;
  index: number;
  onRemove: (index: number) => void;
}

export const PreviewFileItem: React.FC<PreviewFileItemProps> = ({
  id,
  src,
  index,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative group", isDragging && "opacity-50 z-50")}
    >
      <img
        src={getImageUrl(src)}
        alt={`preview-${index}`}
        className="w-full h-24 object-cover rounded-md"
      />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        size="icon"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 h-6 w-6 bg-destructive hover:bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
