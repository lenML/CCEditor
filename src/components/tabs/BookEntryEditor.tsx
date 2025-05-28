import {
  tokens,
  Button,
  Input,
  Textarea,
  Field,
  Card,
  Text,
  Tooltip,
  Switch,
  Dropdown,
  Option,
  Label,
} from "@fluentui/react-components";

import {
  Delete24Regular,
  ChevronUp24Regular,
  ChevronDown24Regular,
} from "@fluentui/react-icons";
import { useState, type FC } from "react";
import { useStyles } from "../useStyles";
import { FullscreenEditor } from "../edit/FullscreenEditor";
import { useI18n } from "../../tools/i18n";
import { FreeTagPicker } from "../fields/TagPicker";
import type { SpecV3 } from "@lenml/char-card-reader";
import { keysFix } from "../../tools/fixs";
import { CardFieldLabel } from "../HelpTips/CardFieldLabel";

export const BookEntryEditor: FC<{
  entry: SpecV3.Lorebook["entries"][number];
  index: number;
  // 当前卡片中的其他keys
  card_keys?: string[];
  onUpdateEntry: (index: number, entry: any) => void;
  onDeleteEntry: (index: number) => void;
}> = ({ entry, index, card_keys, onUpdateEntry, onDeleteEntry }) => {
  const styles = useStyles();

  const handleFieldChange = (field: string, value: any) => {
    onUpdateEntry(index, { ...entry, [field]: value });
  };

  const handleBooleanChange = (field: string, checked: boolean) => {
    onUpdateEntry(index, { ...entry, [field]: checked });
  };

  const positionOptions = [
    { key: "after_char", text: "After Character" },
    { key: "before_char", text: "Before Character" },
    { key: "before_authors_note", text: "Before Author's Note" },
    { key: "after_authors_note", text: "After Author's Note" },
  ];

  const t = useI18n();

  // 是否展开
  const [expanded, setExpanded] = useState(false);

  let entry_title = entry.comment;
  if (!entry_title && entry.content.trim()) {
    entry_title =
      entry.content
        .split("\n")
        .filter((x) => x.trim())[0]
        .slice(0, 5) + "...";
  }

  return (
    <Card className={styles.bookEntryCard}>
      <div className={styles.bookEntryHeader}>
        <Text weight="semibold">
          Entry {index + 1} {entry_title ? `(${entry_title})` : ""}
        </Text>
        <div>
          {/* 收起展开 */}
          <Tooltip
            relationship="label"
            content={expanded ? t("Collapse") : t("Expand")}
          >
            <Button
              icon={
                expanded ? <ChevronUp24Regular /> : <ChevronDown24Regular />
              }
              appearance="subtle"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? t("Collapse") : t("Expand")}
            />
          </Tooltip>

          <Tooltip content={t("Delete this entry")} relationship="label">
            <Button
              icon={<Delete24Regular />}
              appearance="subtle"
              onClick={() => onDeleteEntry(index)}
              aria-label="Delete entry"
            />
          </Tooltip>
        </div>
      </div>
      {expanded ? (
        <div className={styles.bookEntryGrid}>
          <Field label={t("Keys (comma-separated)")}>
            {/* <Input
            value={(entry.keys || []).join(", ")}
            onChange={(_, data) =>
              handleFieldChange(
                "keys",
                data.value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean)
              )
            }
          /> */}
            <FreeTagPicker
              options={card_keys}
              value={keysFix(entry.keys || [])}
              onChange={(keys) => handleFieldChange("keys", keys)}
            />
          </Field>
          <Field label={t("Secondary Keys (comma-separated)")}>
            {/* <Input
            value={(entry.secondary_keys || []).join(", ")}
            onChange={(_, data) =>
              handleFieldChange(
                "secondary_keys",
                data.value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean)
              )
            }
          /> */}
            <FreeTagPicker
              options={card_keys}
              value={keysFix(entry.secondary_keys || [])}
              onChange={(secondary_keys) =>
                handleFieldChange("secondary_keys", secondary_keys)
              }
            />
          </Field>
          <Field label={t("Comment")} className={styles.bookEntryFullWidth}>
            <Input
              value={entry.comment || ""}
              onChange={(_, data) => handleFieldChange("comment", data.value)}
            />
          </Field>
          <Field label={t("Content")} className={styles.bookEntryFullWidth}>
            <FullscreenEditor
              window_title={t("Content")}
              resize="vertical"
              value={entry.content || ""}
              onChange={(_, data) => handleFieldChange("content", data.value)}
            />
          </Field>
          <Field label={t("Insertion Order")}>
            <Input
              type="number"
              // @ts-ignore
              value={entry.insertion_order || 0}
              onChange={(_, data) =>
                handleFieldChange(
                  "insertion_order",
                  parseInt(data.value, 10) || 0
                )
              }
            />
          </Field>
          <Field label={t("Position")}>
            <Dropdown
              value={entry.position || "after_char"}
              onOptionSelect={(_: any, data: any) =>
                handleFieldChange("position", data.optionValue)
              }
            >
              {positionOptions.map((opt) => (
                <Option key={opt.key} value={opt.key}>
                  {opt.text}
                </Option>
              ))}
            </Dropdown>
          </Field>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.spacingVerticalXS,
            }}
          >
            <Label htmlFor={`constant-${index}`}>
              <Switch
                id={`constant-${index}`}
                checked={!!entry.constant}
                onChange={(_, data) =>
                  handleBooleanChange("constant", data.checked)
                }
              />{" "}
              Constant
            </Label>
            <Label htmlFor={`selective-${index}`}>
              <Switch
                id={`selective-${index}`}
                checked={!!entry.selective}
                onChange={(_, data) =>
                  handleBooleanChange("selective", data.checked)
                }
              />{" "}
              Selective
            </Label>
            <Label htmlFor={`enabled-${index}`}>
              <Switch
                id={`enabled-${index}`}
                checked={entry.enabled === undefined ? true : !!entry.enabled}
                onChange={(_, data) =>
                  handleBooleanChange("enabled", data.checked)
                }
              />{" "}
              Enabled
            </Label>
          </div>
          <div>
            {" "}
            {/* Placeholder for alignment, or add another field here */}{" "}
          </div>

          <Field
            label={t("Extensions (JSON)")}
            className={styles.bookEntryFullWidth}
          >
            <FullscreenEditor
              editor_language="json"
              resize="vertical"
              className={styles.readOnlyTextarea} // Re-use for similar look
              value={
                typeof entry.extensions === "string"
                  ? entry.extensions
                  : JSON.stringify(entry.extensions || {}, null, 2)
              }
              onChange={(_, data) => {
                try {
                  // Attempt to parse to ensure it's valid JSON for storage,
                  // but store as string if that's how it's being edited.
                  // Or, always store as object and stringify for display.
                  // For simplicity with textarea, let's assume user types JSON.
                  handleFieldChange("extensions", JSON.parse(data.value));
                } catch (e) {
                  // If invalid JSON, maybe store the raw string and show an error
                  // For now, this might lead to issues if not careful.
                  // A better approach is to parse on blur or have a validate button.
                  handleFieldChange("extensions", data.value); // Store string if parse fails
                  console.warn("Invalid JSON in entry extensions", e);
                }
              }}
            />
          </Field>
        </div>
      ) : null}
    </Card>
  );
};
