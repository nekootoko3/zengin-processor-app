import React from 'react';
import type { ZenginData } from '../types/zengin';
import { formatAmount, getAccountTypeName } from '../lib/utils/fieldUtils';

interface RecordDetailsProps {
  data: ZenginData;
}

export const RecordDetails: React.FC<RecordDetailsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* ヘッダー情報テーブル */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">📋 ヘッダー情報</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">委託者コード</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono bg-blue-50">
                  {data.header.clientCode}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">委託者名</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {data.header.clientName}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">引落日</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {data.header.debitDate.substring(0, 2)}月{data.header.debitDate.substring(2, 4)}日
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">取引銀行</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                    {data.header.bankCode}
                  </span>
                  <span className="font-medium">
                    {data.header.bankName || '-'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">取引支店</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                    {data.header.branchCode}
                  </span>
                  <span className="font-medium">
                    {data.header.branchName || '-'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">預金種目</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getAccountTypeName(data.header.accountType)}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">口座番号</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono bg-indigo-50">
                  {data.header.accountNumber}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 集計情報テーブル */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">📊 集計情報</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">合計件数</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="text-xl font-bold text-blue-600">{data.trailer.totalCount}</span>
                  <span className="text-sm text-gray-500 ml-1">件</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">合計金額</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="text-xl font-bold text-green-600">¥{formatAmount(data.trailer.totalAmount)}</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">振替済件数</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="text-xl font-bold text-emerald-600">{data.trailer.transferredCount}</span>
                  <span className="text-sm text-gray-500 ml-1">件</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">振替済金額</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="text-xl font-bold text-teal-600">¥{formatAmount(data.trailer.transferredAmount)}</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">振替不能件数</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="text-xl font-bold text-red-600">{data.trailer.nonTransferredCount}</span>
                  <span className="text-sm text-gray-500 ml-1">件</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">振替不能金額</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="text-xl font-bold text-orange-600">¥{formatAmount(data.trailer.nonTransferredAmount)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {data.trailer.nonTransferredCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600 text-2xl">⚠️</div>
            <div>
              <p className="font-bold text-yellow-800 mb-1">振替不能データが存在します</p>
              <p className="text-sm text-yellow-700">
                振替不能件数が<span className="font-bold">{data.trailer.nonTransferredCount}</span>件あります。
                詳細はデータテーブルで振替結果を確認してください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};