export function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|\s]+/g, "_");
}
