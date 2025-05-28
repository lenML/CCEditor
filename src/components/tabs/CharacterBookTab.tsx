import { useMemo, type FC } from "react";
import { useStyles } from "../useStyles";

import {
  tokens,
  Button,
  Input,
  Field,
  Divider,
} from "@fluentui/react-components";
import { BookEntryEditor } from "./BookEntryEditor";
import { Add24Regular } from "@fluentui/react-icons";
import { useI18n } from "../../tools/i18n";
import type { SpecV3 } from "@lenml/char-card-reader";
import { keysFix } from "../../tools/fixs";
import { CardFieldLabel } from "../HelpTips/CardFieldLabel";

export const CharacterBookTab: FC<{
  bookData: SpecV3.Lorebook;
  onBookChange: (bookData: SpecV3.Lorebook) => void;
}> = ({ bookData, onBookChange }) => {
  const styles = useStyles();

  const handleBookNameChange = (newName: any) => {
    onBookChange({ ...bookData, name: newName });
  };

  const handleUpdateEntry = (index: number, updatedEntry: any) => {
    const newEntries = [...(bookData.entries || [])];
    newEntries[index] = updatedEntry;
    onBookChange({ ...bookData, entries: newEntries });
  };

  const handleAddEntry = () => {
    const newEntry: SpecV3.Lorebook["entries"][number] = {
      keys: [],
      secondary_keys: [],
      comment: "",
      content: "",
      constant: false,
      selective: false,
      insertion_order: (bookData.entries?.length || 0) + 1 * 100,
      enabled: true,
      position: "after_char",
      extensions: {},
      use_regex: false,
      id: Date.now(), // Simple unique ID
    };
    onBookChange({
      ...bookData,
      entries: [...(bookData.entries || []), newEntry],
    });
  };

  const handleDeleteEntry = (index: any) => {
    const isConfirm = window.confirm(
      t("Are you sure you want to delete this entry?")
    );
    if (!isConfirm) return;

    const newEntries = (bookData.entries || []).filter(
      (_: any, i: any) => i !== index
    );
    onBookChange({ ...bookData, entries: newEntries });
  };

  const t = useI18n();

  const total_keys = useMemo(() => {
    return Array.from(
      new Set(
        bookData.entries.flatMap((x) => [
          ...keysFix(x.keys || []),
          ...keysFix(x.secondary_keys || []),
        ])
      )
    );
  }, [bookData]);

  return (
    <div>
      <Field
        label={
          <CardFieldLabel
            name={"character_book"}
            label={t("Book Name")}
            tips={t(`help-character_book`)}
          />
        }
      >
        <Input
          value={bookData?.name || ""}
          onChange={(_: any, data: { value: any }) =>
            handleBookNameChange(data.value)
          }
        />
      </Field>
      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />
      {(bookData?.entries || []).map((entry: any, index: any) => (
        <BookEntryEditor
          key={entry.id || index} // Prefer a stable ID if available
          entry={entry}
          index={index}
          card_keys={total_keys}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
        />
      ))}
      <div className={styles.bookActions}>
        <Button icon={<Add24Regular />} onClick={handleAddEntry}>
          Add Entry
        </Button>
      </div>
    </div>
  );
};
