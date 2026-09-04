import { useMemo, useState } from "react";
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Text,
} from "@fluentui/react-components";
import {
  ArrowMaximizeVerticalRegular,
  ArrowMinimizeVerticalRegular,
  Dismiss24Regular,
  Toolbox24Regular,
} from "@fluentui/react-icons";
import type { CharacterCard } from "@lenml/char-card-reader";
import { pluginRegistry, type RegisteredPluginTool } from "../plugins/registry";
import { useEditorStore } from "../store/editorStore";
import { useI18n } from "../tools/i18n";
import "./ToolsDrawer.css";

function ToolPanel({
  entry,
  card,
}: {
  entry: RegisteredPluginTool;
  card: CharacterCard;
}) {
  const t = useI18n();
  const [expanded, setExpanded] = useState(false);
  const ToolComponent = entry.component;

  return (
    <section className="tool-panel">
      <button
        className="tool-panel-header"
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span>
          <Text className="tool-panel-title">{entry.tool.name}</Text>
          <div className="tool-panel-description">
            {t(entry.tool.description ?? "")}
          </div>
        </span>
        {expanded ? (
          <ArrowMinimizeVerticalRegular />
        ) : (
          <ArrowMaximizeVerticalRegular />
        )}
      </button>
      {expanded && (
        <div className="tool-panel-body">
          <ToolComponent card={card} />
        </div>
      )}
    </section>
  );
}

export function ToolsDrawer() {
  const t = useI18n();
  const open = useEditorStore((state) => state.isToolsDrawerOpen);
  const setOpen = useEditorStore((state) => state.setToolsDrawerOpen);
  const hasCard = useEditorStore((state) => state.hasCard);
  const buildCharacterCard = useEditorStore((state) => state.buildCharacterCard);

  const card = useMemo(
    () => (open && hasCard ? buildCharacterCard() : undefined),
    [open, hasCard, buildCharacterCard]
  );
  const tools = pluginRegistry.getTools();

  return (
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
          <Toolbox24Regular />
          {t("Tool")}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className="tools-drawer-body">
        <div className="tools-intro">
          {t("Plugin tools run against the current card without modifying it.")}
        </div>
        {card ? (
          <div className="tools-list">
            {tools.map((entry) => (
              <ToolPanel
                key={`${entry.plugin.id}:${entry.tool.id}`}
                entry={entry}
                card={card}
              />
            ))}
          </div>
        ) : (
          <div className="tools-empty">
            <Text>{t("Load a character card first")}</Text>
          </div>
        )}
        {tools.length > 0 && (
          <Divider style={{ width: "100%" }} />
        )}
      </DrawerBody>
    </Drawer>
  );
}
