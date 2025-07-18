import type { ZenginData, ParseResult, ParseError } from '../../types/zengin';
import { parseHeader } from './headerParser';
import { parseData } from './dataParser';
import { parseTrailer } from './trailerParser';
import { parseEnd } from './endParser';

export function parseZenginFile(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.length > 0);
  const errors: ParseError[] = [];
  
  if (lines.length < 4) {
    return {
      success: false,
      errors: [{
        line: 0,
        message: 'ファイルには最低4行（ヘッダー、データ、トレーラ、エンド）が必要です'
      }]
    };
  }

  try {
    const headerResult = parseHeader(lines[0], 1);
    if (!headerResult.success) {
      errors.push(...headerResult.errors);
    }

    const dataRecords = [];
    let lineNumber = 2;
    
    while (lineNumber <= lines.length - 2) {
      const line = lines[lineNumber - 1];
      if (!line || line.charAt(0) === '8' || line.charAt(0) === '9') {
        break;
      }
      
      const dataResult = parseData(line, lineNumber);
      if (dataResult.success && dataResult.data) {
        dataRecords.push(dataResult.data);
      } else {
        errors.push(...dataResult.errors);
      }
      lineNumber++;
    }

    const trailerLine = lines[lines.length - 2];
    const trailerResult = parseTrailer(trailerLine, lines.length - 1);
    if (!trailerResult.success) {
      errors.push(...trailerResult.errors);
    }

    const endLine = lines[lines.length - 1];
    const endResult = parseEnd(endLine, lines.length);
    if (!endResult.success) {
      errors.push(...endResult.errors);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    if (!headerResult.data || !trailerResult.data || !endResult.data) {
      return {
        success: false,
        errors: [{ line: 0, message: 'レコードの解析に失敗しました' }]
      };
    }

    const data: ZenginData = {
      header: headerResult.data,
      data: dataRecords,
      trailer: trailerResult.data,
      end: endResult.data
    };

    const validationErrors = validateZenginData(data);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      errors: [{
        line: 0,
        message: `解析エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      }]
    };
  }
}

function validateZenginData(data: ZenginData): ParseError[] {
  const errors: ParseError[] = [];

  if (data.trailer.totalCount !== data.data.length) {
    errors.push({
      line: 0,
      message: `合計件数が一致しません。トレーラ: ${data.trailer.totalCount}, 実際: ${data.data.length}`
    });
  }

  const actualTotalAmount = data.data.reduce((sum, record) => sum + record.debitAmount, 0);
  if (data.trailer.totalAmount !== actualTotalAmount) {
    errors.push({
      line: 0,
      message: `合計金額が一致しません。トレーラ: ${data.trailer.totalAmount}, 実際: ${actualTotalAmount}`
    });
  }

  return errors;
}