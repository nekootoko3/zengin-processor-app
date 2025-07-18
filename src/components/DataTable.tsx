import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type FilterFn,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';
import type { DataRecord, ZenginData } from '../types/zengin';
import { formatAmount, getAccountTypeName, getTransferResultName } from '../lib/utils/fieldUtils';

interface DataTableProps {
  data: ZenginData;
}

const fuzzyFilter: FilterFn<DataRecord> = (row, columnId, value) => {
  const itemValue = row.getValue(columnId) as string;
  return itemValue.toLowerCase().includes(value.toLowerCase());
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns: ColumnDef<DataRecord>[] = [
    {
      accessorKey: 'bankCode',
      header: '銀行コード',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'bankName',
      header: '銀行名',
      cell: info => info.getValue() || '-',
    },
    {
      accessorKey: 'branchCode',
      header: '支店コード',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'branchName',
      header: '支店名',
      cell: info => info.getValue() || '-',
    },
    {
      accessorKey: 'accountType',
      header: '預金種目',
      cell: info => getAccountTypeName(info.getValue() as string),
    },
    {
      accessorKey: 'accountNumber',
      header: '口座番号',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'accountHolder',
      header: '預金者名',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'debitAmount',
      header: '引落金額',
      cell: info => formatAmount(info.getValue() as number),
    },
    {
      accessorKey: 'customerNumber',
      header: '顧客番号',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'transferResultCode',
      header: '振替結果',
      cell: info => getTransferResultName(info.getValue() as string),
    },
  ];

  const table = useReactTable({
    data: data.data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
  });

  const exportToCSV = () => {
    const headers = columns.map(col => col.header).join(',');
    const rows = data.data.map(record => [
      record.bankCode,
      record.bankName || '',
      record.branchCode,
      record.branchName || '',
      getAccountTypeName(record.accountType),
      record.accountNumber,
      record.accountHolder,
      record.debitAmount,
      record.customerNumber,
      getTransferResultName(record.transferResultCode),
    ].join(','));
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'zengin_data.csv';
    link.click();
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="検索..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Download className="w-4 h-4" />
          CSVエクスポート
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ChevronUp className="w-4 h-4" />}
                      {header.column.getIsSorted() === 'desc' && <ChevronDown className="w-4 h-4" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          {table.getFilteredRowModel().rows.length} 件中{' '}
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          件を表示
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
          >
            前へ
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
};