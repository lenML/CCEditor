import { useState } from "react";
import type { CardRecord } from "../../db/types";

function toValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function uniq(values: string[]) {
  return [...new Set(values.map((value) => value.toLowerCase()))]
    .map((value) => values.find((item) => item.toLowerCase() === value)!)
    .filter(Boolean);
}

export function useHistoryPool(records: CardRecord[]) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedVersion, setSelectedVersion] = useState("all");

  const tags = uniq(records.flatMap((record) => toValues(record.card.data.tags)));
  const sources = uniq(records.flatMap((record) => toValues(record.card.data.source)));
  const versions = uniq(
    records
      .map((record) => String(record.card.data.character_version ?? "").trim())
      .filter(Boolean)
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = records.filter((record) => {
    const data = record.card.data;
    const haystack = [
      data.name,
      data.nickname,
      data.creator,
      data.description,
      ...toValues(data.tags),
      ...toValues(data.source),
      data.character_version,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
    if (
      selectedTag !== "all" &&
      !toValues(data.tags).some((tag) => tag.toLowerCase() === selectedTag)
    ) {
      return false;
    }
    if (
      selectedSource !== "all" &&
      !toValues(data.source).some((source) => source.toLowerCase() === selectedSource)
    ) {
      return false;
    }
    if (
      selectedVersion !== "all" &&
      String(data.character_version ?? "") !== selectedVersion
    ) {
      return false;
    }
    return true;
  });

  return {
    query,
    setQuery,
    tags,
    sources,
    versions,
    selectedTag,
    setSelectedTag,
    selectedSource,
    setSelectedSource,
    selectedVersion,
    setSelectedVersion,
    filtered,
  };
}
