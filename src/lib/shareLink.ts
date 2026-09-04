export function getRawImageUrl(url: string) {
  const urlObj = new URL(url);
  if (urlObj.hostname === "media.discordapp.net") {
    for (const key of ["format", "quality", "width", "height"]) {
      urlObj.searchParams.delete(key);
    }
  }
  if (urlObj.hostname === "chub.ai") {
    const match = /\/characters\/(\w+)\/([\w_-]+)/i.exec(urlObj.pathname);
    if (match) {
      const [, uid, cid] = match;
      return `https://avatars.charhub.io/avatars/${uid}/${cid}/chara_card_v2.png`;
    }
  }
  return urlObj.href;
}

export function createShareUrl(loadUrl: string) {
  const urlObj = new URL(window.location.href);
  urlObj.searchParams.set("load_url", loadUrl);
  return urlObj.href;
}
