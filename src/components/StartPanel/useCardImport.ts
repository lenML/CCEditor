import { useCallback, useEffect, useRef, useState } from "react";
import { CharacterCard } from "@lenml/char-card-reader";
import { useEditorStore } from "../../store/editorStore";
import { useGlobalDrop } from "../useGlobalDrop";
import { useGlobalPaste } from "../useGlobalPaste";
import { createShareUrl, getRawImageUrl } from "../../lib/shareLink";

function resetFileInput() {
  const input = document.getElementById("fileInput") as HTMLInputElement | null;
  if (input) input.value = "";
}

export function useCardImport() {
  const importCharacterCard = useEditorStore((state) => state.importCharacterCard);
  const resetEditor = useEditorStore((state) => state.resetEditor);
  const createNew = useEditorStore((state) => state.createNew);

  const [isLoading, setIsLoading] = useState(false);
  const [dragHighlight, setDragHighlight] = useState(false);
  const [loadFromUrl, setLoadFromUrl] = useState("");
  const loadFromUrlRef = useRef(loadFromUrl);
  loadFromUrlRef.current = loadFromUrl;
  const [shareModal, setShareModal] = useState({ open: false, url: "" });

  const loadCard = useCallback(
    async (getCard: () => Promise<CharacterCard>, fileName = "") => {
      setIsLoading(true);
      resetFileInput();
      try {
        const card = await getCard();
        if (card.name === "unknown") throw new Error("Failed to parse character card");
        importCharacterCard(card, fileName);
      } catch (error) {
        console.error("Error reading card:", error);
        alert(
          `Error reading card: ${
            error instanceof Error ? error.message : error
          }. Is this a valid character card image?`
        );
        resetEditor();
      } finally {
        setIsLoading(false);
      }
    },
    [importCharacterCard, resetEditor]
  );

  const handleFileDrop = useCallback(
    async (file: File) => {
      if (!file || (!file.type.startsWith("image/") && file.type !== "application/json")) {
        alert("Please upload an image file (PNG, WEBP, JPG, JSON).");
        return;
      }
      await loadCard(async () => {
        if (file.type === "application/json") {
          return CharacterCard.from_json(JSON.parse(await file.text()));
        }
        return CharacterCard.from_file(await file.arrayBuffer());
      }, file.name);
    },
    [loadCard]
  );

  const handleLoadFromUrl = useCallback(async () => {
    const url = loadFromUrlRef.current;
    if (!url) return;
    await loadCard(async () => {
      const response = await fetch(getRawImageUrl(url));
      return CharacterCard.from_file(await response.arrayBuffer());
    }, url);
  }, [loadCard]);

  useGlobalDrop((event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) void handleFileDrop(file);
  });

  useGlobalPaste((files) => {
    if (files[0]) void handleFileDrop(files[0]);
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rawUrl = urlParams.get("load_url");
    if (!rawUrl) return;
    const decoded = decodeURIComponent(rawUrl);
    setLoadFromUrl(decoded);
    loadFromUrlRef.current = decoded;
    void handleLoadFromUrl();
    urlParams.delete("load_url");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${urlParams.toString()}`
    );
  }, [handleLoadFromUrl]);

  const showShareModal = () => {
    setShareModal({ open: true, url: createShareUrl(loadFromUrlRef.current) });
  };

  const dragEvents = {
    onDragOver: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragHighlight(true);
    },
    onDragEnter: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragHighlight(true);
    },
    onDragLeave: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node)) return;
      setDragHighlight(false);
    },
    onDrop: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragHighlight(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void handleFileDrop(file);
    },
  };

  return {
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
    handleFileSelect: (file?: File | null) => file && void handleFileDrop(file),
  };
}
