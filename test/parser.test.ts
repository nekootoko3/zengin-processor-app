import { describe, it, expect } from "vitest";
import { parseZenginFile } from "../src/lib/parser/zenginParser";
import {
  extractField,
  validateNumeric,
  formatAmount,
} from "../src/lib/utils/fieldUtils";

// 120文字の固定長レコードを生成するヘルパー関数
function createHeaderRecord(
  clientCode: string,
  clientName: string,
  debitDate: string,
  bankCode: string,
  bankName: string,
  branchCode: string,
  branchName: string,
  accountType: string,
  accountNumber: string
): string {
  return [
    "1", // データ区分
    "91", // 種別コード
    "0", // コード区分
    clientCode.padStart(10, "0"), // 委託者コード (10桁)
    clientName.padEnd(40, " "), // 委託者名 (40文字)
    debitDate.padStart(4, "0"), // 引落日 (4桁)
    bankCode.padStart(4, "0"), // 取引銀行番号 (4桁)
    bankName.padEnd(15, " "), // 取引銀行名 (15文字)
    branchCode.padStart(3, "0"), // 取引支店番号 (3桁)
    branchName.padEnd(15, " "), // 取引支店名 (15文字)
    accountType, // 預金種目 (1桁)
    accountNumber.padStart(7, "0"), // 口座番号 (7桁)
    " ".repeat(17), // ダミー (17文字)
  ]
    .join("")
    .padEnd(120, " ");
}

function createDataRecord(
  bankCode: string,
  bankName: string,
  branchCode: string,
  branchName: string,
  accountType: string,
  accountNumber: string,
  accountHolder: string,
  debitAmount: number,
  newCode: string,
  customerNumber: string,
  transferResultCode: string
): string {
  return [
    "2", // データ区分
    bankCode.padStart(4, "0"), // 引落銀行番号 (4桁)
    bankName.padEnd(15, " "), // 引落銀行名 (15文字)
    branchCode.padStart(3, "0"), // 引落支店番号 (3桁)
    branchName.padEnd(15, " "), // 引落支店名 (15文字)
    " ".repeat(4), // ダミー (4文字)
    accountType, // 預金種目 (1桁)
    accountNumber.padStart(7, "0"), // 口座番号 (7桁)
    accountHolder.padEnd(30, " "), // 預金者名 (30文字)
    debitAmount.toString().padStart(10, "0"), // 引落金額 (10桁)
    newCode, // 新規コード (1桁)
    customerNumber.padStart(20, "0"), // 顧客番号 (20桁)
    transferResultCode, // 振替結果コード (1桁)
    " ".repeat(8), // ダミー (8文字)
  ]
    .join("")
    .padEnd(120, " ");
}

function createTrailerRecord(totalCount: number, totalAmount: number): string {
  return [
    "8", // データ区分
    totalCount.toString().padStart(6, "0"), // 合計件数 (6桁)
    totalAmount.toString().padStart(12, "0"), // 合計金額 (12桁)
    "0".repeat(6), // 振替済件数 (6桁)
    "0".repeat(12), // 振替済金額 (12桁)
    "0".repeat(6), // 振替不能件数 (6桁)
    "0".repeat(12), // 振替不能金額 (12桁)
    " ".repeat(65), // ダミー (65文字)
  ]
    .join("")
    .padEnd(120, " ");
}

function createEndRecord(): string {
  return ["9", " ".repeat(119)].join("").padEnd(120, " ");
}

