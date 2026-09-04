import {
  Button,
  Field,
  Input,
  Spinner,
  Text,
  tokens,
} from "@fluentui/react-components";
import { useStyles } from "../useStyles";
import { useI18n } from "../../tools/i18n";
import { useCardImport } from "./useCardImport";
import { ShareLinkDialog } from "./ShareLinkDialog";

export const StartPanel = () => {
  const styles = useStyles();
  const t = useI18n();
  const {
    isLoading,
    dragHighlight,
    dragEvents,
    loadFromUrl,
    setLoadFromUrl,
    handleLoadFromUrl,
    showShareModal,
    shareModal,
    setShareModal,
    createNew,
    handleFileSelect,
  } = useCardImport();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.spacingVerticalL,
      }}
    >
      <Button appearance="primary" onClick={() => void createNew()}>
        1. {t("Create New Character")}
      </Button>

      <Text weight="semibold" size={400}>
        {t("OR")}
      </Text>

      <div
        className={`${styles.dropArea} ${
          dragHighlight ? styles.dropAreaHighlight : ""
        }`}
        {...dragEvents}
        onClick={() => document.getElementById("fileInput")?.click()}
        style={{ width: "100%", maxWidth: "600px" }}
      >
        {isLoading ? (
          <Spinner labelPosition="below" label={t("Processing card...")} />
        ) : (
          <>
            <Text size={400}>
              2. {t("Drag & Drop Character Card Image Here")}
            </Text>
            <Text size={300} style={{ marginTop: tokens.spacingVerticalSNudge }}>
              (.png, .webp, .jpg, .json)
            </Text>
            <Button
              appearance="outline"
              style={{ marginTop: tokens.spacingVerticalS }}
            >
              {t("Select File")}
            </Button>
          </>
        )}
        <input
          type="file"
          id="fileInput"
          hidden
          accept="image/png,image/webp,application/json"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
      </div>

      <Text weight="semibold" size={400}>
        {t("OR")}
      </Text>

      <div style={{ width: "40vw" }}>
        <Field label={"3. " + t("Load image from url")}>
          <Input
            type="url"
            placeholder="https://example.com/avatar.png"
            value={loadFromUrl}
            onChange={(_, data) => setLoadFromUrl(data.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleLoadFromUrl();
            }}
            contentAfter={
              <span
                style={{
                  display: loadFromUrl ? "inline-block" : "none",
                }}
              >
                <Button
                  style={{ minWidth: 0, padding: 0, paddingLeft: "0.5rem" }}
                  appearance="transparent"
                  size="small"
                  onClick={showShareModal}
                >
                  {t("Share")}
                </Button>
                <Button
                  style={{ minWidth: 0, padding: 0, paddingLeft: "0.5rem" }}
                  appearance="transparent"
                  size="small"
                  onClick={() => void handleLoadFromUrl()}
                >
                  {t("Load")}
                </Button>
              </span>
            }
          />
        </Field>
      </div>

      <Text weight="semibold" size={400}>
        {t("OR")}
      </Text>
      <Text weight="semibold" size={400}>
        4. {t("Copy/Paste character card current page will auto detect")}
      </Text>

      <ShareLinkDialog
        open={shareModal.open}
        url={shareModal.url}
        onClose={() => setShareModal({ open: false, url: "" })}
      />
    </div>
  );
};
