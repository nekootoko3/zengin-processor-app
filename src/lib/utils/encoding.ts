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