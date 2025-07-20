import type { ZenginData } from "../../types/zengin";
import Encoding from "encoding-japanese";

// 文字列を指定した文字数に調整する関数（全銀フォーマット用）
function padToLength(
  str: string,
  targetLength: number,
  padChar: string = " ",
  leftPad: boolean = false
): string {
  // 文字数が目標を超えている場合は切り詰め
  if (str.length > targetLength) {
    return str.substring(0, targetLength);
  }

  // 文字数が足りない場合はパディング文字で埋める
  const paddingNeeded = targetLength - str.length;
  const padding = padChar.repeat(paddingNeeded);

  return leftPad ? padding + str : str + padding;
}

export function exportZenginFormat(data: ZenginData): string {
  const lines: string[] = [];

  // ヘッダーレコード
  const headerLine = [
    "1", // データ区分 N(1)
    data.header.typeCode.padStart(2, "0"), // 種別コード N(2)
    data.header.codeType, // コード区分 N(1)
    data.header.clientCode.padStart(10, "0"), // 委託者コード N(10) - 右詰、残り前「0」
    padToLength(data.header.clientName, 40), // 委託者名 C(40) - 左詰、残りスペース
    data.header.debitDate.padStart(4, "0"), // 引落日 N(4) - MMDD
    data.header.bankCode.padStart(4, "0"), // 取引銀行番号 N(4) - 統一金融機関番号
    padToLength(data.header.bankName || "", 15), // 取引銀行名 C(15) - 左詰、残りスペース
    data.header.branchCode.padStart(3, "0"), // 取引支店番号 N(3) - 統一店番号
    padToLength(data.header.branchName || "", 15), // 取引支店名 C(15) - 左詰、残りスペース
    data.header.accountType, // 預金種目 N(1)
    data.header.accountNumber.padStart(7, "0"), // 口座番号 N(7) - 右詰、残り前「0」
    padToLength("", 17), // ダミー C(17)
  ].join("");

  lines.push(headerLine);

  // データレコード
  data.data.forEach((record) => {
    const dataLine = [
      "2", // データ区分 N(1)
      record.bankCode.padStart(4, "0"), // 引落銀行番号 N(4) - 統一金融機関番号
      padToLength(record.bankName || "", 15), // 引落銀行名 C(15) - 左詰、残りスペース
      record.branchCode.padStart(3, "0"), // 引落支店番号 N(3) - 統一店番号
      padToLength(record.branchName || "", 15), // 引落支店名 C(15) - 左詰、残りスペース
      padToLength("", 4), // ダミー C(4)
      record.accountType, // 預金種目 N(1)
      record.accountNumber.padStart(7, "0"), // 口座番号 N(7) - 右詰、残り前「0」
      padToLength(record.accountHolder, 30), // 預金者名 C(30) - 左詰、残りスペース
      record.debitAmount.toString().padStart(10, "0"), // 引落金額 N(10) - 右詰、残り前「0」
      record.newCode, // 新規コード N(1)
      record.customerNumber.padStart(20, "0"), // 顧客番号 N(20) - 右詰、残り前「0」
      record.transferResultCode, // 振替結果コード N(1)
      padToLength("", 8), // ダミー C(8)
    ].join("");

    lines.push(dataLine);
  });

  // 振替結果を集計
  let transferredCount = 0;
  let transferredAmount = 0;
  let nonTransferredCount = 0;
  let nonTransferredAmount = 0;

  data.data.forEach((record) => {
    if (record.transferResultCode === "0") {
      // 振替済み
      transferredCount++;
      transferredAmount += record.debitAmount;
    } else {
      // 振替不能
      nonTransferredCount++;
      nonTransferredAmount += record.debitAmount;
    }
  });

  // トレーラレコード
  const trailerLine = [
    "8", // データ区分 N(1)
    data.data.length.toString().padStart(6, "0"), // 合計件数 N(6) - 右詰「0」
    data.data.reduce((sum, record) => sum + record.debitAmount, 0).toString().padStart(12, "0"), // 合計金額 N(12) - 右詰「0」
    transferredCount.toString().padStart(6, "0"), // 振替済件数 N(6) - 右詰「0」
    transferredAmount.toString().padStart(12, "0"), // 振替済金額 N(12) - 右詰「0」
    nonTransferredCount.toString().padStart(6, "0"), // 振替不能件数 N(6) - 右詰「0」
    nonTransferredAmount.toString().padStart(12, "0"), // 振替不能金額 N(12) - 右詰「0」
    padToLength("", 65), // ダミー C(65)
  ].join("");

  lines.push(trailerLine);

  // エンドレコード
  const endLine = [
    "9", // データ区分 N(1)
    padToLength("", 119), // ダミー C(119)
  ].join("");

  lines.push(endLine);

  return lines.join("\r\n");
}

export async function downloadZenginFile(
  data: ZenginData,
  filename: string = "zengin_export.txt"
): Promise<void> {
  const content = exportZenginFormat(data);

  // UTF-8文字列を文字コード配列に変換
  const unicodeArray = Encoding.stringToCode(content);
  
  // Shift-JISに変換
  const sjisArray = Encoding.convert(unicodeArray, {
    to: 'SJIS',
    from: 'UNICODE',
  });
  
  // Uint8Arrayに変換
  const uint8Array = new Uint8Array(sjisArray);
  
  // Shift-JISとして保存
  const blob = new Blob([uint8Array], {
    type: "text/plain;charset=shift_jis",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
