import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type FilterFn,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { DataRecord, ZenginData } from "../types/zengin";
import {
  formatAmount,
  getAccountTypeName,
  getTransferResultName,
} from "../lib/utils/fieldUtils";

interface DataTableProps {
  data: ZenginData;
}

const fuzzyFilter: FilterFn<DataRecord> = (row, columnId, value) => {
  const itemValue = row.getValue(columnId) as string;
  return itemValue.toLowerCase().includes(value.toLowerCase());
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<DataRecord>[] = [
    {
      accessorKey: "bankCode",
      header: "銀行コード",
      cell: (info) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "bankName",
      header: "銀行名",
      cell: (info) => (
        <span className="font-medium text-gray-900">
          {(info.getValue() as string) || "-"}
        </span>
      ),
    },
    {
      accessorKey: "branchCode",
      header: "支店コード",
      cell: (info) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "branchName",
      header: "支店名",
      cell: (info) => (
        <span className="font-medium text-gray-700">
          {(info.getValue() as string) || "-"}
        </span>
      ),
    },
    {
      accessorKey: "accountType",
      header: "預金種目",
      cell: (info) => {
        const type = info.getValue() as string;
        const name = getAccountTypeName(type);
        const colorClass =
          type === "1"
            ? "bg-blue-100 text-blue-800"
            : type === "2"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
          >
            {name}
          </span>
        );
      },
    },
    {
      accessorKey: "accountNumber",
      header: "口座番号",
      cell: (info) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "accountHolder",
      header: "預金者名",
      cell: (info) => (
        <span className="font-medium text-gray-900">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "debitAmount",
      header: "引落金額",
      cell: (info) => {
        const amount = info.getValue() as number;
        return (
          <span className="font-mono text-sm font-bold text-right block text-green-600">
            ¥{formatAmount(amount)}
          </span>
        );
      },
    },
    {
      accessorKey: "customerNumber",
      header: "顧客番号",
      cell: (info) => (
        <span className="font-mono text-xs text-gray-600">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "transferResultCode",
      header: "振替結果",
      cell: (info) => {
        const code = info.getValue() as string;
        const name = getTransferResultName(code);
        const colorClass =
          code === "0"
            ? "bg-green-100 text-green-800 border-green-200"
            : code === "1"
            ? "bg-red-100 text-red-800 border-red-200"
            : "bg-yellow-100 text-yellow-800 border-yellow-200";
        return (
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}
          >
            {name}
          </span>
        );
      },
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
    globalFilterFn: fuzzyFilter,
  });

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ChevronUp className="w-4 h-4 text-blue-500" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ChevronDown className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`hover:bg-blue-50 transition-colors duration-150 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
