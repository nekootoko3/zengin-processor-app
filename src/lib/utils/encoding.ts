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
      } catch (error) {
        // Shift-JISでの読み込みをフォールバック
        try {
          const decoder = new TextDecoder('shift-jis');
          const text = decoder.decode(arrayBuffer);
          resolve(text);
        } catch (fallbackError) {
          reject(new Error('ファイルの文字エンコーディングを解析できませんでした'));
        }
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

function detectEncoding(bytes: Uint8Array): string {
  // BOMチェック
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return 'utf-8';
  }
  
  // UTF-16 BEチェック
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return 'utf-16be';
  }
  
  // UTF-16 LEチェック
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return 'utf-16le';
  }
  
  // 日本語文字の検出パターン
  let hasShiftJISPattern = false;
  let hasUTF8Pattern = false;
  
  for (let i = 0; i < bytes.length - 1; i++) {
    const byte1 = bytes[i];
    const byte2 = bytes[i + 1];
    
    // Shift-JISのひらがな・カタカナ範囲
    if ((byte1 >= 0x82 && byte1 <= 0x83) || (byte1 >= 0x88 && byte1 <= 0x9F)) {
      hasShiftJISPattern = true;
    }
    
    // UTF-8の日本語文字パターン
    if (byte1 === 0xE3 && byte2 >= 0x81 && byte2 <= 0x83) {
      hasUTF8Pattern = true;
    }
  }
  
  if (hasUTF8Pattern) {
    return 'utf-8';
  }
  
  if (hasShiftJISPattern) {
    return 'shift-jis';
  }
  
  // デフォルトはShift-JIS（全銀フォーマットの標準）
  return 'shift-jis';
}

export function convertToFullWidth(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + 0xFEE0);
  });
}

export function convertToHalfWidth(text: string): string {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
  });
}

// Shift-JISエンコーディングテーブル
const SHIFT_JIS_TABLE: { [key: string]: number } = {
  // 半角カタカナ
  'ｱ': 0xB1, 'ｲ': 0xB2, 'ｳ': 0xB3, 'ｴ': 0xB4, 'ｵ': 0xB5,
  'ｶ': 0xB6, 'ｷ': 0xB7, 'ｸ': 0xB8, 'ｹ': 0xB9, 'ｺ': 0xBA,
  'ｻ': 0xBB, 'ｼ': 0xBC, 'ｽ': 0xBD, 'ｾ': 0xBE, 'ｿ': 0xBF,
  'ﾀ': 0xC0, 'ﾁ': 0xC1, 'ﾂ': 0xC2, 'ﾃ': 0xC3, 'ﾄ': 0xC4,
  'ﾅ': 0xC5, 'ﾆ': 0xC6, 'ﾇ': 0xC7, 'ﾈ': 0xC8, 'ﾉ': 0xC9,
  'ﾊ': 0xCA, 'ﾋ': 0xCB, 'ﾌ': 0xCC, 'ﾍ': 0xCD, 'ﾎ': 0xCE,
  'ﾏ': 0xCF, 'ﾐ': 0xD0, 'ﾑ': 0xD1, 'ﾒ': 0xD2, 'ﾓ': 0xD3,
  'ﾔ': 0xD4, 'ﾕ': 0xD5, 'ﾖ': 0xD6, 'ﾗ': 0xD7, 'ﾘ': 0xD8,
  'ﾙ': 0xD9, 'ﾚ': 0xDA, 'ﾛ': 0xDB, 'ﾜ': 0xDC, 'ﾝ': 0xDD,
  'ﾞ': 0xDE, 'ﾟ': 0xDF,
  // 特殊文字
  'ｰ': 0xB0, // 長音記号
  'ー': 0xB0, // 全角長音記号 -> 半角に変換
};

// Shift-JISエンコーディングでファイルを出力する関数
export function encodeShiftJIS(text: string): Uint8Array {
  const bytes: number[] = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    // ASCII文字
    if (code <= 0x7F) {
      bytes.push(code);
    }
    // 半角カタカナ
    else if (code >= 0xFF61 && code <= 0xFF9F) {
      bytes.push(code - 0xFF61 + 0xA1);
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