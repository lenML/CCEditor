import {
  Button,
  Card,
  Text,
  Tooltip,
} from "@fluentui/react-components";
import { Delete24Regular, ChevronUp24Regular, ChevronDown24Regular } from "@fluentui/react-icons";
import { useState, type FC } from "react";
import { useStyles } from "../useStyles";
import { useI18n } from "../../tools/i18n";
import type { SpecV3 } from "@lenml/char-card-reader";
import { encodeToTokens } from "../../tools/tokenizer";
import { BookEntryExpandedFields } from "./BookEntryExpandedFields";

export const BookEntryEditor: FC<{
  entry: SpecV3.Lorebook["entries"][number];
  index: number;
  card_keys?: string[];
  onUpdateEntry: (index: number, entry: any) => void;
  onDeleteEntry: (index: number) => void;
}> = ({ entry, index, card_keys, onUpdateEntry, onDeleteEntry }) => {
  const styles = useStyles();
  const t = useI18n();
  const [expanded, setExpanded] = useState(false);

  const updateField = (field: string, value: any) => {
    onUpdateEntry(index, { ...entry, [field]: value });
  };

  const updateBoolean = (field: string, checked: boolean) => {
    onUpdateEntry(index, { ...entry, [field]: checked });
  };

  let entryTitle = entry.comment;
  if (!entryTitle && entry.content.trim()) {
    entryTitle =
      entry.content
        .split("\n")
        .filter((line) => line.trim())[0]
        .slice(0, 5) + "...";
  }

  return (
    <Card className={styles.bookEntryCard}>
      <div className={styles.bookEntryHeader}>
        <span>
          <Tooltip
            relationship="label"
            content={expanded ? t("Collapse") : t("Expand")}
          >
            <Button
              icon={expanded ? <ChevronUp24Regular /> : <ChevronDown24Regular />}
              appearance="subtle"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? t("Collapse") : t("Expand")}
            />
          </Tooltip>
          <Text weight="semibold">
            Entry {index + 1} {entryTitle ? `(${entryTitle})` : ""}
          </Text>
          {!expanded && (
            <Text
              style={{
                fontSize: "12px",
                marginLeft: "1rem",
                display: "inline-block",
                textAlign: "right",
              }}
            >
              {t("word_count", {
                chars: entry.content.split("").length,
                tokens: encodeToTokens(entry.content).length,
              })}
            </Text>
          )}
        </span>
        <div>
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
      {expanded && (
        <BookEntryExpandedFields
          entry={entry}
          index={index}
          cardKeys={card_keys}
          onUpdate={updateField}
          onBooleanChange={updateBoolean}
        />
      )}
    </Card>
  );
};
