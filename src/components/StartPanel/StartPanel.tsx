import { Button, Field, Input, Spinner, Text } from "@fluentui/react-components";
import {
  Add24Regular,
  ArrowImport24Regular,
  Copy24Regular,
  FolderOpen24Regular,
  History24Regular,
  Link24Regular,
  Open24Regular,
} from "@fluentui/react-icons";
import { useCardImport } from "./useCardImport";
import { ShareLinkDialog } from "./ShareLinkDialog";
import { useI18n } from "../../tools/i18n";
import { useEditorStore } from "../../store/editorStore";
import type { CardRecord } from "../../db/types";
import "./start-panel.css";

function initials(name: string) {
  const first = name.trim().charAt(0).toUpperCase();
  return first || "?";
}

function RecentCard({ record, onLoad }: { record: CardRecord; onLoad: () => void }) {
  const name = record.card.data.name?.trim() || "Unnamed Card";
  return (
    <button
      type="button"
      className="start-recent-item"
      onClick={onLoad}
      title={name}
    >
      <span className="start-recent-avatar">
        {record.avatarUrl ? (
          <img src={record.avatarUrl} alt="" />
        ) : (
          <span>{initials(name)}</span>
        )}
      </span>
      <span className="start-recent-item-text">
        <strong>{name}</strong>
        <small>{new Date(record.updatedAt).toLocaleDateString()}</small>
      </span>
    </button>
  );
}

export function StartPanel() {
  const t = useI18n();
  const {
    isLoading,
    dragHighlight,
    dragEvents,
    loadFromUrl,
    setLoadFromUrl,
    handleLoadFromUrl,
    showShareModal,
    shareModal,
    setShareModal,
    createNew,
    handleFileSelect,
  } = useCardImport();

  const history = useEditorStore((state) => state.history);
  const openHistory = useEditorStore((state) => state.setHistoryDrawerOpen);
  const loadHistory = useEditorStore((state) => state.loadHistory);

  const selectFile = () => {
    document.getElementById("fileInput")?.click();
  };

  return (
    <div className="start-panel-root">
      <div className="start-shell">
        <section className="start-main">
          <div className="start-brand">
            <span className="start-brand-mark">CC</span>
            <span>Character Card Editor</span>
          </div>
          <h1 className="start-heading">{t("Start")}</h1>
          <p className="start-subtitle">
            {t(
              "A local workspace for creating, importing, and refining character cards."
            )}
          </p>

          <div className="start-command-list">
            <button
              type="button"
              className="start-command"
              onClick={() => void createNew()}
            >
              <span className="start-command-icon">
                <Add24Regular />
              </span>
              <span className="start-command-copy">
                <strong>{t("Create New Character")}</strong>
                <small>JSON / PNG / WebP / Charx</small>
              </span>
            </button>
            <button type="button" className="start-command" onClick={selectFile}>
              <span className="start-command-icon">
                <FolderOpen24Regular />
              </span>
              <span className="start-command-copy">
                <strong>{t("Select File")}</strong>
                <small>(.png, .webp, .jpg, .json)</small>
              </span>
            </button>
            <button
              type="button"
              className="start-command"
              onClick={() => document.getElementById("start-url-input")?.focus()}
            >
              <span className="start-command-icon">
                <Link24Regular />
              </span>
              <span className="start-command-copy">
                <strong>{t("Load image from url")}</strong>
                <small>https://example.com/avatar.png</small>
              </span>
            </button>
          </div>

          <div className="start-recent">
            <div className="start-recent-head">
              <h2>{t("Card History")}</h2>
              <Button
                appearance="transparent"
                size="small"
                icon={<History24Regular />}
                onClick={() => openHistory(true)}
              >
                {t("View History")}
              </Button>
            </div>
            {history.length > 0 ? (
              <div className="start-recent-grid">
                {history.slice(0, 6).map((record) => (
                  <RecentCard
                    key={record.id}
                    record={record}
                    onLoad={() => loadHistory(record.id)}
                  />
                ))}
              </div>
            ) : (
              <Text size={300}>{t("No history yet.")}</Text>
            )}
          </div>
        </section>

        <aside className="start-aside">
          <div
            className={`start-drop ${dragHighlight ? "start-drop-highlight" : ""}`}
            {...dragEvents}
            onClick={selectFile}
          >
            {isLoading ? (
              <Spinner labelPosition="below" label={t("Processing card...")} />
            ) : (
              <>
                <span className="start-command-icon">
                  <ArrowImport24Regular />
                </span>
                <Text className="start-drop-title">
                  {t("Drag & Drop Character Card Image Here")}
                </Text>
                <Text className="start-drop-note">
                  {t("Copy/Paste character card current page will auto detect")}
                </Text>
              </>
            )}
            <input
              type="file"
              id="fileInput"
              className="start-file-input"
              accept="image/png,image/webp,application/json"
              onChange={(event) => handleFileSelect(event.target.files?.[0])}
            />
          </div>

          <div className="start-url-card">
            <Field label={`${t("Load image from url")}`}>
              <Input
                id="start-url-input"
                type="url"
                placeholder="https://example.com/avatar.png"
                value={loadFromUrl}
                onChange={(_, data) => setLoadFromUrl(data.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleLoadFromUrl();
                }}
              />
            </Field>
            <div className="start-url-actions">
              {loadFromUrl && (
                <Button
                  appearance="transparent"
                  size="small"
                  icon={<Link24Regular />}
                  onClick={showShareModal}
                >
                  {t("Share")}
                </Button>
              )}
              <Button
                appearance="primary"
                size="small"
                icon={<Open24Regular />}
                onClick={() => void handleLoadFromUrl()}
              >
                {t("Load")}
              </Button>
            </div>
          </div>

          <div className="start-paste-hint">
            <Copy24Regular />
            <Text>{t("Copy/Paste character card current page will auto detect")}</Text>
          </div>
        </aside>
      </div>

      <ShareLinkDialog
        open={shareModal.open}
        url={shareModal.url}
        onClose={() => setShareModal({ open: false, url: "" })}
      />
    </div>
  );
}
