import type { FC } from "react";
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

export const CharacterBookTab: FC<{
  bookData: any;
  onBookChange: (bookData: any) => void;
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
    const newEntry = {
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
      id: Date.now(), // Simple unique ID
    };
    onBookChange({
      ...bookData,
      entries: [...(bookData.entries || []), newEntry],
    });
  };

  const handleDeleteEntry = (index: any) => {
    const newEntries = (bookData.entries || []).filter(
      (_: any, i: any) => i !== index
    );
    onBookChange({ ...bookData, entries: newEntries });
  };

  const t = useI18n();

  return (
    <div>
      <Field label={t("Book Name")}>
        <Input
          value={bookData?.name || ""}
          onChange={(_: any, data: { value: any }) =>
            handleBookNameChange(data.value)
          }
        />
      </Field>
      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />
      {(bookData?.entries || []).map((entry: { id: any }, index: any) => (
        <BookEntryEditor
          key={entry.id || index} // Prefer a stable ID if available
          entry={entry}
          index={index}
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
