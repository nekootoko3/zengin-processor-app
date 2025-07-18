import type { DataRecord, ParseError } from '../../types/zengin';
import { extractField, validateNumeric } from '../utils/fieldUtils';

interface DataParseResult {
  success: boolean;
  data?: DataRecord;
  errors: ParseError[];
}

export function parseData(line: string, lineNumber: number): DataParseResult {
  const errors: ParseError[] = [];
  
  if (line.length !== 120) {
    errors.push({
      line: lineNumber,
      message: `データレコードは120バイトである必要があります。実際: ${line.length}バイト`
    });
    return { success: false, errors };
  }

  const recordType = extractField(line, 0, 1);
  if (recordType !== '2') {
    errors.push({
      line: lineNumber,
      message: `データレコードのデータ区分は'2'である必要があります。実際: '${recordType}'`,
      field: 'recordType'
    });
  }

  const bankCode = extractField(line, 1, 4);
  if (!validateNumeric(bankCode)) {
    errors.push({
      line: lineNumber,
      message: `引落銀行番号は数値である必要があります`,
      field: 'bankCode'
    });
  }

  const bankName = extractField(line, 5, 15).trim();
  const branchCode = extractField(line, 20, 3);
  
  if (!validateNumeric(branchCode)) {
    errors.push({
      line: lineNumber,
      message: `引落支店番号は数値である必要があります`,
      field: 'branchCode'
    });
  }

  const branchName = extractField(line, 23, 15).trim();
  const dummy1 = extractField(line, 38, 4);
  const accountType = extractField(line, 42, 1) as '1' | '2' | '3' | '9';
  
  if (!['1', '2', '3', '9'].includes(accountType)) {
    errors.push({
      line: lineNumber,
      message: `預金種目は'1'、'2'、'3'、または'9'である必要があります`,
      field: 'accountType'
    });
  }

  const accountNumber = extractField(line, 43, 7);
  if (!validateNumeric(accountNumber)) {
    errors.push({
      line: lineNumber,
      message: `口座番号は数値である必要があります`,
      field: 'accountNumber'
    });
  }

  const accountHolder = extractField(line, 50, 30).trim();
  const debitAmountStr = extractField(line, 80, 10);
  
  if (!validateNumeric(debitAmountStr)) {
    errors.push({
      line: lineNumber,
      message: `引落金額は数値である必要があります`,
      field: 'debitAmount'
    });
  }

  const debitAmount = parseInt(debitAmountStr, 10);
  const newCode = extractField(line, 90, 1) as '0' | '1' | '2';
  
  if (!['0', '1', '2'].includes(newCode)) {
    errors.push({
      line: lineNumber,
      message: `新規コードは'0'、'1'、または'2'である必要があります`,
      field: 'newCode'
    });
  }

  const customerNumber = extractField(line, 91, 20);
  if (!validateNumeric(customerNumber)) {
    errors.push({
      line: lineNumber,
      message: `顧客番号は数値である必要があります`,
      field: 'customerNumber'
    });
  }

  const transferResultCode = extractField(line, 111, 1) as '0' | '1' | '2' | '3' | '4' | '8' | '9';
  if (!['0', '1', '2', '3', '4', '8', '9'].includes(transferResultCode)) {
    errors.push({
      line: lineNumber,
      message: `振替結果コードは'0'〜'4'、'8'、'9'のいずれかである必要があります`,
      field: 'transferResultCode'
    });
  }

  const dummy2 = extractField(line, 112, 8);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const data: DataRecord = {
    recordType: '2',
    bankCode,
    bankName: bankName || undefined,
    branchCode,
    branchName: branchName || undefined,
    dummy1,
    accountType,
    accountNumber,
    accountHolder,
    debitAmount,
    newCode,
    customerNumber,
    transferResultCode,
    dummy2
  };

  return { success: true, data, errors: [] };
}