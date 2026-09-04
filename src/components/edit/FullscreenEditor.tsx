import React, { useRef } from "react";
import {
  Textarea,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Text,
} from "@fluentui/react-components";
import {
  Dismiss24Regular,
  FullScreenMaximizeFilled,
} from "@fluentui/react-icons";
import { Editor } from "@monaco-editor/react";
import useResizeObserver from "@react-hook/resize-observer";
import type { editor } from "monaco-editor";
import { useI18n } from "../../tools/i18n";
import { encodeToTokens } from "../../tools/tokenizer";
import { useFullscreenEditor } from "./useFullscreenEditor";

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
    placeholder = "no text here.",
    ...rest
  } = props;

  const isControlled = controlledValue !== undefined;
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const {
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
  } = useFullscreenEditor({
    value: controlledValue,
    defaultValue,
    onChange,
    isControlled,
  });

  const dirty = editorValue !== currentValue;
  useResizeObserver(containerRef, () => {
    editorRef.current?.layout();
  });

  const t = useI18n();

  return (
    <>
      <div className="relative w-full group">
        <Button
          icon={<FullScreenMaximizeFilled />}
          appearance="secondary"
          onClick={() => setOpen(true)}
          className="absolute top-1 left-1 z-10 opacity-100 transition-opacity duration-150 ease-in-out"
          title={t("Fullscreen Edit")}
        />
        <Textarea
          placeholder={placeholder}
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
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monaco.languages.registerCompletionItemProvider("markdown", {
                    provideCompletionItems(model, position, context, token) {
                      void context;
                      void token;
                      return {
                        suggestions: [
                          {
                            label: t("Template"),
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            documentation: t("Persona template"),
                            insertTextRules:
                              monaco.languages.CompletionItemInsertTextRule
                                .InsertAsSnippet,
                            insertText: `<worldview>
$\{1:${t("worldview")}}
</worldview>

<character name="$\{2:${t("character name")}}">
job: $\{3:${t("character job")}}
appearance: $\{2:${t("character name")}} $\{4:${t("character description")}}
personalities: $\{5:${t("character personality")}}
skills: $\{6:${t("character skills")}}
$\{7:${t("other settings")}}
</character>`,
                            range: {
                              startLineNumber: position.lineNumber,
                              startColumn: position.column - 1,
                              endLineNumber: position.lineNumber,
                              endColumn: position.column,
                            },
                          },
                        ],
                      };
                    },
                  });
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
