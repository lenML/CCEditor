import { fromPreTrained } from "@lenml/tokenizer-claude";

const tokenizer = fromPreTrained();

const max_cache_items = 512;
const encode_cache = new Map<string, string[]>();
function randomDelete(n = 1) {
  // NOTE: 随机就是最好的~
  // 清理策略，随机删一个
  const keys = [...encode_cache.keys()];
  for (let i = 0; i < n; i++) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    encode_cache.delete(key);
  }
}
function afterDrop() {
  if (encode_cache.size > max_cache_items) {
    randomDelete(encode_cache.size - max_cache_items);
  }
}

// 带有 cache 的 encode
export function encodeToTokens(text: string) {
  if (encode_cache.has(text)) {
    return encode_cache.get(text)!;
  } else {
    const tokens = tokenizer._encode_text(text) || [];
    encode_cache.set(text, tokens);
    afterDrop();
    return tokens;
  }
}
