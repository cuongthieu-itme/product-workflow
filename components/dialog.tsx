// BaseDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Nội dung chính */
  children?: ReactNode;
  /** Phần footer (nút OK, Cancel…) */
  footer?: ReactNode;
  /** Thêm class tùy chỉnh (ví dụ sm:max-w-[600px]) */
  contentClassName?: string;
  /** Thêm class tùy chỉnh cho header */
  headerClassName?: string;
  width?: string;
}

export function BaseDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  contentClassName = "w-[40vw]",
  headerClassName,
  width = "40vw",
}: BaseDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        className={cn("p-6", contentClassName)}
        style={{
          width,
        }}
      >
        {title && (
          <DialogHeader className={headerClassName}>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
            <DialogClose onClick={onClose} />
          </DialogHeader>
        )}

        {children}

        {footer}
      </DialogContent>
    </Dialog>
  );
}
