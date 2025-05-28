import { useEffect } from "react";

export function useGlobalPaste(callback: (files: File[]) => any) {
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          (active as HTMLElement).isContentEditable)
      ) {
        return; // 焦点在输入区域，忽略
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      e.preventDefault();
      e.stopPropagation();

      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length) {
        callback(files);
      }
    };

    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [callback]);
}
