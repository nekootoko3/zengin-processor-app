export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);

      // エンコーディングの自動検出を試行
      const encoding = detectEncoding(bytes);

      try {
        const decoder = new TextDecoder(encoding);
        const text = decoder.decode(arrayBuffer);
        resolve(text);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Shift-JISでの読み込みをフォールバック
        try {
          const decoder = new TextDecoder("shift-jis");
          const text = decoder.decode(arrayBuffer);
          resolve(text);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (fallbackError) {
          reject(
            new Error("ファイルの文字エンコーディングを解析できませんでした")
          );
        }
      }
    };

    reader.onerror = () => {
      reject(new Error("ファイルの読み込みに失敗しました"));
    };

    reader.readAsArrayBuffer(file);
  });
}

function detectEncoding(bytes: Uint8Array): string {
  // BOMチェック
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    return "utf-8";
  }

  // UTF-16 BEチェック
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return "utf-16be";
  }

  // UTF-16 LEチェック
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return "utf-16le";
  }

  // 日本語文字の検出パターン
  let hasShiftJISPattern = false;
  let hasUTF8Pattern = false;

  for (let i = 0; i < bytes.length - 1; i++) {
    const byte1 = bytes[i];
    const byte2 = bytes[i + 1];

    // Shift-JISのひらがな・カタカナ範囲
    if ((byte1 >= 0x82 && byte1 <= 0x83) || (byte1 >= 0x88 && byte1 <= 0x9f)) {
      hasShiftJISPattern = true;
    }

    // UTF-8の日本語文字パターン
    if (byte1 === 0xe3 && byte2 >= 0x81 && byte2 <= 0x83) {
      hasUTF8Pattern = true;
    }
  }

  if (hasUTF8Pattern) {
    return "utf-8";
  }

  if (hasShiftJISPattern) {
    return "shift-jis";
  }

  // デフォルトはShift-JIS（全銀フォーマットの標準）
  return "shift-jis";
}

export function convertToFullWidth(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + 0xfee0);
  });
}

export function convertToHalfWidth(text: string): string {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });
}

// Shift-JISエンコーディングテーブル
const SHIFT_JIS_TABLE: { [key: string]: number } = {
  // 半角カタカナ
  ｱ: 0xb1,
  ｲ: 0xb2,
  ｳ: 0xb3,
  ｴ: 0xb4,
  ｵ: 0xb5,
  ｶ: 0xb6,
  ｷ: 0xb7,
  ｸ: 0xb8,
  ｹ: 0xb9,
  ｺ: 0xba,
  ｻ: 0xbb,
  ｼ: 0xbc,
  ｽ: 0xbd,
  ｾ: 0xbe,
  ｿ: 0xbf,
  ﾀ: 0xc0,
  ﾁ: 0xc1,
  ﾂ: 0xc2,
  ﾃ: 0xc3,
  ﾄ: 0xc4,
  ﾅ: 0xc5,
  ﾆ: 0xc6,
  ﾇ: 0xc7,
  ﾈ: 0xc8,
  ﾉ: 0xc9,
  ﾊ: 0xca,
  ﾋ: 0xcb,
  ﾌ: 0xcc,
  ﾍ: 0xcd,
  ﾎ: 0xce,
  ﾏ: 0xcf,
  ﾐ: 0xd0,
  ﾑ: 0xd1,
  ﾒ: 0xd2,
  ﾓ: 0xd3,
  ﾔ: 0xd4,
  ﾕ: 0xd5,
  ﾖ: 0xd6,
  ﾗ: 0xd7,
  ﾘ: 0xd8,
  ﾙ: 0xd9,
  ﾚ: 0xda,
  ﾛ: 0xdb,
  ﾜ: 0xdc,
  ﾝ: 0xdd,
  ﾞ: 0xde,
  ﾟ: 0xdf,
  // 特殊文字
  ｰ: 0xb0, // 長音記号
  ー: 0xb0, // 全角長音記号 -> 半角に変換
};

// Shift-JISエンコーディングでファイルを出力する関数
export function encodeShiftJIS(text: string): Uint8Array {
  const bytes: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);

    // ASCII文字
    if (code <= 0x7f) {
      bytes.push(code);
    }
    // 半角カタカナ
    else if (code >= 0xff61 && code <= 0xff9f) {
      bytes.push(code - 0xff61 + 0xa1);
    }
    // 特殊変換テーブル
    else if (SHIFT_JIS_TABLE[char]) {
      bytes.push(SHIFT_JIS_TABLE[char]);
    }
    // その他の文字（全角文字など）
    else {
      // 簡易的なShift-JIS変換（主要な漢字・ひらがな・カタカナ）
      // 実際の変換は複雑なため、完全な変換にはiconv-lite等が必要
      // ここではスペースに置き換え
      bytes.push(0x20); // スペース
      bytes.push(0x20); // 2バイト文字のため
    }
  }

  return new Uint8Array(bytes);
}
