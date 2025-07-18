import type { EndRecord, ParseError } from '../../types/zengin';
import { extractField } from '../utils/fieldUtils';

interface EndParseResult {
  success: boolean;
  data?: EndRecord;
  errors: ParseError[];
}

export function parseEnd(line: string, lineNumber: number): EndParseResult {
  const errors: ParseError[] = [];
  
  if (line.length !== 120) {
    errors.push({
      line: lineNumber,
      message: `エンドレコードは120バイトである必要があります。実際: ${line.length}バイト`
    });
    return { success: false, errors };
  }

  const recordType = extractField(line, 0, 1);
  if (recordType !== '9') {
    errors.push({
      line: lineNumber,
      message: `エンドレコードのデータ区分は'9'である必要があります。実際: '${recordType}'`,
      field: 'recordType'
    });
  }

  const dummy = extractField(line, 1, 119);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const end: EndRecord = {
    recordType: '9',
    dummy
  };

  return { success: true, data: end, errors: [] };
}