describe("parseZenginFile", () => {
  it("should parse valid zengin file correctly", () => {
    const header = createHeaderRecord(
      "0001234567",
      "ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ",
      "0120",
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "001",
      "ﾎﾝﾃﾝ",
      "1",
      "0001234"
    );
    const data1 = createDataRecord(
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "001",
      "ﾎﾝﾃﾝ",
      "1",
      "0001234",
      "ﾔﾏﾀﾞ ﾀﾛｳ",
      10000,
      "1",
      "0",
      "0"
    );
    const data2 = createDataRecord(
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "002",
      "ｼﾃﾝ",
      "2",
      "0002345",
      "ｽｽﾞｷ ﾊﾅｺ",
      20000,
      "2",
      "0",
      "0"
    );
    const data3 = createDataRecord(
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "003",
      "ｼﾃﾝ",
      "1",
      "0003456",
      "ﾀﾅｶ ｲﾁﾛｳ",
      15000,
      "1",
      "0",
      "0"
    );
    const trailer = createTrailerRecord(3, 45000);
    const end = createEndRecord();
    const validContent = `${header}\n${data1}\n${data2}\n${data3}\n${trailer}\n${end}`;

    const result = parseZenginFile(validContent);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.header.recordType).toBe("1");
    expect(result.data!.header.clientCode).toBe("0001234567");
    expect(result.data!.header.clientName.trim()).toBe("ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ");
    expect(result.data!.data).toHaveLength(3);
    expect(result.data!.trailer.totalCount).toBe(3);
    expect(result.data!.trailer.totalAmount).toBe(45000);
    expect(result.data!.end.recordType).toBe("9");
  });

  it("should handle invalid record type", () => {
    const invalidContent = `2910001234567ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ                            1201001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ          10001234                 
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ                   10001234ﾔﾏﾀﾞ ﾀﾛｳ                      0000010000110000000000000000000000
800000100000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
9                                                                                                                       `;

    const result = parseZenginFile(invalidContent);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("should handle insufficient lines", () => {
    const shortContent = `1910001234567ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ                            1201001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ          10001234                 
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ                   10001234ﾔﾏﾀﾞ ﾀﾛｳ                      0000010000110000000000000000000000`;

    const result = parseZenginFile(shortContent);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain("最低4行");
  });

  it("should validate data consistency", () => {
    const header = createHeaderRecord(
      "0001234567",
      "ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ",
      "0120",
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "001",
      "ﾎﾝﾃﾝ",
      "1",
      "0001234"
    );
    const data1 = createDataRecord(
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "001",
      "ﾎﾝﾃﾝ",
      "1",
      "0001234",
      "ﾔﾏﾀﾞ ﾀﾛｳ",
      10000,
      "1",
      "0",
      "0"
    );
    const data2 = createDataRecord(
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "002",
      "ｼﾃﾝ",
      "2",
      "0002345",
      "ｽｽﾞｷ ﾊﾅｺ",
      20000,
      "2",
      "0",
      "0"
    );
    const trailer = createTrailerRecord(1, 10000); // 件数不一致
    const end = createEndRecord();
    const inconsistentContent = `${header}\n${data1}\n${data2}\n${trailer}\n${end}`;

    const result = parseZenginFile(inconsistentContent);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(
      result.errors!.some((e) => e.message.includes("合計件数が一致しません"))
    ).toBe(true);
  });

  it("should parse zengin file without line breaks (fixed length)", () => {
    // 改行なしの全銀ファイル（120文字固定長で分割）
    const header = createHeaderRecord(
      "0001234567",
      "ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ",
      "0120",
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "001",
      "ﾎﾝﾃﾝ",
      "1",
      "0001234"
    );
    const data1 = createDataRecord(
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "001",
      "ﾎﾝﾃﾝ",
      "1",
      "0001234",
      "ﾔﾏﾀﾞ ﾀﾛｳ",
      10000,
      "1",
      "0",
      "0"
    );
    const data2 = createDataRecord(
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "002",
      "ｼﾃﾝ",
      "2",
      "0002345",
      "ｽｽﾞｷ ﾊﾅｺ",
      20000,
      "2",
      "0",
      "0"
    );
    const data3 = createDataRecord(
      "0001",
      "ｱｲﾁｷﾞﾝｺｳ",
      "003",
      "ｼﾃﾝ",
      "1",
      "0003456",
      "ﾀﾅｶ ｲﾁﾛｳ",
      15000,
      "1",
      "0",
      "0"
    );
    const trailer = createTrailerRecord(3, 45000);
    const end = createEndRecord();

    // 改行なしで結合
    const noLineBreakContent = header + data1 + data2 + data3 + trailer + end;

    const result = parseZenginFile(noLineBreakContent);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    if (result.data) {
      expect(result.data.header.recordType).toBe("1");
      expect(result.data.header.clientCode).toBe("0001234567");
      expect(result.data.header.clientName.trim()).toBe("ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ");
      expect(result.data.data).toHaveLength(3);
      expect(result.data.trailer.totalCount).toBe(3);
      expect(result.data.trailer.totalAmount).toBe(45000);
      expect(result.data.end.recordType).toBe("9");
    }
  });
});

describe("Field utilities", () => {
  it("should extract fields correctly", () => {
    expect(extractField("1234567890", 0, 3)).toBe("123");
    expect(extractField("1234567890", 3, 4)).toBe("4567");
    expect(validateNumeric("123456")).toBe(true);
    expect(validateNumeric("12A456")).toBe(false);
    expect(formatAmount(123456)).toBe("123,456");
  });
});
