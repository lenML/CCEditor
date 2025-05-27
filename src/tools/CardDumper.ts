import type { CharacterCard } from "@lenml/char-card-reader";
import { version as tool_version } from "../../package.json";
import { formatDateData } from "./times";
import { Png } from "./png";

function download_blob(blob: Blob, filenmae = "") {
  if (!filenmae && blob instanceof File) {
    filenmae = blob.name;
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filenmae;
  a.click();
  window.URL.revokeObjectURL(url);
}

type Versions = "v1" | "v2" | "v3" | "max";

export class CardDumper {
  constructor(readonly card: CharacterCard) {}

  toJson(version = "v3" as Versions) {
    switch (version) {
      case "v1":
        return this.card.toSpecV1();
      case "v2":
        return this.card.toSpecV2();
      case "v3":
        return this.card.toSpecV3();
      default:
        return this.card.toMaxCompatibleSpec();
    }
  }

  addEditorInfo(obj: any) {
    obj.metadata = {
      created: formatDateData(this.card.create_date).getTime(),
      modified: Date.now(),
      tool: {
        name: "CCEditor",
        version: tool_version,
        url: "https://lenml.github.io/CCEditor/",
      },
    };
  }

  async download_json(version = "v3" as Versions) {
    const json = this.toJson(version);
    this.addEditorInfo(json);

    const jsonDataStr = JSON.stringify(json, null, 2);

    const char_name = this.card.name || "character";
    const filename = `${char_name}.json`;
    const file = new File([jsonDataStr], filename, {
      type: "application/json",
    });
    download_blob(file);
  }

  async download_png(version = "v3" as Versions) {
    const json = this.toJson(version);
    this.addEditorInfo(json);

    const avatarPreview = this.card.avatar;
    if (!avatarPreview) {
      throw new Error("Avatar image not found");
    }

    const blob = await fetch(avatarPreview).then((res) => res.blob());
    const png = Png.Generate(await blob.arrayBuffer(), JSON.stringify(json));

    const char_name = this.card.name || "character";
    const filename = `${char_name}.card.${version}.png`;
    const file = new File([png], filename, { type: "image/png" });
    download_blob(file);
  }
}
