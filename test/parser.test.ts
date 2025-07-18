import { describe, it, expect } from 'vitest';
import { parseZenginFile } from '../src/lib/parser/zenginParser';

describe('parseZenginFile', () => {
  it('should parse valid zengin file correctly', () => {
    const validContent = `1910001234567ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ                            1201001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ          10001234                 
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ                   10001234ﾔﾏﾀﾞ ﾀﾛｳ                      0000010000110000000000000000000000
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   002ｼﾃﾝ                    10002345ｽｽﾞｷ ﾊﾅｺ                      0000020000210000000000000000000000
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   003ｼﾃﾝ                    10003456ﾀﾅｶ ｲﾁﾛｳ                      0000015000010000000000000000000000
800000300000470000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
9                                                                                                                       `;

    const result = parseZenginFile(validContent);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.header.recordType).toBe('1');
    expect(result.data!.header.clientCode).toBe('0001234567');
    expect(result.data!.header.clientName.trim()).toBe('ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ');
    expect(result.data!.data).toHaveLength(3);
    expect(result.data!.trailer.totalCount).toBe(3);
    expect(result.data!.trailer.totalAmount).toBe(47000);
    expect(result.data!.end.recordType).toBe('9');
  });

  it('should handle invalid record type', () => {
    const invalidContent = `2910001234567ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ                            1201001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ          10001234                 
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ                   10001234ﾔﾏﾀﾞ ﾀﾛｳ                      0000010000110000000000000000000000
800000100000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
9                                                                                                                       `;

    const result = parseZenginFile(invalidContent);
    
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should handle insufficient lines', () => {
    const shortContent = `1910001234567ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ                            1201001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ          10001234                 
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ                   10001234ﾔﾏﾀﾞ ﾀﾛｳ                      0000010000110000000000000000000000`;

    const result = parseZenginFile(shortContent);
    
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain('最低4行');
  });

  it('should validate data consistency', () => {
    const inconsistentContent = `1910001234567ｻﾝﾌﾟﾙｷｷﾞｮｳ(ｶ                            1201001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ          10001234                 
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   001ﾎﾝﾃﾝ                   10001234ﾔﾏﾀﾞ ﾀﾛｳ                      0000010000110000000000000000000000
2001400011ﾀﾞｲｲﾁｷﾞﾝｺｳ   002ｼﾃﾝ                    10002345ｽｽﾞｷ ﾊﾅｺ                      0000020000210000000000000000000000
800000100000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
9                                                                                                                       `;

    const result = parseZenginFile(inconsistentContent);
    
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.some(e => e.message.includes('合計件数が一致しません'))).toBe(true);
  });
});

describe('Field utilities', () => {
  it('should extract fields correctly', () => {
    const { extractField, validateNumeric, formatAmount } = require('../src/lib/utils/fieldUtils');
    
    expect(extractField('1234567890', 0, 3)).toBe('123');
    expect(extractField('1234567890', 3, 4)).toBe('4567');
    expect(validateNumeric('123456')).toBe(true);
    expect(validateNumeric('12A456')).toBe(false);
    expect(formatAmount(123456)).toBe('123,456');
  });
});