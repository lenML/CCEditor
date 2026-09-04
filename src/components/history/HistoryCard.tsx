import { Button, Text, Tooltip } from "@fluentui/react-components";
import { Delete24Regular } from "@fluentui/react-icons";
import type { CardRecord } from "../../db/types";
import { useI18n } from "../../tools/i18n";

function initials(name: string) {
  const first = name.trim().charAt(0).toUpperCase();
  return first || "?";
}

export function HistoryCard({
  record,
  onLoad,
  onDelete,
}: {
  record: CardRecord;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const t = useI18n();
  const data = record.card.data;
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const name = data.name?.trim() || t("Unnamed Card");
  const meta = [
    data.creator?.trim() || data.nickname?.trim(),
    new Date(record.updatedAt).toLocaleDateString(),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className="history-card"
      role="button"
      tabIndex={0}
      aria-label={name}
      onClick={onLoad}
      onKeyDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onLoad();
        }
      }}
    >
      <div className="history-card-art">
        {record.avatarUrl ? (
          <img src={record.avatarUrl} alt="" />
        ) : (
          <div className="history-card-fallback">{initials(name)}</div>
        )}
      </div>
      <div className="history-card-body">
        <div className="history-card-top">
          <Text className="history-card-name">{name}</Text>
          <Tooltip content={t("Delete")} relationship="label">
            <Button
              className="history-card-delete"
              size="small"
              appearance="transparent"
              icon={<Delete24Regular />}
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            />
          </Tooltip>
        </div>
        <Text className="history-card-meta">{meta}</Text>
        {tags.length > 0 && (
          <div className="history-card-tags">
            {tags.slice(0, 3).map((tag) => (
              <span className="history-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
