import { useState } from "react";
import { FileUploader } from "./components/FileUploader";
import { DataTable } from "./components/DataTable";
import { RecordDetails } from "./components/RecordDetails";
import { parseZenginFile } from "./lib/parser/zenginParser";
import { downloadZenginFile } from "./lib/utils/zenginExporter";
import type { ZenginData, ParseError, DataRecord } from "./types/zengin";

function App() {
  const [zenginData, setZenginData] = useState<ZenginData | null>(null);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileLoaded = (content: string, fileName: string) => {
    setFileName(fileName);
    setErrors([]);

    const result = parseZenginFile(content);
    if (result.success && result.data) {
      setZenginData(result.data);
    } else {
      setZenginData(null);
      setErrors(result.errors || []);
    }
  };

  const handleReset = () => {
    setZenginData(null);
    setErrors([]);
    setFileName("");
  };

  const handleDataUpdate = (updatedData: DataRecord[]) => {
    if (!zenginData) return;

    // 振替結果に基づいて集計を再計算
    const transferredRecords = updatedData.filter(
      (record) => record.transferResultCode === "0"
    );
    const nonTransferredRecords = updatedData.filter(
      (record) => record.transferResultCode !== "0"
    );

    const transferredCount = transferredRecords.length;
    const transferredAmount = transferredRecords.reduce(
      (sum, record) => sum + record.debitAmount,
      0
    );
    const nonTransferredCount = nonTransferredRecords.length;
    const nonTransferredAmount = nonTransferredRecords.reduce(
      (sum, record) => sum + record.debitAmount,
      0
    );

    const updatedZenginData: ZenginData = {
      ...zenginData,
      data: updatedData,
      trailer: {
        ...zenginData.trailer,
        transferredCount,
        transferredAmount,
        nonTransferredCount,
        nonTransferredAmount,
      },
    };

    setZenginData(updatedZenginData);
  };

  const handleExport = async () => {
    if (!zenginData) return;

    const exportFileName = fileName.replace(/\.[^/.]+$/, "_result.txt");
    await downloadZenginFile(zenginData, exportFileName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            全銀フォーマットパーサー
          </h1>
          <p className="text-gray-600">
            預金口座振替フォーマットファイルを解析してテーブル形式で表示します
          </p>
        </header>

        {!zenginData && !errors.length && (
          <div className="max-w-2xl mx-auto">
            <FileUploader onFileLoaded={handleFileLoaded} />
          </div>
        )}

        {errors.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                解析エラー
              </h3>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    {error.line > 0 && `行 ${error.line}: `}
                    {error.field && `[${error.field}] `}
                    {error.message}
                  </div>
                ))}
              </div>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                別のファイルを選択
              </button>
            </div>
          </div>
        )}

        {zenginData && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {fileName}
                </h2>
                <p className="text-sm text-gray-600">
                  {zenginData.data.length} 件のデータレコード
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  📁 全銀ファイルをエクスポート
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  別のファイルを選択
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RecordDetails data={zenginData} />
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h3 className="text-lg font-bold mb-6 text-gray-900 border-b border-gray-200 pb-2">
                    📋 データレコード一覧
                  </h3>
                  <DataTable
                    data={zenginData}
                    onDataUpdate={handleDataUpdate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
