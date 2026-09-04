import {
  Dropdown,
  Field,
  Input,
  Label,
  Option,
  Switch,
  tokens,
} from "@fluentui/react-components";
import { useStyles } from "../useStyles";
import { useI18n } from "../../tools/i18n";
import { FullscreenEditor } from "../edit/FullscreenEditor";
import { FreeTagPicker } from "../fields/TagPicker";
import type { SpecV3 } from "@lenml/char-card-reader";
import { keysFix } from "../../tools/fixs";

type LoreEntry = SpecV3.Lorebook["entries"][number];

const positionOptions = [
  { key: "after_char", text: "After Character" },
  { key: "before_char", text: "Before Character" },
  { key: "before_authors_note", text: "Before Author's Note" },
  { key: "after_authors_note", text: "After Author's Note" },
];

export function BookEntryExpandedFields({
  entry,
  index,
  cardKeys,
  onUpdate,
  onBooleanChange,
}: {
  entry: LoreEntry;
  index: number;
  cardKeys?: string[];
  onUpdate: (field: string, value: any) => void;
  onBooleanChange: (field: string, checked: boolean) => void;
}) {
  const styles = useStyles();
  const t = useI18n();

  return (
    <div className={styles.bookEntryGrid}>
      <Field label={t("Keys (comma-separated)")}>
        <FreeTagPicker
          options={cardKeys}
          value={keysFix(entry.keys || [])}
          onChange={(keys) => onUpdate("keys", keys)}
        />
      </Field>
      <Field label={t("Secondary Keys (comma-separated)")}>
        <FreeTagPicker
          options={cardKeys}
          value={keysFix(entry.secondary_keys || [])}
          onChange={(secondaryKeys) => onUpdate("secondary_keys", secondaryKeys)}
        />
      </Field>
      <Field label={t("Comment")} className={styles.bookEntryFullWidth}>
        <Input
          value={entry.comment || ""}
          onChange={(_, data) => onUpdate("comment", data.value)}
        />
      </Field>
      <Field label={t("Content")} className={styles.bookEntryFullWidth}>
        <FullscreenEditor
          placeholder={t("no text here.")}
          window_title={t("Content")}
          resize="vertical"
          value={entry.content || ""}
          onChange={(_, data) => onUpdate("content", data.value)}
        />
      </Field>
      <Field label={t("Insertion Order")}>
        <Input
          type="number"
          value={String(entry.insertion_order ?? 0)}
          onChange={(_, data) =>
            onUpdate("insertion_order", parseInt(data.value, 10) || 0)
          }
        />
      </Field>
      <Field label={t("Position")}>
        <Dropdown
          value={entry.position || "after_char"}
          onOptionSelect={(_, data) => onUpdate("position", data.optionValue)}
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
            onChange={(_, data) => onBooleanChange("constant", data.checked)}
          />{" "}
          Constant
        </Label>
        <Label htmlFor={`selective-${index}`}>
          <Switch
            id={`selective-${index}`}
            checked={!!entry.selective}
            onChange={(_, data) => onBooleanChange("selective", data.checked)}
          />{" "}
          Selective
        </Label>
        <Label htmlFor={`enabled-${index}`}>
          <Switch
            id={`enabled-${index}`}
            checked={entry.enabled === undefined ? true : !!entry.enabled}
            onChange={(_, data) => onBooleanChange("enabled", data.checked)}
          />{" "}
          Enabled
        </Label>
      </div>
      <div>{" "}</div>
      <Field
        label={t("Extensions (JSON)")}
        className={styles.bookEntryFullWidth}
      >
        <FullscreenEditor
          placeholder={t("no text here.")}
          editor_language="json"
          resize="vertical"
          className={styles.readOnlyTextarea}
          value={
            typeof entry.extensions === "string"
              ? entry.extensions
              : JSON.stringify(entry.extensions || {}, null, 2)
          }
          onChange={(_, data) => {
            try {
              onUpdate("extensions", JSON.parse(data.value));
            } catch {
              onUpdate("extensions", data.value);
              console.warn("Invalid JSON in entry extensions");
            }
          }}
        />
      </Field>
    </div>
  );
}
