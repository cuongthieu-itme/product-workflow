// BaseDialog.tsx
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog";           // đổi path cho phù hợp
import { ReactNode } from "react";

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
}

export function BaseDialog({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    contentClassName = "sm:max-w-[425px]",
}: BaseDialogProps) {
    return (
        <Dialog open={open}>
            <DialogOverlay onClick={onClose}>
                <DialogContent className={contentClassName}>
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                        <DialogClose onClick={onClose} />
                    </DialogHeader>

                    {/* body */}
                    <div className="py-4">{children}</div>

                    {/* footer */}
                    {footer}
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    );
}
