import * as locals from "../locals";
import { bindReact } from "@quik-fe/stand";
import * as React from "react";

const create = bindReact(React);

function getDefaultLang() {
  // 如果有 ?lang=xxx 优先使用
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get("lang");
  if (lang) {
    return lang;
  }
  // 否则使用浏览器语言
  return navigator.language;
}

function getSoftLocal(lang: string) {
  lang = lang.toLowerCase();
  if (lang in locals) {
    return {
      lang,
      local: locals[lang],
      hit: true,
    };
  }
  for (const [k, v] of Object.entries(locals)) {
    if (lang.startsWith(k)) {
      return {
        lang: k,
        local: v,
        soft_hit: true,
      };
    }
  }
  return {
    lang: "en",
    local: locals["en"],
  };
}

export const useI18nStore = create<{
  currentLang: string;
  local_keys: string[];
  setLang: (lang: string) => void;
}>((set, get) => ({
  currentLang: getSoftLocal(getDefaultLang()).lang,
  local_keys: Object.keys(locals),
  setLang: (lang: string) => {
    set({ currentLang: lang });
    // 修改 url
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState(null, "", url.href);
  },
}));

const missing_json = {} as any;

export const translate = (
  lang: string,
  key: string,
  vars?: Record<string, any>
): string => {
  const soft_local = getSoftLocal(lang);
  if (soft_local.soft_hit == false || !soft_local.local[key]) {
    missing_json[key] = key;
    console.log(`[missing i18n:${lang}] ${key}`);
    console.log(missing_json);
  }
  const { local } = soft_local;
  let tpl = local?.[key] || local?.[key.toLowerCase()] || key;

  // 支持使用 array 表示多行 string
  if (Array.isArray(tpl)) {
    tpl = tpl.flat().join("\n");
  }

  return tpl.replace(/\{\{(.*?)\}\}/g, (_, k) => vars?.[k.trim()] ?? k);
};

export const useI18n = () => {
  // @ts-ignore
  const { currentLang } = useI18nStore();
  return React.useCallback(
    (key: string, vars?: Record<string, any>) =>
      translate(currentLang, key, vars),
    [currentLang]
  );
};
