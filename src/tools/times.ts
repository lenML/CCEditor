export function formatDateData(data: any) {
  if (data instanceof Date) {
    return data;
  }
  if (typeof data === "number") {
    return new Date(data);
  }
  if (typeof data === "string") {
    // 使用正则匹配其中的时间戳
    const patterns = [
      /\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}/,
      /\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}/,
      /\d{4}-\d{1,2}-\d{1,2}/,
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(data);
      if (match) {
        return new Date(match[0]);
      }
    }
  }
  return new Date(data);
}
