import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Divider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Text,
  tokens,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { useStyles } from "./useStyles";
import { useI18n } from "../tools/i18n";
import { useEditorStore } from "../store/editorStore";

export function HistoryDrawer() {
  const styles = useStyles();
  const t = useI18n();
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const history = useEditorStore((state) => state.history);
  const open = useEditorStore((state) => state.isHistoryDrawerOpen);
  const setOpen = useEditorStore((state) => state.setHistoryDrawerOpen);
  const loadHistory = useEditorStore((state) => state.loadHistory);
  const clearHistory = useEditorStore((state) => state.clearHistory);

  const handleLoad = (index: number) => {
    if (useEditorStore.getState().isDirty) setPendingIndex(index);
    else loadHistory(index);
  };

  const confirmLoad = () => {
    if (pendingIndex != null) loadHistory(pendingIndex);
    setPendingIndex(null);
  };

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear all history?")) {
      await clearHistory();
    }
  };

  return (
    <>
      <Drawer
        type="overlay"
        separator
        open={open}
        onOpenChange={(_, { open: nextOpen }) => setOpen(nextOpen)}
        position="end"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={() => setOpen(false)}
              />
            }
          >
            {t("Card History")}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody className={styles.historyDrawerBody}>
          {history.length > 0 ? (
            <>
              <div style={{ flex: 1 }}>
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className={styles.historyItem}
                    onClick={() => handleLoad(index)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") handleLoad(index);
                    }}
                  >
                    <Text className={styles.historyItemName}>
                      {item.card.data.name || t("Unnamed Card")}
                    </Text>
                    <Text className={styles.historyItemDate}>
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                  </div>
                ))}
              </div>
              <Divider
                style={{ margin: `${tokens.spacingVerticalM} 0`, flex: 0 }}
              />
              <Button
                appearance="outline"
                onClick={() => void handleClear()}
                style={{ alignSelf: "center" }}
              >
                {t("Clear All History")}
              </Button>
            </>
          ) : (
            <Text style={{ textAlign: "center" }}>{t("No history yet.")}</Text>
          )}
        </DrawerBody>
      </Drawer>

      <Dialog
        open={pendingIndex != null}
        onOpenChange={(_, data) => {
          if (!data.open) setPendingIndex(null);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("Unsaved Changes")}</DialogTitle>
            <DialogContent>
              {t(
                "You have unsaved changes. Are you sure you want to load from history? This will discard current changes."
              )}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => setPendingIndex(null)}>
                  {t("Cancel")}
                </Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={confirmLoad}>
                {t("Load from History")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
