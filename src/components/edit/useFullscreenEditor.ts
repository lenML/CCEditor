import { useEffect, useState } from "react";

export function useFullscreenEditor({
  value,
  defaultValue,
  onChange,
  isControlled,
}: {
  value?: string;
  defaultValue?: string | number | readonly string[];
  onChange?: (...args: any[]) => void;
  isControlled: boolean;
}) {
  const [internalValue, setInternalValue] = useState(
    defaultValue ? String(defaultValue) : ""
  );
  const currentValue = isControlled ? value ?? "" : internalValue;
  const [open, setOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [editorValue, setEditorValue] = useState(currentValue);

  useEffect(() => {
    if (open) setEditorValue(currentValue);
  }, [currentValue, open]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>, data: any) => {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event, data);
  };

  const applyChanges = () => {
    if (editorValue === currentValue) {
      setOpen(false);
      return;
    }
    if (!isControlled) setInternalValue(editorValue);
    onChange?.(
      { target: { value: editorValue } } as React.ChangeEvent<HTMLTextAreaElement>,
      { value: editorValue }
    );
    setOpen(false);
  };

  const cancelEditing = () => {
    if (editorValue !== currentValue) setConfirmClose(true);
    else setOpen(false);
  };

  const confirmCancel = () => {
    setConfirmClose(false);
    setOpen(false);
  };

  return {
    currentValue,
    editorValue,
    open,
    confirmClose,
    setEditorValue,
    setOpen,
    setConfirmClose,
    handleChange,
    applyChanges,
    cancelEditing,
    confirmCancel,
  };
}
