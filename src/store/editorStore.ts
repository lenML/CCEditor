import { create } from "zustand";
import { CharacterCard } from "@lenml/char-card-reader";
import { cardDB } from "../db/db";
import type { CardRecord } from "../db/types";
import { createBlackImage } from "../tools/images";
import {
  createDefaultCardData,
  isCardDataEmpty,
  normalizeCardData,
  type CardData,
} from "../lib/cardData";

type EditorStore = {
  hasCard: boolean;
  formData: CardData;
  avatarPreview: string | null;
  originalFileName: string;
  originalCreationDate?: number;
  history: CardRecord[];
  isHistoryDrawerOpen: boolean;
  isToolsDrawerOpen: boolean;
  selectedTab: string;
  isDirty: boolean;

  fetchHistory: () => Promise<void>;
  importCharacterCard: (card: CharacterCard, fileName?: string) => void;
  createNew: () => Promise<void>;
  resetEditor: () => void;
  setField: (field: string, value: unknown) => void;
  setBookData: (book?: CardData["character_book"]) => void;
  replaceAvatar: (avatar: string, fileName: string) => void;
  setDirty: (dirty: boolean) => void;
  buildCharacterCard: () => CharacterCard | undefined;
  addToHistory: (data: CardData, avatar?: string | null) => Promise<void>;
  loadHistory: (id: string) => void;
  deleteHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  setHistoryDrawerOpen: (open: boolean) => void;
  setToolsDrawerOpen: (open: boolean) => void;
  selectTab: (tab: string) => void;
};

function buildCardFromData(
  data: CardData,
  avatar: string | null,
  originalCreationDate?: number
) {
  const dataToSave = { ...data } as CardData;
  const nowTimestamp = Math.floor(Date.now() / 1000);
  dataToSave.creation_date =
    originalCreationDate ?? dataToSave.creation_date ?? nowTimestamp;
  dataToSave.modification_date = nowTimestamp;
  return CharacterCard.from_json(
    {
      spec: "chara_card_v3",
      spec_version: "3.0",
      data: dataToSave,
    },
    avatar || undefined
  );
}

function emptyFormData() {
  return createDefaultCardData();
}

function applyCardToEditor(
  set: (partial: Partial<EditorStore>) => void,
  data: CardData,
  avatar: string | null,
  fileName: string,
  originalCreationDate?: number
) {
  set({
    hasCard: true,
    formData: normalizeCardData(data),
    avatarPreview: avatar,
    originalFileName: fileName,
    originalCreationDate,
    isDirty: false,
    selectedTab: "basic",
    isToolsDrawerOpen: false,
  });
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  hasCard: false,
  formData: emptyFormData(),
  avatarPreview: null,
  originalFileName: "",
  history: [],
  isHistoryDrawerOpen: false,
  isToolsDrawerOpen: false,
  selectedTab: "basic",
  isDirty: false,

  async fetchHistory() {
    set({ history: await cardDB.getAll() });
  },

  importCharacterCard(card, fileName = "") {
    const v3 = card.toSpecV3();
    applyCardToEditor(
      set,
      v3.data,
      card.avatar || null,
      fileName,
      v3.data.creation_date
    );
    void get().addToHistory(v3.data, card.avatar);
  },

  async createNew() {
    const tempAvatar = createBlackImage("CCEditor Avatar");
    const avatar = tempAvatar.toDataURL();
    const card = CharacterCard.from_json(
      {
        spec: "chara_card_v2",
        spec_version: "3.0",
        data: {
          name: "Alice",
          description: "Alice is a character",
          first_mes: "Hello",
        },
      },
      avatar
    );
    const v3 = card.toSpecV3();
    applyCardToEditor(
      set,
      v3.data,
      avatar,
      "avatar.png",
      v3.data.creation_date
    );
  },

  resetEditor() {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
    set({
      hasCard: false,
      formData: emptyFormData(),
      avatarPreview: null,
      originalFileName: "",
      originalCreationDate: undefined,
      isDirty: false,
      selectedTab: "basic",
      isToolsDrawerOpen: false,
    });
  },

  setField(field, value) {
    set((state) => ({
      formData: { ...state.formData, [field]: value } as CardData,
      isDirty: true,
    }));
  },

  setBookData(book) {
    set((state) => {
      if (book === undefined) {
        const nextForm = { ...state.formData } as CardData;
        delete nextForm.character_book;
        return { formData: nextForm, isDirty: true };
      }
      return {
        formData: { ...state.formData, character_book: book },
        isDirty: true,
      };
    });
  },

  replaceAvatar(avatar, fileName) {
    set({ avatarPreview: avatar, originalFileName: fileName, isDirty: true });
  },

  setDirty(dirty) {
    set({ isDirty: dirty });
  },

  buildCharacterCard() {
    const state = get();
    if (!state.hasCard || isCardDataEmpty(state.formData)) return undefined;
    return buildCardFromData(
      state.formData,
      state.avatarPreview,
      state.originalCreationDate
    );
  },

  async addToHistory(data, avatar = null) {
    if (!data?.name) return;
    const card = CharacterCard.from_json(
      {
        spec: "chara_card_v3",
        spec_version: "3.0",
        data,
      },
      avatar ?? undefined
    );
    const record = cardDB.create({
      card: card.toSpecV3(),
      avatarUrl: avatar,
    });
    try {
      await cardDB.addRecord(record);
    } catch (error) {
      console.error("Error adding record to history:", error);
      return;
    }
    set((state) => {
      const next = state.history.filter(
        (item) =>
          !(
            item.card.data.name === data.name &&
            item.card.data.first_mes === data.first_mes
          )
      );
      return { history: [record, ...next] };
    });
  },

  loadHistory(id) {
    const item = get().history.find((record) => record.id === id);
    if (!item) return;
    const { data } = item.card;
    applyCardToEditor(
      set,
      data,
      item.avatarUrl ?? null,
      `Loaded from history: ${data.name || "Unnamed"}`,
      data.creation_date
    );
    set({ isHistoryDrawerOpen: false, isToolsDrawerOpen: false });
  },

  async deleteHistory(id) {
    const exists = get().history.some((record) => record.id === id);
    if (!exists) return;
    await cardDB.delete(id);
    set({ history: get().history.filter((record) => record.id !== id) });
  },

  async clearHistory() {
    set({ history: [] });
    await cardDB.clear();
  },

  setHistoryDrawerOpen(open) {
    set({ isHistoryDrawerOpen: open });
  },

  setToolsDrawerOpen(open) {
    set({ isToolsDrawerOpen: open });
  },

  selectTab(tab) {
    set({ selectedTab: tab });
  },
}));
