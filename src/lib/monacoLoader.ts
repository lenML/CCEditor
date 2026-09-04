let preloadPromise: Promise<unknown> | null = null;

export function preloadMonaco(): Promise<unknown> {
  if (!preloadPromise) {
    preloadPromise = (async () => {
      const [{ loader }, monaco] = await Promise.all([
        import("@monaco-editor/react"),
        import("monaco-editor"),
      ]);
      loader.config({ monaco });
      return loader.init();
    })();
  }
  return preloadPromise;
}
