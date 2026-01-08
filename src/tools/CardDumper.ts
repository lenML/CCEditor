import type { CharacterCard } from "@lenml/char-card-reader";
import { version as tool_version } from "../../package.json";
import { formatDateData } from "./times";
import { Png } from "./png";

import {
  JpegBundler,
  WebpBundler,
  CharxBundler,
} from "@lenml/char-card-writer";

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
  public readonly card: CharacterCard;

  constructor(card: CharacterCard) {
    this.card = card;
  }

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

  private async prepare_image_file(version = "v3" as Versions) {
    const json = this.toJson(version);
    this.addEditorInfo(json);

    const avatarPreview = this.card.avatar;
    if (!avatarPreview) {
      throw new Error("Avatar image not found");
    }

    const blob = await fetch(avatarPreview).then((res) => res.blob());

    return {
      json,
      blob,
    };
  }

  async download_png(version = "v3" as Versions) {
    const { json, blob } = await this.prepare_image_file(version);
    const png = Png.Generate(await blob.arrayBuffer(), JSON.stringify(json));

    const char_name = this.card.name || "character";
    const filename = `${char_name}.card.${version}.png`;
    const file = new File([png], filename, { type: "image/png" });
    download_blob(file);
  }

  async download_from_bundler(
    version = "v3" as Versions,
    file_ext: string,
    bundler: JpegBundler | WebpBundler | CharxBundler,
    mime_type: string = `image/${file_ext}`
  ) {
    const { json, blob } = await this.prepare_image_file(version);
    const jpeg_data = await bundler.bundle(await blob.arrayBuffer(), json);

    const char_name = this.card.name || "character";
    const filename = `${char_name}.card.${version}.${file_ext}`;
    const file = new File([jpeg_data], filename, { type: mime_type });
    download_blob(file);
  }

  async download_jpeg(version = "v3" as Versions) {
    const bundler = new JpegBundler();
    this.download_from_bundler(version, "jpeg", bundler);
  }
  async download_webp(version = "v3" as Versions) {
    const bundler = new WebpBundler();
    this.download_from_bundler(version, "webp", bundler);
  }
  async download_charx(version = "v3" as Versions) {
    const bundler = new CharxBundler();
    this.download_from_bundler(
      version,
      "charx",
      bundler,
      "application/octet-stream"
    );
  }
}
