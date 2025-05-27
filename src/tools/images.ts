// 创建一个纯黑的图像，中间写字
export const createBlackImage = (text: string, w = 512, h = 512) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to create canvas context");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  ctx.font = "bold 50px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.fillText(text, w / 2, h / 2);
  return canvas;
};
