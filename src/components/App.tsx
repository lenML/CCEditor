import { useEffect } from "react";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";
import { useStyles } from "./useStyles";
import { StartPanel } from "./StartPanel/StartPanel";
import { AppHeader } from "./AppHeader";
import { HistoryDrawer } from "./history/HistoryDrawer";
import { ToolsDrawer } from "./ToolsDrawer";
import { EditorView } from "./EditorView";
import { useEditorStore } from "../store/editorStore";
import { preloadMonaco } from "../lib/monacoLoader";
import "../plugins/local";

export function App() {
  const styles = useStyles();
  const hasCard = useEditorStore((state) => state.hasCard);
  const isDirty = useEditorStore((state) => state.isDirty);

  useEffect(() => {
    void useEditorStore.getState().fetchHistory();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void preloadMonaco().catch((error) => console.error("Monaco preload failed:", error));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <FluentProvider
      theme={webDarkTheme}
      className={styles.root}
      style={{ height: "100vh" }}
    >
      <AppHeader />
      <main
        className={
          hasCard ? styles.mainContent : `${styles.mainContent} ${styles.welcomePage}`
        }
      >
        {hasCard ? <EditorView /> : <StartPanel />}
      </main>
      <HistoryDrawer />
      <ToolsDrawer />
    </FluentProvider>
  );
}
