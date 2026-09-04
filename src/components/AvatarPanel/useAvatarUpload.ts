import { useRef, useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { useI18n } from "../../tools/i18n";

function toPngFilename(originalFilename: string) {
  const withoutExtension =
    originalFilename.substring(0, originalFilename.lastIndexOf(".")) ||
    originalFilename;
  return `${withoutExtension}.png`;
}

export function useAvatarUpload() {
  const t = useI18n();
  const replaceAvatar = useEditorStore((state) => state.replaceAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const selectAvatarFile = () => {
    if (!isProcessingImage) fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    const supportedMimeTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!supportedMimeTypes.includes(file.type)) {
      alert(t("Unsupported file type. Please upload a PNG, JPG, WEBP, or GIF image."));
      return;
    }

    setIsProcessingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const image = new window.Image();
      image.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            alert(t("Could not get canvas context. Image processing failed."));
            return;
          }
          ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
          replaceAvatar(canvas.toDataURL("image/png"), toPngFilename(file.name));
        } catch (error) {
          console.error("Error processing image:", error);
          alert(t("An error occurred while processing the image."));
        } finally {
          setIsProcessingImage(false);
        }
      };
      image.onerror = () => {
        alert(t("Failed to load image. It might be corrupted or an unsupported format."));
        setIsProcessingImage(false);
      };
      image.src = dataUrl;
    } catch (error) {
      console.error("Error processing image:", error);
      alert(t("An error occurred while processing the image."));
      setIsProcessingImage(false);
    }
  };

  return {
    fileInputRef,
    isProcessingImage,
    handleFileChange,
    selectAvatarFile,
  };
}
