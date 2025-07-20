declare module 'encoding-japanese' {
  export interface ConvertOptions {
    to: 'UTF8' | 'UTF16' | 'UTF16BE' | 'UTF16LE' | 'UTF32' | 'SJIS' | 'EUCJP' | 'JIS' | 'UNICODE' | 'AUTO';
    from?: 'UTF8' | 'UTF16' | 'UTF16BE' | 'UTF16LE' | 'UTF32' | 'SJIS' | 'EUCJP' | 'JIS' | 'UNICODE' | 'AUTO';
    type?: 'string' | 'arraybuffer' | 'array';
  }

  export function detect(data: string | number[] | Uint8Array): string | false;
  export function convert(data: string | number[] | Uint8Array, options: ConvertOptions): number[];
  export function encode(data: string | number[] | Uint8Array, encoding: string): number[];
  export function decode(data: string | number[] | Uint8Array, encoding: string): string;
  export function stringToCode(str: string): number[];
  export function codeToString(code: number[]): string;
  export function toHankakuCase(str: string): string;
  export function toZenkakuCase(str: string): string;
  export function toHiraganaCase(str: string): string;
  export function toKatakanaCase(str: string): string;
  export function toHankanaCase(str: string): string;
  export function toZenkanaCase(str: string): string;
  export function toHankakuSpace(str: string): string;
  export function toZenkakuSpace(str: string): string;

  const Encoding: {
    detect: typeof detect;
    convert: typeof convert;
    encode: typeof encode;
    decode: typeof decode;
    stringToCode: typeof stringToCode;
    codeToString: typeof codeToString;
    toHankakuCase: typeof toHankakuCase;
    toZenkakuCase: typeof toZenkakuCase;
    toHiraganaCase: typeof toHiraganaCase;
    toKatakanaCase: typeof toKatakanaCase;
    toHankanaCase: typeof toHankanaCase;
    toZenkanaCase: typeof toZenkanaCase;
    toHankakuSpace: typeof toHankakuSpace;
    toZenkakuSpace: typeof toZenkakuSpace;
  };

  export default Encoding;
}