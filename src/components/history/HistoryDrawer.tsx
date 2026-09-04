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
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Input,
  Text,
} from "@fluentui/react-components";
import { Dismiss24Regular, Search24Regular } from "@fluentui/react-icons";
import type { CardRecord } from "../../db/types";
import { useEditorStore } from "../../store/editorStore";
import { useI18n } from "../../tools/i18n";
import { requestConfirm } from "../misc/requestConfirm";
import { HistoryCard } from "./HistoryCard";
import { useHistoryPool } from "./useHistoryPool";
import "./history-drawer.css";

export function HistoryDrawer() {
  const t = useI18n();
  const [pendingRecord, setPendingRecord] = useState<CardRecord | null>(null);

  const history = useEditorStore((state) => state.history);
  const open = useEditorStore((state) => state.isHistoryDrawerOpen);
  const setOpen = useEditorStore((state) => state.setHistoryDrawerOpen);
  const loadHistory = useEditorStore((state) => state.loadHistory);
  const deleteHistory = useEditorStore((state) => state.deleteHistory);
  const clearHistory = useEditorStore((state) => state.clearHistory);
  const isDirty = useEditorStore((state) => state.isDirty);

  const filters = useHistoryPool(history);

  const handleLoad = (record: CardRecord) => {
    if (isDirty) {
      setPendingRecord(record);
      return;
    }
    loadHistory(record.id);
  };

  const confirmLoad = () => {
    if (pendingRecord) loadHistory(pendingRecord.id);
    setPendingRecord(null);
  };

  const handleDelete = async (record: CardRecord) => {
    const confirmed = await requestConfirm({
      title: t("Delete"),
      content: [
        record.card.data.name || t("Unnamed Card"),
        t("Delete this card from history?"),
      ].join("\n\n"),
    });
    if (confirmed) await deleteHistory(record.id);
  };

  const handleClear = async () => {
    const confirmed = await requestConfirm({
      title: t("Clear All History"),
      content: t("Clear all history? This action cannot be undone."),
    });
    if (confirmed) await clearHistory();
  };

  return (
    <>
      <Drawer
        type="overlay"
        separator
        size="large"
        open={open}
        onOpenChange={(_, data) => setOpen(data.open)}
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
        <DrawerBody className="history-drawer-body">
          <div className="history-toolbar">
            <Input
              className="history-search"
              contentBefore={<Search24Regular />}
              value={filters.query}
              onChange={(_, data) => filters.setQuery(data.value)}
              placeholder={t("Search cards...")}
            />
            <div className="history-controls">
              <select
                className="history-select"
                aria-label={t("All Tags")}
                value={filters.selectedTag}
                onChange={(event) => filters.setSelectedTag(event.target.value)}
              >
                <option value="all">{t("All Tags")}</option>
                {filters.tags.map((tag) => (
                  <option key={tag} value={tag.toLowerCase()}>
                    {tag}
                  </option>
                ))}
              </select>
              <select
                className="history-select"
                aria-label={t("All Sources")}
                value={filters.selectedSource}
                onChange={(event) => filters.setSelectedSource(event.target.value)}
              >
                <option value="all">{t("All Sources")}</option>
                {filters.sources.map((source) => (
                  <option key={source} value={source.toLowerCase()}>
                    {source}
                  </option>
                ))}
              </select>
              <select
                className="history-select"
                aria-label={t("All Versions")}
                value={filters.selectedVersion}
                onChange={(event) => filters.setSelectedVersion(event.target.value)}
              >
                <option value="all">{t("All Versions")}</option>
                {filters.versions.map((version) => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </div>
            {history.length > 0 && (
              <Text className="history-count">
                {filters.filtered.length} / {history.length}
              </Text>
            )}
          </div>

          {filters.filtered.length > 0 ? (
            <div className="history-grid">
              {filters.filtered.map((record) => (
                <HistoryCard
                  key={record.id}
                  record={record}
                  onLoad={() => handleLoad(record)}
                  onDelete={() => void handleDelete(record)}
                />
              ))}
            </div>
          ) : (
            <div className="history-empty">
              <Text>{history.length ? t("No matching cards") : t("No history yet.")}</Text>
            </div>
          )}

          {history.length > 0 && (
            <div className="history-footer">
              <Button appearance="outline" onClick={() => void handleClear()}>
                {t("Clear All History")}
              </Button>
            </div>
          )}
        </DrawerBody>
      </Drawer>

      <Dialog
        open={pendingRecord != null}
        onOpenChange={(_, data) => {
          if (!data.open) setPendingRecord(null);
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
                <Button appearance="secondary" onClick={() => setPendingRecord(null)}>
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
