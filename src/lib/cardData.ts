import type { SpecV3 } from "@lenml/char-card-reader";
import { formatDateData } from "../tools/times";

export type CardData = SpecV3.CharacterCardV3["data"];

export function createDefaultCardData(): CardData {
  return {
    name: "",
    description: "",
    tags: [],
    creator: "",
    character_version: "",
    mes_example: "",
    system_prompt: "",
    post_history_instructions: "",
    first_mes: "",
    alternate_greetings: [],
    personality: "",
    scenario: "",
    creator_notes: "",
    nickname: "",
    source: [],
    group_only_greetings: [],
    character_book: { name: "", entries: [], extensions: {} },
    assets: [],
    extensions: {},
    creator_notes_multilingual: {},
    creation_date: undefined,
    modification_date: undefined,
  } as CardData;
}

function normalizeDate(value?: number): number | undefined {
  return value == null ? undefined : formatDateData(value).getTime();
}

function normalizeBook(book: CardData["character_book"]) {
  if (book == null) return undefined;
  if (typeof book === "string") return JSON.parse(book) as CardData["character_book"];
  return book;
}

export function normalizeCardData(data: CardData): CardData {
  return {
    name: data.name ?? "",
    description: data.description ?? "",
    tags: data.tags ?? [],
    creator: data.creator ?? "",
    character_version: data.character_version ?? "",
    mes_example: data.mes_example ?? "",
    system_prompt: data.system_prompt ?? "",
    post_history_instructions: data.post_history_instructions ?? "",
    first_mes: data.first_mes ?? "",
    alternate_greetings: data.alternate_greetings ?? [],
    personality: data.personality ?? "",
    scenario: data.scenario ?? "",
    creator_notes: data.creator_notes ?? "",
    nickname: data.nickname ?? "",
    source: data.source ?? [],
    group_only_greetings: data.group_only_greetings ?? [],
    character_book: normalizeBook(data.character_book),
    assets: data.assets ?? [],
    extensions: data.extensions ?? {},
    creator_notes_multilingual: data.creator_notes_multilingual ?? {},
    creation_date: normalizeDate(data.creation_date),
    modification_date: normalizeDate(data.modification_date),
  } as CardData;
}

export function isCardDataEmpty(data: CardData) {
  return !Object.values(data).some(
    (value) =>
      (typeof value === "string" && value.trim() !== "") ||
      (typeof value === "object" &&
        value !== null &&
        (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)) ||
      typeof value === "number"
  );
}
