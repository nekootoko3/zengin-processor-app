export interface HeaderRecord {
  recordType: '1';
  typeCode: '91';
  codeType: '0' | '1';
  clientCode: string;
  clientName: string;
  debitDate: string;
  bankCode: string;
  bankName?: string;
  branchCode: string;
  branchName?: string;
  accountType: '1' | '2' | '9';
  accountNumber: string;
  dummy: string;
}

export interface DataRecord {
  recordType: '2';
  bankCode: string;
  bankName?: string;
  branchCode: string;
  branchName?: string;
  dummy1: string;
  accountType: '1' | '2' | '3' | '9';
  accountNumber: string;
  accountHolder: string;
  debitAmount: number;
  newCode: '0' | '1' | '2';
  customerNumber: string;
  transferResultCode: '0' | '1' | '2' | '3' | '4' | '8' | '9';
  dummy2: string;
}

export interface TrailerRecord {
  recordType: '8';
  totalCount: number;
  totalAmount: number;
  transferredCount: number;
  transferredAmount: number;
  nonTransferredCount: number;
  nonTransferredAmount: number;
  dummy: string;
}

export interface EndRecord {
  recordType: '9';
  dummy: string;
}

export type ZenginRecord = HeaderRecord | DataRecord | TrailerRecord | EndRecord;

export interface ZenginData {
  header: HeaderRecord;
  data: DataRecord[];
  trailer: TrailerRecord;
  end: EndRecord;
}

export interface ParseResult {
  success: boolean;
  data?: ZenginData;
  errors?: ParseError[];
}

export interface ParseError {
  line: number;
  message: string;
  field?: string;
}