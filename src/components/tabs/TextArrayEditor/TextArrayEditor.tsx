import {
  Button,
  Input,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import {
  AddRegular,
  DeleteRegular,
  ArrowUpRegular,
  ArrowDownRegular,
  ReOrderRegular,
} from "@fluentui/react-icons";
import { nanoid } from "nanoid";
import React, { useState, useEffect, useCallback } from "react";
import { FullscreenEditor } from "../../edit/FullscreenEditor";

// Styles for the TextArrayEditor
const useTextArrayEditorStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  input: {
    flexGrow: 1,
  },
  actions: {
    display: "flex",
    ...shorthands.gap(tokens.spacingHorizontalXS),
  },
  dragHandle: {
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    color: tokens.colorNeutralForeground3,
    ":active": {
      cursor: "grabbing",
    },
  },
  addButton: {
    alignSelf: "flex-start", // Align add button to the left
    marginTop: tokens.spacingVerticalS,
  },
});

interface TextArrayItem {
  id: string; // For stable key during re-rendering and drag-n-drop
  value: string;
}

export interface TextArrayEditorProps {
  value: string[];
  onChange: (ev: any, d: { value: string[] }) => void;
  label?: string; // Optional label for the whole editor
  inputPlaceholder?: string;
  addButtonLabel?: string;
}

export const TextArrayEditor: React.FC<TextArrayEditorProps> = ({
  value,
  onChange,
  inputPlaceholder = "Enter text...",
  addButtonLabel = "Add Item",
}) => {
  const styles = useTextArrayEditorStyles();
  const [items, setItems] = useState<TextArrayItem[]>([]);

  // Sync internal state when `value` prop changes
  useEffect(() => {
    setItems((value || []).map((val) => ({ id: nanoid(), value: val })));
  }, [value]);

  const handleItemChange = (id: string, newValue: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, value: newValue } : item
    );
    setItems(newItems);
    onChange({}, { value: newItems.map((item) => item.value) });
  };

  const handleAddItem = () => {
    const newItems = [...items, { id: nanoid(), value: "" }];
    setItems(newItems);
    // For an immediate new item, don't call onChange until it has content,
    // or call it if empty items are desired. Let's call it.
    onChange({}, { value: newItems.map((item) => item.value) });
  };

  const handleDeleteItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    onChange({}, { value: newItems.map((item) => item.value) });
  };

  const handleMoveItem = (id: string, direction: "up" | "down") => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const newItems = [...items];
    const itemToMove = newItems.splice(index, 1)[0];

    if (direction === "up" && index > 0) {
      newItems.splice(index - 1, 0, itemToMove);
    } else if (direction === "down" && index < items.length) {
      // items.length because splice removed one
      newItems.splice(index + 1, 0, itemToMove);
    } else {
      // Cannot move further, put it back
      newItems.splice(index, 0, itemToMove);
      return;
    }
    setItems(newItems);
    onChange({}, { value: newItems.map((item) => item.value) });
  };

  // --- Drag and Drop ---
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id);
    // Optional: You can set drag image or data
    // e.dataTransfer.setData('text/plain', id);
    // e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    targetId: string
  ) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedItemId === null || draggedItemId === targetId) return;

    // Visual feedback for drop target (optional, can be done with CSS :hover/:focus)
    // e.currentTarget.style.borderTop = '2px dashed blue'; // Example
  };

  // const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  //   e.currentTarget.style.borderTop = ''; // Clear visual feedback
  // };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    // e.currentTarget.style.borderTop = ''; // Clear visual feedback

    if (draggedItemId === null || draggedItemId === targetId) return;

    const newItems = [...items];
    const draggedItemIndex = newItems.findIndex(
      (item) => item.id === draggedItemId
    );
    const targetItemIndex = newItems.findIndex((item) => item.id === targetId);

    if (draggedItemIndex === -1 || targetItemIndex === -1) return;

    const [draggedItem] = newItems.splice(draggedItemIndex, 1);
    // Adjust target index if dragged item was before target
    const finalTargetIndex =
      draggedItemIndex < targetItemIndex
        ? targetItemIndex - 1
        : targetItemIndex;
    newItems.splice(finalTargetIndex, 0, draggedItem);

    setItems(newItems);
    onChange({}, { value: newItems.map((item) => item.value) });
    setDraggedItemId(null);
  };

  return (
    <div className={styles.root}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={styles.itemRow}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          // onDragLeave={handleDragLeave} // Optional for clearing hover effects
          onDrop={(e) => handleDrop(e, item.id)}
        >
          <div
            className={styles.dragHandle}
            title="Drag to reorder"
            // This makes the handle itself draggable, not the whole row.
            // If you want the whole row draggable, remove draggable from here
            // and ensure the `onDragStart` on the parent `div` handles it.
            // For simplicity, we're making the whole row draggable.
            // draggable
            // onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, item.id);}}
          >
            <ReOrderRegular />
          </div>
          <FullscreenEditor
            className={styles.input}
            value={item.value}
            onChange={(_, data) => handleItemChange(item.id, data.value)}
            placeholder={inputPlaceholder}
          />
          <div className={styles.actions}>
            <Button
              icon={<ArrowUpRegular />}
              aria-label="Move up"
              onClick={() => handleMoveItem(item.id, "up")}
              disabled={index === 0}
              size="small"
            />
            <Button
              icon={<ArrowDownRegular />}
              aria-label="Move down"
              onClick={() => handleMoveItem(item.id, "down")}
              disabled={index === items.length - 1}
              size="small"
            />
            <Button
              icon={<DeleteRegular />}
              aria-label="Delete item"
              onClick={() => handleDeleteItem(item.id)}
              size="small"
              appearance="subtle"
            />
          </div>
        </div>
      ))}
      <Button
        className={styles.addButton}
        icon={<AddRegular />}
        onClick={handleAddItem}
        appearance="outline"
      >
        {addButtonLabel}
      </Button>
    </div>
  );
};
