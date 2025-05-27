export function fuzzyMatch(input: string, target: string): boolean {
  // 构建正则，例如 app -> /a.*p.*p/
  const pattern = input
    .split("")
    .map((c) => escapeRegex(c))
    .join(".*");
  const regex = new RegExp(pattern, "i"); // 忽略大小写可选
  return regex.test(target);
}

// 正则转义函数（避免输入中包含特殊字符）
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
