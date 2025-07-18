import type { TrailerRecord, ParseError } from '../../types/zengin';
import { extractField, validateNumeric } from '../utils/fieldUtils';

interface TrailerParseResult {
  success: boolean;
  data?: TrailerRecord;
  errors: ParseError[];
}

export function parseTrailer(line: string, lineNumber: number): TrailerParseResult {
  const errors: ParseError[] = [];
  
  if (line.length !== 120) {
    errors.push({
      line: lineNumber,
      message: `トレーラレコードは120バイトである必要があります。実際: ${line.length}バイト`
    });
    return { success: false, errors };
  }

  const recordType = extractField(line, 0, 1);
  if (recordType !== '8') {
    errors.push({
      line: lineNumber,
      message: `トレーラレコードのデータ区分は'8'である必要があります。実際: '${recordType}'`,
      field: 'recordType'
    });
  }

  const totalCountStr = extractField(line, 1, 6);
  if (!validateNumeric(totalCountStr)) {
    errors.push({
      line: lineNumber,
      message: `合計件数は数値である必要があります`,
      field: 'totalCount'
    });
  }
  const totalCount = parseInt(totalCountStr, 10);

  const totalAmountStr = extractField(line, 7, 12);
  if (!validateNumeric(totalAmountStr)) {
    errors.push({
      line: lineNumber,
      message: `合計金額は数値である必要があります`,
      field: 'totalAmount'
    });
  }
  const totalAmount = parseInt(totalAmountStr, 10);

  const transferredCountStr = extractField(line, 19, 6);
  if (!validateNumeric(transferredCountStr)) {
    errors.push({
      line: lineNumber,
      message: `振替済件数は数値である必要があります`,
      field: 'transferredCount'
    });
  }
  const transferredCount = parseInt(transferredCountStr, 10);

  const transferredAmountStr = extractField(line, 25, 12);
  if (!validateNumeric(transferredAmountStr)) {
    errors.push({
      line: lineNumber,
      message: `振替済金額は数値である必要があります`,
      field: 'transferredAmount'
    });
  }
  const transferredAmount = parseInt(transferredAmountStr, 10);

  const nonTransferredCountStr = extractField(line, 37, 6);
  if (!validateNumeric(nonTransferredCountStr)) {
    errors.push({
      line: lineNumber,
      message: `振替不能件数は数値である必要があります`,
      field: 'nonTransferredCount'
    });
  }
  const nonTransferredCount = parseInt(nonTransferredCountStr, 10);

  const nonTransferredAmountStr = extractField(line, 43, 12);
  if (!validateNumeric(nonTransferredAmountStr)) {
    errors.push({
      line: lineNumber,
      message: `振替不能金額は数値である必要があります`,
      field: 'nonTransferredAmount'
    });
  }
  const nonTransferredAmount = parseInt(nonTransferredAmountStr, 10);

  const dummy = extractField(line, 55, 65);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const trailer: TrailerRecord = {
    recordType: '8',
    totalCount,
    totalAmount,
    transferredCount,
    transferredAmount,
    nonTransferredCount,
    nonTransferredAmount,
    dummy
  };

  return { success: true, data: trailer, errors: [] };
}