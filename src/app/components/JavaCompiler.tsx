import { useState,useEffect } from "react";
import { Copy, RefreshCw, Play } from "lucide-react";

export const JavaCompiler: React.FC = () => {
  const defaultCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
//   const [code, setCode] = useState<string>(defaultCode);
  const [runUrl, setRunUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [code, setCode] = useState(defaultCode);

  const runCode = () => {
    const encoded = encodeURIComponent(code);
    setRunUrl(`https://www.jdoodle.com/embed/v0/2?code=${encoded}`);
  };


useEffect(() => {
  const savedCode = localStorage.getItem("java_try_code");
  if (savedCode) setCode(savedCode);
}, []);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    setCode(defaultCode);
    setRunUrl("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border">
      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <button
              className="p-2 bg-gray-600 text-white rounded"
              onClick={copyCode}
            >
              {copied ? "✔ Copied" : <Copy className="w-4 h-4" />}
            </button>
            <button
              className="p-2 bg-yellow-500 text-black rounded"
              onClick={resetCode}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="p-2 bg-green-600 text-white rounded"
              onClick={runCode}
            >
              <Play className="w-4 h-4" /> Run
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 w-full p-3 font-mono text-sm border rounded-lg dark:bg-gray-800 dark:text-gray-100"
          style={{ minHeight: 300 }}
        />
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col">
        <h4 className="font-semibold mb-2">Output:</h4>
        {runUrl ? (
          <iframe
            key={runUrl}
            src={runUrl}
            title="JDoodle Java Runner"
            className="flex-1 w-full border rounded-lg"
            style={{ minHeight: 300 }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
          />
        ) : (
          <div className="flex-1 p-3 border rounded-lg bg-black text-green-400 flex items-center justify-center">
            Click <b>Run ▶</b> to see output…
          </div>
        )}
      </div>
    </div>
  );
};
