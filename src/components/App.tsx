import { useEffect } from "react";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";
import { useStyles } from "./useStyles";
import { StartPanel } from "./StartPanel/StartPanel";
import { AppHeader } from "./AppHeader";
import { HistoryDrawer } from "./HistoryDrawer";
import { EditorView } from "./EditorView";
import { useEditorStore } from "../store/editorStore";

export function App() {
  const styles = useStyles();
  const hasCard = useEditorStore((state) => state.hasCard);
  const isDirty = useEditorStore((state) => state.isDirty);

  useEffect(() => {
    void useEditorStore.getState().fetchHistory();
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
      <main className={styles.mainContent}>
        {hasCard ? <EditorView /> : <StartPanel />}
      </main>
      <HistoryDrawer />
    </FluentProvider>
  );
}
