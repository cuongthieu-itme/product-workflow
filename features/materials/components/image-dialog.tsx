
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { BaseDialog } from "@/components/dialog";
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/features/settings/utils";

interface ImageDialogProps {
    isImageDialogOpen: boolean;
    images: string[];
    onClose: () => void;
    nameImage: string;
}

export const ImageDialog = ({ isImageDialogOpen, images, onClose, nameImage }: ImageDialogProps) => {
    return (
        <BaseDialog open={isImageDialogOpen} onClose={onClose}
            contentClassName="max-w-4xl">
            <DialogHeader>
                <DialogTitle>
                    Hình ảnh: {nameImage}
                </DialogTitle>
            </DialogHeader>

            {images &&
                images.length > 0 ? (
                <Carousel className="w-full max-w-3xl mx-auto">
                    <CarouselContent>
                        {images.map((image, index) => (
                            <CarouselItem key={index}>
                                <div className="relative h-96 w-full">
                                    <Image
                                        src={getImageUrl(image) || "/placeholder.svg"}
                                        alt={nameImage}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {images.length > 1 && (
                        <>
                            <CarouselPrevious />
                            <CarouselNext />
                        </>
                    )}
                </Carousel>
            ) : (
                <div className="text-center py-8">Không có hình ảnh</div>
            )}
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={onClose}
                >
                    Đóng
                </Button>
            </DialogFooter>
        </BaseDialog>
    )
}