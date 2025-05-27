// 修复 keys
// 由于大部分编辑器都不支持中文逗号，所以似乎很容易导致keys写的有问题
// 这里主要修复中文逗号和保存错误
export function keysFix(keys: string[]) {
  const ret: string[] = [];
  for (const key of keys) {
    ret.push(...key.split(/[,，]/g));
  }
  return ret.map((x) => x.trim()).filter(Boolean);
}
