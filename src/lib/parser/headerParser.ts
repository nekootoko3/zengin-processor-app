import type { HeaderRecord, ParseError } from '../../types/zengin';
import { extractField, validateNumeric } from '../utils/fieldUtils';

interface HeaderParseResult {
  success: boolean;
  data?: HeaderRecord;
  errors: ParseError[];
}

export function parseHeader(line: string, lineNumber: number): HeaderParseResult {
  const errors: ParseError[] = [];
  
  if (line.length !== 120) {
    errors.push({
      line: lineNumber,
      message: `ヘッダーレコードは120バイトである必要があります。実際: ${line.length}バイト`
    });
    return { success: false, errors };
  }

  const recordType = extractField(line, 0, 1);
  if (recordType !== '1') {
    errors.push({
      line: lineNumber,
      message: `ヘッダーレコードのデータ区分は'1'である必要があります。実際: '${recordType}'`,
      field: 'recordType'
    });
  }

  const typeCode = extractField(line, 1, 2);
  if (typeCode !== '91') {
    errors.push({
      line: lineNumber,
      message: `種別コードは'91'である必要があります。実際: '${typeCode}'`,
      field: 'typeCode'
    });
  }

  const codeType = extractField(line, 3, 1) as '0' | '1';
  if (codeType !== '0' && codeType !== '1') {
    errors.push({
      line: lineNumber,
      message: `コード区分は'0'または'1'である必要があります。実際: '${codeType}'`,
      field: 'codeType'
    });
  }

  const clientCode = extractField(line, 4, 10);
  if (!validateNumeric(clientCode)) {
    errors.push({
      line: lineNumber,
      message: `委託者コードは数値である必要があります`,
      field: 'clientCode'
    });
  }

  const clientName = extractField(line, 14, 40).trim();
  const debitDate = extractField(line, 54, 4);
  
  if (!validateNumeric(debitDate) || debitDate.length !== 4) {
    errors.push({
      line: lineNumber,
      message: `引落日は4桁の数値(MMDD形式)である必要があります`,
      field: 'debitDate'
    });
  }

  const bankCode = extractField(line, 58, 4);
  if (!validateNumeric(bankCode)) {
    errors.push({
      line: lineNumber,
      message: `取引銀行番号は数値である必要があります`,
      field: 'bankCode'
    });
  }

  const bankName = extractField(line, 62, 15).trim();
  const branchCode = extractField(line, 77, 3);
  
  if (!validateNumeric(branchCode)) {
    errors.push({
      line: lineNumber,
      message: `取引支店番号は数値である必要があります`,
      field: 'branchCode'
    });
  }

  const branchName = extractField(line, 80, 15).trim();
  const accountType = extractField(line, 95, 1) as '1' | '2' | '9';
  
  if (!['1', '2', '9'].includes(accountType)) {
    errors.push({
      line: lineNumber,
      message: `預金種目は'1'、'2'、または'9'である必要があります`,
      field: 'accountType'
    });
  }

  const accountNumber = extractField(line, 96, 7);
  if (!validateNumeric(accountNumber)) {
    errors.push({
      line: lineNumber,
      message: `口座番号は数値である必要があります`,
      field: 'accountNumber'
    });
  }

  const dummy = extractField(line, 103, 17);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const header: HeaderRecord = {
    recordType: '1',
    typeCode: '91',
    codeType,
    clientCode,
    clientName,
    debitDate,
    bankCode,
    bankName: bankName || undefined,
    branchCode,
    branchName: branchName || undefined,
    accountType,
    accountNumber,
    dummy
  };

  return { success: true, data: header, errors: [] };
}