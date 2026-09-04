import { Button, Text, Tooltip } from "@fluentui/react-components";
import { History24Regular, Toolbox24Regular } from "@fluentui/react-icons";
import { useStyles } from "./useStyles";
import { GITHUB_REPO_LINK } from "./constants";
import { GithubIcon } from "./icons";
import { useI18n } from "../tools/i18n";
import { LangSwitch } from "./LangSwitch";
import { useEditorStore } from "../store/editorStore";
import pkgJson from "../../package.json";

export function AppHeader() {
  const styles = useStyles();
  const t = useI18n();
  const hasCard = useEditorStore((state) => state.hasCard);
  const openHistory = useEditorStore((state) => state.setHistoryDrawerOpen);
  const openTools = useEditorStore((state) => state.setToolsDrawerOpen);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Text weight="bold" size={500}>
          🎭
        </Text>
        <Text className={styles.appName}>
          CC Editor <small>v{pkgJson.version}</small>
        </Text>
      </div>
      <div className={styles.headerRight}>
        <LangSwitch />
        <Tooltip content={t("Tool")} relationship="label">
          <Button
            icon={<Toolbox24Regular />}
            appearance="transparent"
            disabled={!hasCard}
            onClick={() => openTools(true)}
          >
            {t("Tool")}
          </Button>
        </Tooltip>
        <Tooltip content={t("View History")} relationship="label">
          <Button
            icon={<History24Regular />}
            appearance="transparent"
            onClick={() => openHistory(true)}
          >
            {t("History")}
          </Button>
        </Tooltip>
        <Tooltip content={t("View on GitHub")} relationship="label">
          <Button
            as="a"
            href={GITHUB_REPO_LINK}
            target="_blank"
            rel="noopener noreferrer"
            icon={<GithubIcon />}
            appearance="transparent"
            aria-label="GitHub Repository"
          />
        </Tooltip>
      </div>
    </header>
  );
}
