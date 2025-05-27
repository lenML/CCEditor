import { useState, useRef, useEffect } from "react";
import { CharacterCard } from "@lenml/char-card-reader";

import {
  tokens,
  Button,
  Image,
  Card,
  CardHeader,
  CardPreview,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Text,
  Divider,
  Field,
  RadioGroup,
  Radio,
} from "@fluentui/react-components";

import { useStyles } from "../useStyles";
import { useI18n } from "../../tools/i18n";
import { CardDumper } from "../../tools/CardDumper";
// import { sanitizeFilename } from "../common"; // Not used in this snippet

import { filesize } from "filesize";

const versions = ["v1", "v2", "v3", "max"] as const;
type TVersion = (typeof versions)[number];

// Helper function to convert Data URL to ArrayBuffer
async function dataURLtoArrayBuffer(dataURL: string): Promise<ArrayBuffer> {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  return blob.arrayBuffer();
}

// Helper function to get a new filename with .png extension
function getPngFilename(originalFilename: string): string {
  // Remove existing extension and add .png
  const nameWithoutExtension =
    originalFilename.substring(0, originalFilename.lastIndexOf(".")) ||
    originalFilename;
  return `${nameWithoutExtension}.png`;
}

function useImageInfo(image_url: string | null) {
  const [imageInfo, setImageInfo] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    if (!image_url) {
      setImageInfo({
        width: 0,
        height: 0,
      });
      return;
    }
    const image = new window.Image();
    image.src = image_url;
    image.onload = () => {
      // size 为文件大小
      setImageInfo({
        width: image.width,
        height: image.height,
      });
    };
  }, [image_url]);
  return imageInfo;
}

