export function extractField(line: string, start: number, length: number): string {
  return line.substring(start, start + length);
}

export function validateNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

export function padLeft(value: string, length: number, padChar: string = '0'): string {
  return value.padStart(length, padChar);
}

export function padRight(value: string, length: number, padChar: string = ' '): string {
  return value.padEnd(length, padChar);
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('ja-JP');
}

export function getAccountTypeName(type: string): string {
  switch (type) {
    case '1': return '普通';
    case '2': return '当座';
    case '3': return '納税準備預金';
    case '9': return 'その他';
    default: return '不明';
  }
}

export function getNewCodeName(code: string): string {
  switch (code) {
    case '0': return 'その他';
    case '1': return '初回';
    case '2': return '変更';
    default: return '不明';
  }
}

export function getTransferResultName(code: string): string {
  switch (code) {
    case '0': return '振替済';
    case '1': return '資金不足';
    case '2': return '取引なし';
    case '3': return '預金者の都合による振替停止';
    case '4': return '預金口座振替依頼書なし';
    case '8': return '委託者の都合による振替停止';
    case '9': return 'その他';
    default: return '不明';
  }
}