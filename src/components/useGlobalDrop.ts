import { useEffect } from "react";

export function useGlobalDrop(callback: (event: DragEvent) => void) {
  useEffect(() => {
    const handleNativeDrop = (event: DragEvent) => {
      event.preventDefault();
      callback(event);
    };

    const handleNativeDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    window.addEventListener("dragover", handleNativeDragOver);
    window.addEventListener("drop", handleNativeDrop);

    return () => {
      window.removeEventListener("dragover", handleNativeDragOver);
      window.removeEventListener("drop", handleNativeDrop);
    };
  }, [callback]);
}