export const AvatarPanel = ({
  avatarPreview,
  originalFileName: initialOriginalFileName, // Renamed to avoid conflict with formData.originalFileName
  // originalFile, // This will be managed via formData after conversion
  getCurrentCard,
  setFormData,
  setIsDirty,
  addToHistory,
  resetEditorState,
  setAvatarPreview,
  formData,
  isDirty,
}: {
  avatarPreview?: string | null;
  originalFileName?: string | null; // This is the initial file name, or derived from formData
  // originalFile?: ArrayBuffer | null; // We'll use formData.originalFile for the PNG ArrayBuffer
  getCurrentCard: () => CharacterCard | null | undefined;
  setFormData: (updater: (prevData: any) => any) => any;
  setIsDirty: (isDirty: boolean) => any;
  addToHistory: (...args: any[]) => any;
  resetEditorState: (...args: any[]) => any;
  setAvatarPreview: (uri: string) => any;
  isDirty: boolean;
  formData: any; // Expects formData to potentially have originalFileName and originalFile
}) => {
  const styles = useStyles();
  const t = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [version, setVersion] = useState("v3" as TVersion);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const imageInfo = useImageInfo(avatarPreview || null);

  const handleSaveProcess = async (cb: (dumper: CardDumper) => any) => {
    const card = getCurrentCard();
    if (!card) return;

    // Ensure card's avatar is the PNG DataURL from formData
    // If card.data.avatar isn't directly formData.avatar, you might need:
    // card.data.avatar = formData.avatar;

    const finalSpecV3 = card.toSpecV3();
    setFormData((prev: any) => ({
      ...prev,
      creation_date: finalSpecV3.data.creation_date,
      modification_date: finalSpecV3.data.modification_date,
    }));

    const dumper = new CardDumper(card);
    try {
      await cb(dumper);
    } catch (error) {
      alert(`${error}`);
      console.error(error);
      return;
    }

    setIsDirty(false);
    addToHistory(
      finalSpecV3.data,
      avatarPreview, // This should be the PNG data URL
      finalSpecV3.spec,
      finalSpecV3.spec_version
    );
  };

  const handleSaveJson = async () =>
    handleSaveProcess((dumper) => dumper.download_json(version));

  const handleSaveImage = async () =>
    handleSaveProcess((dumper) => dumper.download_png(version));
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearForm = () => {
    if (isDirty) setShowClearConfirm(true);
    else confirmClearForm();
  };
  const confirmClearForm = () => {
    resetEditorState();
    setShowClearConfirm(false);
  };

  const handleAvatarAreaClick = () => {
    if (isProcessingImage) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!file) return;

    const MimeTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!MimeTypes.includes(file.type)) {
      alert(
        t(
          "Unsupported file type. Please upload a PNG, JPG, WEBP, or GIF image."
        )
      );
      return;
    }

    setIsProcessingImage(true);

    try {
      // 1. Read the uploaded file as a Data URL to load into an Image object
      const originalFileDataUrl = await new Promise<string>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        }
      );

      // 2. Create an Image object
      const img = new window.Image();
      img.onload = async () => {
        // 3. Draw image onto canvas
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          alert(t("Could not get canvas context. Image processing failed."));
          setIsProcessingImage(false);
          return;
        }
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

        // 4. Convert canvas to PNG Data URL
        const pngDataUrl = canvas.toDataURL("image/png");
        setAvatarPreview(pngDataUrl); // Update visual preview

        // 5. Convert PNG Data URL to ArrayBuffer
        const pngArrayBuffer = await dataURLtoArrayBuffer(pngDataUrl);
        const newPngFilename = getPngFilename(file.name);

        // 6. Update formData with PNG data
        setFormData((prevData: any) => ({
          ...prevData,
          avatar: pngDataUrl, // Store PNG Data URL for CharacterCard
          originalFileName: newPngFilename, // Store the new .png filename
          originalFile: pngArrayBuffer, // Store ArrayBuffer of the PNG
        }));
        setIsDirty(true);
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        alert(
          t(
            "Failed to load image. It might be corrupted or an unsupported format."
          )
        );
        setIsProcessingImage(false);
      };
      img.src = originalFileDataUrl; // Trigger image loading
    } catch (error) {
      console.error("Error processing image:", error);
      alert(t("An error occurred while processing the image."));
      setIsProcessingImage(false);
    }
  };

  // Determine the filename to display. Prefer formData.originalFileName if available (after conversion)
  const displayedFileName =
    formData?.originalFileName || initialOriginalFileName;

  return (
    <>
      <Card className={styles.avatarPanel}>
        <CardHeader
          header={
            <Text weight="semibold" size={500}>
              {isProcessingImage ? t("Processing Image...") : t("Avatar")}
            </Text>
          }
        />
        <CardPreview
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
            width: "100%",
            cursor: isProcessingImage ? "wait" : "pointer",
            position: "relative", // For potential overlay if needed
          }}
          onClick={handleAvatarAreaClick}
        >
          {isProcessingImage && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
            >
              <Text>{t("Processing...")}</Text> {/* Or a spinner */}
            </div>
          )}
          {avatarPreview ? (
            <Image
              id="avatar"
              src={avatarPreview} // This will be the PNG Data URL
              alt="Avatar"
              className={styles.avatarImage}
              style={{ opacity: isProcessingImage ? 0.5 : 1 }}
            />
          ) : (
            <Text>{!isProcessingImage && t("No Avatar")}</Text> // Hide "No Avatar" during processing
          )}
        </CardPreview>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/png, image/jpeg, image/webp, image/gif" // Accept various types for conversion
          onChange={handleFileChange}
          disabled={isProcessingImage}
        />
        {displayedFileName &&
          !isProcessingImage && ( // Hide filename during processing to reduce clutter
            <>
              <Text className={styles.fileNameText}>
                File: {displayedFileName}
              </Text>
              {/* <Text className={styles.fileNameText}>
                Size: {filesize(imageInfo.size)}
              </Text> */}
              <Text className={styles.fileNameText}>
                {imageInfo.width}px * {imageInfo.height}px
              </Text>
            </>
          )}

        <Field label={t("Spec Version")}>
          <RadioGroup
            value={version}
            onChange={(_, data) => setVersion(data.value as TVersion)}
            layout="horizontal"
          >
            {versions.map((v) => (
              <Radio key={v} label={v} value={v} />
            ))}
          </RadioGroup>
        </Field>

        <div
          className={styles.buttonGroup}
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            width: "100%",
            marginTop: tokens.spacingVerticalM,
          }}
        >
          <Button
            appearance="outline"
            onClick={handleSaveImage}
            disabled={!avatarPreview || isProcessingImage}
          >
            {t("Download PNG")}
          </Button>
          <Button
            appearance="primary"
            onClick={handleSaveJson}
            disabled={isProcessingImage || !formData?.name} // Disable if no character name or processing
          >
            {t("Save JSON")}
          </Button>
        </div>
        <Divider
          style={{ width: "100%", marginTop: tokens.spacingVerticalM }}
        />
        <div
          className={styles.buttonGroup}
          style={{ width: "100%", justifyContent: "space-around" }}
        >
          <Button
            appearance="secondary"
            onClick={handleClearForm}
            disabled={isProcessingImage}
          >
            {t("Clear / New")}
          </Button>
        </div>
      </Card>

      <Dialog
        open={showClearConfirm}
        onOpenChange={(
          _: any,
          data: { open: boolean | ((prevState: boolean) => boolean) }
        ) => setShowClearConfirm(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("Unsaved Changes")}</DialogTitle>
            <DialogContent>
              {t(
                "You have unsaved changes. Are you sure you want to clear the form?"
              )}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="secondary"
                  onClick={() => setShowClearConfirm(false)}
                >
                  {t("Cancel")}
                </Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={confirmClearForm}>
                {t("Clear Form")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
