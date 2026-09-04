import { useEffect, useRef, useState } from "react";
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
import { useEditorStore } from "../../store/editorStore";
import { CardDumper } from "../../tools/CardDumper";
import { requestConfirm } from "../misc/requestConfirm";
import { AvatarDownloadMenu, type SaveProcess } from "./AvatarDownloadMenu";
import { useAvatarUpload } from "./useAvatarUpload";

const versions = ["v1", "v2", "v3", "max"] as const;
type TVersion = (typeof versions)[number];

function useImageInfo(imageUrl: string | null) {
  const [info, setInfo] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!imageUrl) {
      setInfo({ width: 0, height: 0 });
      return;
    }
    const image = new window.Image();
    image.src = imageUrl;
    image.onload = () => {
      setInfo({ width: image.width, height: image.height });
    };
  }, [imageUrl]);
  return info;
}

export const AvatarPanel = () => {
  const styles = useStyles();
  const t = useI18n();
  const { fileInputRef, isProcessingImage, handleFileChange, selectAvatarFile } =
    useAvatarUpload();

  const avatarPreview = useEditorStore((state) => state.avatarPreview);
  const originalFileName = useEditorStore((state) => state.originalFileName);
  const name = useEditorStore((state) => state.formData.name);
  const isDirty = useEditorStore((state) => state.isDirty);
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const resetEditor = useEditorStore((state) => state.resetEditor);
  const setDirty = useEditorStore((state) => state.setDirty);
  const buildCard = useEditorStore((state) => state.buildCharacterCard);
  const addToHistory = useEditorStore((state) => state.addToHistory);

  const [version, setVersion] = useState<TVersion>("v3");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const imageInfo = useImageInfo(avatarPreview);

  const handleSaveProcess: SaveProcess = async (cb) => {
    const card = buildCard();
    if (!card) return;
    const finalSpecV3 = card.toSpecV3();
    const dumper = new CardDumper(card);
    try {
      await cb(dumper);
    } catch (error) {
      alert(`${error}`);
      console.error(error);
      return;
    }
    setDirty(false);
    void addToHistory(finalSpecV3.data, avatarPreview);
  };

  const confirmClearForm = async () => {
    const confirm = await requestConfirm({ content: t("confirmClearForm") });
    if (!confirm) return;
    resetEditor();
    setShowClearConfirm(false);
  };

  const handleClearForm = () => {
    if (isDirtyRef.current) setShowClearConfirm(true);
    else void confirmClearForm();
  };

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
            position: "relative",
          }}
          onClick={selectAvatarFile}
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
              <Text>{t("Processing...")}</Text>
            </div>
          )}
          {avatarPreview ? (
            <Image
              id="avatar"
              src={avatarPreview}
              alt="Avatar"
              className={styles.avatarImage}
              style={{ opacity: isProcessingImage ? 0.5 : 1 }}
            />
          ) : (
            <Text>{!isProcessingImage && t("No Avatar")}</Text>
          )}
        </CardPreview>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={handleFileChange}
          disabled={isProcessingImage}
        />
        {originalFileName && !isProcessingImage && (
          <>
            <Text className={styles.fileNameText}>File: {originalFileName}</Text>
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
          <AvatarDownloadMenu
            version={version}
            onSave={handleSaveProcess}
            disabled={!avatarPreview || isProcessingImage}
          />
          <Button
            appearance="primary"
            onClick={() =>
              handleSaveProcess((dumper) => dumper.download_json(version))
            }
            disabled={isProcessingImage || !name}
          >
            {t("Save JSON")}
          </Button>
        </div>
        <Divider
          style={{ width: "100%", flex: 0, marginTop: tokens.spacingVerticalM }}
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
        onOpenChange={(_, data: { open: boolean }) =>
          setShowClearConfirm(data.open)
        }
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
