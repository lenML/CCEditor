import CRC32 from "crc-32";

class PngDecodeError extends Error {}
class PngFormatError extends Error {}
class PngMissingCharacterError extends Error {}
class PngInvalidCharacterError extends Error {
  cause: any;
  constructor(message: string, { cause } = {} as any) {
    super(message);
    this.cause = cause;
  }
}

type PngChunk = {
  type: string;
  data: Uint8Array;
  crc: number;
};

/**
 * From https://github.com/ZoltanAI/character-editor/blob/main/index.html#L786
 */
export class Png {
  static #uint8 = new Uint8Array(4);
  static #int32 = new Int32Array(this.#uint8.buffer);
  static #uint32 = new Uint32Array(this.#uint8.buffer);

  // Parse and extract PNG tEXt chunk
  static #decodeText(data: Uint8Array) {
    let naming = true;
    let keyword = "";
    let text = "";

    for (let index = 0; index < data.length; index++) {
      const code = data[index];

      if (naming) {
        if (code) {
          keyword += String.fromCharCode(code);
        } else {
          naming = false;
        }
      } else {
        if (code) {
          text += String.fromCharCode(code);
        } else {
          throw new PngDecodeError(
            "Invalid NULL character found in PNG tEXt chunk"
          );
        }
      }
    }

