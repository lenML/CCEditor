import React, { useState, useEffect, useRef } from "react";
import {
  Textarea,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
  Text,
} from "@fluentui/react-components";
import {
  Dismiss24Regular,
  FullScreenMaximizeFilled,
} from "@fluentui/react-icons";
import { Editor } from "@monaco-editor/react";
import useResizeObserver from "@react-hook/resize-observer";
import { editor } from "monaco-editor";
import { useI18n } from "../../tools/i18n";
import { encodeToTokens } from "../../tools/tokenizer";

interface FullscreenEditorProps {
  window_title?: string;
  editor_language?: string;
}

export function FullscreenEditor(
  props: React.ComponentProps<typeof Textarea> & FullscreenEditorProps
) {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    window_title = "Editor",
    editor_language = "markdown",
    ...rest
  } = props;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const currentValue = isControlled ? controlledValue : internalValue;

  const [editorValue, setEditorValue] = useState(currentValue || "");

  const dirty = editorValue !== currentValue;

  useResizeObserver(containerRef, () => {
    editorRef.current?.layout();
  });

  useEffect(() => {
    if (open) {
      setEditorValue(currentValue || "");
    }
  }, [currentValue, open]);

  const handleChange = (
    ev: React.ChangeEvent<HTMLTextAreaElement>,
    data: any
  ) => {
    if (!isControlled) setInternalValue(ev.target.value);
    onChange?.(ev, data);
  };

  const applyChanges = () => {
    if (!dirty) return;
    if (!isControlled) setInternalValue(editorValue);
    onChange?.(
      {
        target: { value: editorValue },
      } as React.ChangeEvent<HTMLTextAreaElement>,
      { value: editorValue }
    );
    setOpen(false);
  };

  const cancelEditing = () => {
    if (dirty) {
      setConfirmClose(true);
    } else {
      setOpen(false);
    }
  };

  const confirmCancel = () => {
    setConfirmClose(false);
    setOpen(false);
  };

  const t = useI18n();

  return (
    <>
      <div className="relative w-full group">
        <Button
          icon={<FullScreenMaximizeFilled />}
          appearance="secondary"
          onClick={() => setOpen(true)}
          className="absolute top-1 left-1 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 ease-in-out"
          title={t("Fullscreen Edit")}
        />
        <Textarea
          {...rest}
          value={currentValue}
          onChange={handleChange}
          className="w-full mt-6"
          resize="vertical"
        />
        <Text
          style={{
            fontSize: "12px",
            marginTop: 4,
            display: "block",
            textAlign: "right",
          }}
        >
          {t("word_count", {
            chars: currentValue.split("").length,
            tokens: encodeToTokens(currentValue).length,
          })}
        </Text>
      </div>

      {/* Main Editor Dialog */}
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface
          aria-describedby={undefined}
          style={{ minWidth: "90vw", minHeight: "90vh", display: "flex" }}
        >
          <DialogBody style={{ flex: 1 }}>
            <DialogTitle
              action={
                <Button
                  appearance="transparent"
                  aria-label="close"
                  icon={<Dismiss24Regular />}
                  onClick={cancelEditing}
                />
              }
            >
              <Text size={500} weight="bold">
                {window_title}
              </Text>
            </DialogTitle>
            <DialogContent ref={containerRef as any}>
              <Editor
                width="100%"
                height="100%"
                defaultLanguage={editor_language}
                theme="vs-dark"
                value={editorValue}
                onChange={(val) => setEditorValue(val ?? "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  wordWrap: "on",
                }}
                onMount={(editorInstance) => {
                  editorRef.current = editorInstance;
                }}
              />
              <Text
                style={{
                  position: "absolute",
                  bottom: "2rem",
                  left: "2rem",
                  fontSize: "12px",
                  marginTop: 4,
                  display: "block",
                  textAlign: "right",
                  // 主要是移动端会遮挡按钮
                  pointerEvents: "none",
                }}
              >
                {editor_language.toUpperCase()} |{" "}
                {t("word_count", {
                  chars: currentValue.split("").length,
                  tokens: encodeToTokens(currentValue).length,
                })}
              </Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={cancelEditing}>
                {t("cancel")}
              </Button>
              <Button
                appearance="primary"
                onClick={applyChanges}
                disabled={!dirty}
              >
                {t("apply")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Confirm Close Dialog */}
      <Dialog
        open={confirmClose}
        onOpenChange={(_, data) => setConfirmClose(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("confirm_cancel_title")}</DialogTitle>
            <DialogContent>{t("confirm_cancel_content")}</DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setConfirmClose(false)}
              >
                {t("continue_edit")}
              </Button>
              <Button appearance="primary" onClick={confirmCancel}>
                {t("discard_changes")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
