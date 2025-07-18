import React from 'react';
import type { ZenginData } from '../types/zengin';
import { formatAmount } from '../lib/utils/fieldUtils';

interface RecordDetailsProps {
  data: ZenginData;
}

export const RecordDetails: React.FC<RecordDetailsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">ヘッダー情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">委託者コード</p>
            <p className="font-medium">{data.header.clientCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">委託者名</p>
            <p className="font-medium">{data.header.clientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">引落日</p>
            <p className="font-medium">
              {data.header.debitDate.substring(0, 2)}月{data.header.debitDate.substring(2, 4)}日
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">取引銀行</p>
            <p className="font-medium">
              {data.header.bankCode} {data.header.bankName || ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">取引支店</p>
            <p className="font-medium">
              {data.header.branchCode} {data.header.branchName || ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">口座番号</p>
            <p className="font-medium">{data.header.accountNumber}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">集計情報</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">合計件数</p>
            <p className="text-2xl font-bold">{data.trailer.totalCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">合計金額</p>
            <p className="text-2xl font-bold">¥{formatAmount(data.trailer.totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">振替済件数</p>
            <p className="text-2xl font-bold">{data.trailer.transferredCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">振替済金額</p>
            <p className="text-2xl font-bold">¥{formatAmount(data.trailer.transferredAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">振替不能件数</p>
            <p className="text-2xl font-bold">{data.trailer.nonTransferredCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">振替不能金額</p>
            <p className="text-2xl font-bold">¥{formatAmount(data.trailer.nonTransferredAmount)}</p>
          </div>
        </div>
      </div>

      {data.trailer.nonTransferredCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            振替不能件数が{data.trailer.nonTransferredCount}件あります。
            詳細はデータテーブルで振替結果を確認してください。
          </p>
        </div>
      )}
    </div>
  );
};