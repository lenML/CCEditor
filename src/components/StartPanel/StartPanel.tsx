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
import { useCallback, useState } from "react";
import { useGlobalDrop } from "../useGlobalDrop";
import { CharacterCard } from "@lenml/char-card-reader";
import { useGlobalPaste } from "../useGlobalPaste";

// 对于某些特别的网站链接，转换为源图片非压缩地址
function getRawImageUrl(url: string) {
  const obj = new URL(url);
  if (obj.hostname === "media.discordapp.net") {
    const compress_keys = ["format", "quality", "width", "height"];
    for (const key of compress_keys) {
      obj.searchParams.delete(key);
    }
  }
  return obj.href;
}

// 开始菜单
export const StartPanel = ({
  createNewCharacter,
  setOriginalFileName,
  setOriginalFile,
  setCharacterCard,
  setFormDataFromCardData,
  setAvatarPreview,
  setIsDirty,
  addToHistory,
  resetEditorState,
  isDirtyRef,
}: {
  createNewCharacter: () => any;
  setOriginalFileName: (...args: any[]) => any;
  setOriginalFile: (...args: any[]) => any;
  setCharacterCard: (...args: any[]) => any;
  setFormDataFromCardData: (...args: any[]) => any;
  setAvatarPreview: (...args: any[]) => any;
  setIsDirty: (...args: any[]) => any;
  addToHistory: (...args: any[]) => any;
  resetEditorState: (...args: any[]) => any;
  isDirtyRef: any;
}) => {
  const styles = useStyles();
  const t = useI18n();

  const [dragHighlight, setDragHighlight] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFromUrl, setLoadFromUrl] = useState("");

  const handleFileCard = useCallback(
    async (getCard: () => Promise<CharacterCard>) => {
      setIsLoading(true);
      // @ts-ignore
      document.getElementById("fileInput").value = "";
      try {
        const card = await getCard();
        if (card.name === "unknown") {
          // 解析失败
          throw new Error("Failed to parse character card");
        }
        setCharacterCard(card);
        const v3Data = card.toSpecV3().data;
        setFormDataFromCardData(v3Data);
        setAvatarPreview(card.avatar || null);
        setIsDirty(false);
        addToHistory(v3Data, card.avatar, card.spec, card.spec_version);
      } catch (error) {
        console.error("Error reading card:", error);
        alert(
          // @ts-ignore
          `Error reading card: ${error?.message}. Is this a valid character card image?`
        );
        resetEditorState();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleFileDrop = useCallback(async (file: File) => {
    if (
      !file ||
      (!file.type.startsWith("image/") && file.type !== "application/json")
    ) {
      alert("Please upload an image file (PNG, WEBP, JPG, JSON).");
      return;
    }
    if (isDirtyRef.current) {
      alert(
        "You have unsaved changes. Please save or discard them before loading a new card."
      );
      return;
    }
    setOriginalFileName(file.name);
    async function readCardFile() {
      if (file.type === "application/json") {
        return CharacterCard.from_json(JSON.parse(await file.text()));
      }
      const arrayBuffer = await file.arrayBuffer();
      setOriginalFile(arrayBuffer);
      const card = await CharacterCard.from_file(arrayBuffer);
      return card;
    }
    await handleFileCard(readCardFile);
  }, []);

  const dragEvents = {
    onDragOver: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragHighlight(true);
    },
    onDragEnter: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragHighlight(true);
    },
    onDragLeave: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as any))
        return;
      setDragHighlight(false);
    },
    onDrop: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragHighlight(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileDrop(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
  };

  // bind window drop
  useGlobalDrop((ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.dataTransfer?.files && ev.dataTransfer.files.length > 0) {
      handleFileDrop(ev.dataTransfer.files[0]);
      ev.dataTransfer.clearData();
    }
  });

  useGlobalPaste((files) => {
    handleFileDrop(files[0]);
  });

  const handleLoadFromUrl = useCallback(async () => {
    // 下载文件
    await handleFileCard(async () => {
      const response = await fetch(getRawImageUrl(loadFromUrl));
      const arrayBuffer = await response.arrayBuffer();
      return CharacterCard.from_file(arrayBuffer);
    });
  }, [loadFromUrl]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Center the button, "OR" text, and drop area horizontally.
        gap: tokens.spacingVerticalL, // Consistent spacing between the elements.
        // Optional: Add padding to this container if it needs more breathing room,
        // e.g., padding: `${tokens.spacingVerticalXXL} 0` for top/bottom padding.
        // This depends on where this block is placed in the overall page structure.
        // width: "100%", // Ensures the container can center its content if it has a maxWidth itself.
      }}
    >
      {/* Option 1: Create New Character Button */}
      <Button
        appearance="primary"
        // size="large" // Consider using a larger button size if available and desired for visual balance
        onClick={createNewCharacter}
      >
        1. {t("Create New Character")}
      </Button>

      {/* Separator Text */}
      <Text weight="semibold" size={400}>
        {t("OR")}
      </Text>

      {/* Option 2: Drop Area for Uploading Character Card */}
      <div
        className={`${styles.dropArea} ${
          dragHighlight ? styles.dropAreaHighlight : ""
        }`}
        {...dragEvents}
        onClick={() => document.getElementById("fileInput")?.click()}
        style={{
          // The styles.dropArea class provides most of the appearance.
          // Add width constraints here to manage its size effectively within the centered flex layout.
          width: "100%", // Allows the drop area to be responsive.
          maxWidth: "600px", // Prevents the drop area from becoming too wide on large screens.
          // Adjust this value as needed for optimal visual balance.
          // The `display: characterCard ? "none" : undefined` is removed from here,
          // as it's now handled by the parent wrapper div.
        }}
      >
        {isLoading ? (
          <Spinner labelPosition="below" label={t("Processing card...")} />
        ) : (
          <>
            <Text size={400}>
              2. {t("Drag & Drop Character Card Image Here")}
            </Text>
            <Text
              size={300}
              style={{ marginTop: tokens.spacingVerticalSNudge }}
            >
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
          // 支持 png webp json
          accept="image/png,image/webp,application/json"
          onChange={(e) =>
            e.target.files &&
            e.target.files.length > 0 &&
            handleFileDrop(e.target.files[0])
          }
        />
      </div>

      <Text weight="semibold" size={400}>
        {t("OR")}
      </Text>
      {/* Option 3: 从图片url提取 */}
      <div style={{ width: "40vw" }}>
        <Field label={"3. " + t("Load image from url")}>
          <Input
            placeholder="https://example.com/avatar.png"
            onChange={(e) => {
              const avatarUrl = e.target.value;
              setLoadFromUrl(avatarUrl);
            }}
            contentAfter={
              <Button
                appearance="transparent"
                size="small"
                onClick={handleLoadFromUrl}
              >
                {t("Load")}
              </Button>
            }
          />
        </Field>
      </div>

      {/* Option 3: 复制粘贴文件 */}
      <Text weight="semibold" size={400}>
        {t("OR")}
      </Text>
      <p>
        <Text weight="semibold" size={400}>
          4. {t("Copy/Paste character card current page will auto detect")}
        </Text>
      </p>
    </div>
  );
};