    return {
      keyword,
      text,
    };
  }

  // Encode value to PNG tEXt chunk
  static #encodeText(keyword: string, text: string) {
    keyword = String(keyword);
    text = String(text);

    // eslint-disable-next-line no-control-regex
    if (!/^[\x00-\xFF]+$/.test(keyword) || !/^[\x00-\xFF]+$/.test(text))
      throw new PngDecodeError("Invalid character in PNG tEXt chunk");
    if (keyword.length > 79)
      throw new PngDecodeError(
        'Keyword "' + keyword + '" is longer than the 79 character limit'
      );

    const data = new Uint8Array(keyword.length + text.length + 1);
    let idx = 0;
    let code;

    for (let i = 0; i < keyword.length; i++) {
      if (!(code = keyword.charCodeAt(i)))
        throw new PngDecodeError(
          "0x00 character is not permitted in tEXt keywords"
        );
      data[idx++] = code;
    }

    data[idx++] = 0;

    for (let i = 0; i < text.length; i++) {
      if (!(code = text.charCodeAt(i)))
        throw new PngDecodeError(
          "0x00 character is not permitted in tEXt text"
        );
      data[idx++] = code;
    }

    return data;
  }

  // Read PNG format chunk
  static #readChunk(data: Uint8Array, idx: number): PngChunk {
    // Read length field
    this.#uint8[3] = data[idx++];
    this.#uint8[2] = data[idx++];
    this.#uint8[1] = data[idx++];
    this.#uint8[0] = data[idx++];
    const length = this.#uint32[0];

    // Read chunk type field
    const chunkType =
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]);

    // Read chunk data field
    const chunkData = data.slice(idx, idx + length);
    idx += length;

    // Read CRC field
    this.#uint8[3] = data[idx++];
    this.#uint8[2] = data[idx++];
    this.#uint8[1] = data[idx++];
    this.#uint8[0] = data[idx++];
    const crc = this.#int32[0];

    // Compare stored CRC to actual
    if (crc !== CRC32.buf(chunkData, CRC32.str(chunkType)))
      throw new PngDecodeError(
        'CRC for "' +
          chunkType +
          '" header is invalid, file is likely corrupted'
      );

    return {
      type: chunkType,
      data: chunkData,
      crc,
    };
  }

  // Read PNG file and extract chunks
  static #readChunks(data: Uint8Array) {
    if (
      data[0] !== 0x89 ||
      data[1] !== 0x50 ||
      data[2] !== 0x4e ||
      data[3] !== 0x47 ||
      data[4] !== 0x0d ||
      data[5] !== 0x0a ||
      data[6] !== 0x1a ||
      data[7] !== 0x0a
    )
      throw new PngFormatError("Invalid PNG header");

    const chunks: PngChunk[] = [];

    let idx = 8; // Skip signature
    while (idx < data.length) {
      const chunk = Png.#readChunk(data, idx);

      if (!chunks.length && chunk.type !== "IHDR")
        throw new PngDecodeError("PNG missing IHDR header");

      chunks.push(chunk);
      idx += 4 + 4 + chunk.data.length + 4; // Skip length, chunk type, chunk data, CRC
    }

    if (chunks.length === 0)
      throw new PngDecodeError("PNG ended prematurely, no chunks");
    if (chunks[chunks.length - 1].type !== "IEND")
      throw new PngDecodeError("PNG ended prematurely, missing IEND header");

    return chunks;
  }

  // Write PNG file from chunks
  static #encodeChunks(chunks: PngChunk[]) {
    const output = new Uint8Array(
      chunks.reduce(
        (a: number, c: { data: Uint8Array }) => a + 4 + 4 + c.data.length + 4,
        8
      )
    ); // Signature + chunks (length, chunk type, chunk data, CRC)

    // Signature
    output[0] = 0x89;
    output[1] = 0x50;
    output[2] = 0x4e;
    output[3] = 0x47;
    output[4] = 0x0d;
    output[5] = 0x0a;
    output[6] = 0x1a;
    output[7] = 0x0a;

    let idx = 8; // After signature

    chunks.forEach((c: { data: Uint8Array; type: string; crc: any }) => {
      // Write length field
      this.#uint32[0] = c.data.length;
      output[idx++] = this.#uint8[3];
      output[idx++] = this.#uint8[2];
      output[idx++] = this.#uint8[1];
      output[idx++] = this.#uint8[0];

      // Write chunk type field
      output[idx++] = c.type.charCodeAt(0);
      output[idx++] = c.type.charCodeAt(1);
      output[idx++] = c.type.charCodeAt(2);
      output[idx++] = c.type.charCodeAt(3);

      // Write chunk data field
      for (let i = 0; i < c.data.length; ) {
        output[idx++] = c.data[i++];
      }

      // Write CRC field
      this.#int32[0] = c.crc || CRC32.buf(c.data, CRC32.str(c.type));
      output[idx++] = this.#uint8[3];
      output[idx++] = this.#uint8[2];
      output[idx++] = this.#uint8[1];
      output[idx++] = this.#uint8[0];
    });

    return output;
  }

  // Parse PNG file and return decoded UTF8 "chara" base64 tEXt chunk value
  static Parse(arrayBuffer: ArrayBuffer) {
    const chunks = Png.#readChunks(new Uint8Array(arrayBuffer));

    const text = chunks
      .filter((c) => c.type === "tEXt")
      .map((c) => Png.#decodeText(c.data));
    if (text.length < 1)
      throw new PngMissingCharacterError("No PNG text fields found in file");

    const chara = text.find((t) => t.keyword === "chara");
    if (chara === undefined)
      throw new PngMissingCharacterError(
        'No PNG text field named "chara" found in file'
      );

    try {
      return new TextDecoder().decode(
        Uint8Array.from(atob(chara.text), (c) => c.charCodeAt(0))
      );
    } catch (e) {
      throw new PngInvalidCharacterError(
        'Unable to parse "chara" field as base64',
        {
          cause: e,
        }
      );
    }
  }

  // Parse PNG file, strip all tEXt chunks, add encoded UTF8 "chara" base64 tEXt chunk and return PNG file
  static Generate(arrayBuffer: ArrayBuffer, text: string | undefined) {
    // Read PNG and remove all tEXt chunks, as TavernAI does
    // NOTE: TavernAI blindly reads first tEXt chunk, rather than searching for one named "chara"
    const chunks = Png.#readChunks(new Uint8Array(arrayBuffer)).filter(
      (c) => c.type !== "tEXt"
    );

    // Insert new "chara" tEXt chunk just before IEND chunk, as TavernAI does
    // NOTE: Some programs won't see the tEXt chunk if its after any IDAT chunks
    const data = Png.#encodeText(
      "chara",
      btoa(
        new TextEncoder()
          .encode(text)
          .reduce((a, c) => a + String.fromCharCode(c), "")
      )
    );
    chunks.splice(-1, 0, {
      type: "tEXt",
      data,
      crc: CRC32.buf(data, CRC32.str("tEXt")),
    });

    return Png.#encodeChunks(chunks);
  }
}
