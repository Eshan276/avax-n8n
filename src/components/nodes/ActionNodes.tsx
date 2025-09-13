import { Handle, Position, NodeProps } from "reactflow";
import { ActionNodeData } from "@/types/nodes";

export function SendAvaxNode({
  id,
  data,
  selected,
}: NodeProps<ActionNodeData>) {
  const updateNodeData = (key: string, value: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nodeDataUpdate", {
          detail: { id, data: { ...data, [key]: value } },
        })
      );
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg bg-green-50 shadow-sm min-w-[200px] ${
        selected ? "border-green-500 shadow-md" : "border-green-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !border-green-600"
      />

      <div className="font-medium text-sm text-green-800 mb-2">
        💸 {data.label}
      </div>

      <div className="space-y-2">
        <input
          className="w-full p-2 text-xs border border-green-300 rounded focus:border-green-500 focus:outline-none text-gray-600"
          placeholder="To Address (0x...)"
          value={data.to || ""}
          onChange={(e) => updateNodeData("to", e.target.value)}
        />
        <input
          className="w-full p-2 text-xs border border-green-300 rounded focus:border-green-500 focus:outline-none text-gray-600"
          placeholder="Amount (AVAX)"
          type="number"
          step="0.01"
          value={data.amount || ""}
          onChange={(e) => updateNodeData("amount", e.target.value)}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-green-600"
      />
    </div>
  );
}

export function SwapTokenNode({
  id,
  data,
  selected,
}: NodeProps<ActionNodeData>) {
  const updateNodeData = (key: string, value: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nodeDataUpdate", {
          detail: { id, data: { ...data, [key]: value } },
        })
      );
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg bg-indigo-50 shadow-sm min-w-[200px] ${
        selected ? "border-indigo-500 shadow-md" : "border-indigo-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-indigo-500 !border-indigo-600"
      />

      <div className="font-medium text-sm text-indigo-800 mb-2">
        🔄 {data.label}
      </div>

      <div className="space-y-2">
        <input
          className="w-full p-2 text-xs border border-indigo-300 rounded focus:border-indigo-500 focus:outline-none text-gray-600"
          placeholder="From Token Address"
          value={data.tokenAddress || ""}
          onChange={(e) => updateNodeData("tokenAddress", e.target.value)}
        />
        <input
          className="w-full p-2 text-xs border border-indigo-300 rounded focus:border-indigo-500 focus:outline-none text-gray-600"
          placeholder="To Token Address"
          value={data.to || ""}
          onChange={(e) => updateNodeData("to", e.target.value)}
        />
        <input
          className="w-full p-2 text-xs border border-indigo-300 rounded focus:border-indigo-500 focus:outline-none text-gray-600"
          placeholder="Amount"
          type="number"
          step="0.01"
          value={data.amount || ""}
          onChange={(e) => updateNodeData("amount", e.target.value)}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-indigo-500 !border-indigo-600"
      />
    </div>
  );
}

export function ContractCallNode({
  id,
  data,
  selected,
}: NodeProps<ActionNodeData>) {
  const updateNodeData = (key: string, value: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nodeDataUpdate", {
          detail: { id, data: { ...data, [key]: value } },
        })
      );
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg bg-red-50 shadow-sm min-w-[200px] ${
        selected ? "border-red-500 shadow-md" : "border-red-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !border-red-600"
      />

      <div className="font-medium text-sm text-red-800 mb-2">
        📞 {data.label}
      </div>

      <div className="space-y-2">
        <input
          className="w-full p-2 text-xs border border-red-300 rounded focus:border-red-500 focus:outline-none text-gray-600"
          placeholder="Contract Address"
          value={data.contractAddress || ""}
          onChange={(e) => updateNodeData("contractAddress", e.target.value)}
        />
        <input
          className="w-full p-2 text-xs border border-red-300 rounded focus:border-red-500 focus:outline-none text-gray-600"
          placeholder="Function Name"
          value={data.functionName || ""}
          onChange={(e) => updateNodeData("functionName", e.target.value)}
        />
        <textarea
          className="w-full p-2 text-xs border border-red-300 rounded focus:border-red-500 focus:outline-none resize-none text-gray-600"
          placeholder="Parameters (JSON)"
          rows={2}
          value={data.parameters || ""}
          onChange={(e) => updateNodeData("parameters", e.target.value)}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-red-500 !border-red-600"
      />
    </div>
  );
}

// Add these two new components at the end of the file:

// Replace the existing ApiCallNode function with this improved version:

// Make sure your ApiCallNode has the correct field references:

// Replace the ApiCallNode with this improved version:

export function ApiCallNode({ id, data, selected }: NodeProps<ActionNodeData>) {
  const updateNodeData = (key: string, value: string) => {
    console.log(`🔄 Updating node ${id} - ${key}: ${value}`); // DEBUG
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nodeDataUpdate", {
          detail: { id, data: { ...data, [key]: value } },
        })
      );
    }
  };

  const parseCurl = (curlCommand?: string) => {
    const command = curlCommand || data.curlCommand;
    if (!command) return;

    try {
      const trimmed = command.trim();
      console.log("🔍 Parsing cURL command:", trimmed);

      // Better URL extraction
      const urlMatch =
        trimmed.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"\s]+)['"]?/) ||
        trimmed.match(/(\bhttps?:\/\/[^\s'"]+)/);

      const methodMatch = trimmed.match(/-X\s+(\w+)/i);
      const headersMatches = trimmed.match(/-H\s+['"]([^'"]+)['"]/g);
      const dataMatch = trimmed.match(/-d\s+['"]([^'"]*)['"]/);

      console.log("🔍 URL match:", urlMatch);

      if (urlMatch) {
        const extractedUrl = urlMatch[1];
        console.log("✅ Extracted URL:", extractedUrl);
        updateNodeData("url", extractedUrl);

        // Add a delay and check if it was actually updated
        setTimeout(() => {
          console.log("🔍 After update - data.url:", data.url);
        }, 100);
      }
      if (methodMatch) {
        updateNodeData("method", methodMatch[1].toUpperCase());
      } else {
        updateNodeData("method", "POST");
      }
      if (headersMatches) {
        const headers = headersMatches
          .map((h) => h.replace(/-H\s+['"]([^'"]+)['"]/, "$1"))
          .join("\n");
        updateNodeData("headers", headers);
      }
      if (dataMatch) {
        updateNodeData("body", dataMatch[1]);
        if (!methodMatch) {
          updateNodeData("method", "POST");
        }
      }
    } catch (error) {
      console.warn("Failed to parse curl command:", error);
    }
  };

  // Log the current data every time the component renders
  console.log(`📊 ApiCallNode ${id} current data:`, data);

  return (
    <div
      className={`p-3 border rounded-lg bg-purple-50 shadow-sm min-w-[280px] ${
        selected ? "border-purple-500 shadow-md" : "border-purple-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !border-purple-600"
      />

      <div className="font-medium text-sm text-purple-800 mb-2">
        🌐 {data.label}
      </div>

      <div className="space-y-2">
        {/* Debug Info */}
        <div className="text-xs text-purple-600 bg-purple-100 p-1 rounded">
          URL: {data.url || "undefined"} | Method: {data.method || "undefined"}
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log("🔄 Switching to manual mode");
              updateNodeData("mode", "manual");
            }}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              data.mode !== "curl"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => {
              console.log("🔄 Switching to curl mode");
              updateNodeData("mode", "curl");
            }}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              data.mode === "curl"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            cURL
          </button>
        </div>

        {data.mode === "curl" ? (
          /* cURL Mode */
          <div className="space-y-2">
            <textarea
              className="w-full p-2 text-xs border border-purple-300 rounded focus:border-purple-500 focus:outline-none resize-none text-gray-600"
              placeholder="Paste your cURL command here..."
              rows={4}
              value={data.curlCommand || ""}
              onChange={(e) => {
                console.log("🔄 cURL command changed:", e.target.value);
                updateNodeData("curlCommand", e.target.value);
                // Auto-parse on change
                if (e.target.value.trim().startsWith("curl")) {
                  setTimeout(() => parseCurl(e.target.value), 100);
                }
              }}
            />
            <button
              onClick={() => {
                console.log("🔄 Parse button clicked");
                parseCurl();
              }}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs py-2 px-3 rounded transition-colors"
            >
              Parse cURL Command
            </button>
            {data.url && (
              <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                ✅ Parsed URL: {data.url} ({data.method || "GET"})
              </div>
            )}
          </div>
        ) : (
          /* Manual Mode */
          <>
            <select
              className="w-full p-2 text-xs border border-purple-300 rounded focus:border-purple-500 focus:outline-none text-gray-600"
              value={data.method || "GET"}
              onChange={(e) => {
                console.log("🔄 Method changed:", e.target.value);
                updateNodeData("method", e.target.value);
              }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              className="w-full p-2 text-xs border border-purple-300 rounded focus:border-purple-500 focus:outline-none text-gray-600"
              placeholder="URL (https://api.example.com/data)"
              value={data.url || ""}
              onChange={(e) => {
                console.log("🔄 Manual URL changed:", e.target.value);
                updateNodeData("url", e.target.value);
              }}
            />

            <textarea
              className="w-full p-2 text-xs border border-purple-300 rounded focus:border-purple-500 focus:outline-none resize-none text-gray-600"
              placeholder="Headers (one per line):"
              rows={2}
              value={data.headers || ""}
              onChange={(e) => updateNodeData("headers", e.target.value)}
            />

            {(data.method === "POST" || data.method === "PUT") && (
              <textarea
                className="w-full p-2 text-xs border border-purple-300 rounded focus:border-purple-500 focus:outline-none resize-none text-gray-600"
                placeholder="Request Body (JSON)"
                rows={3}
                value={data.body || ""}
                onChange={(e) => updateNodeData("body", e.target.value)}
              />
            )}
          </>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !border-purple-600"
      />
    </div>
  );
}

export function ShowDataNode({
  id,
  data,
  selected,
}: NodeProps<ActionNodeData>) {
  const updateNodeData = (key: string, value: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nodeDataUpdate", {
          detail: { id, data: { ...data, [key]: value } },
        })
      );
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg bg-pink-50 shadow-sm min-w-[200px] ${
        selected ? "border-pink-500 shadow-md" : "border-pink-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-pink-500 !border-pink-600"
      />

      <div className="font-medium text-sm text-pink-800 mb-2">
        📊 {data.label}
      </div>

      <div className="space-y-2">
        <input
          className="w-full p-2 text-xs border border-pink-300 rounded focus:border-pink-500 focus:outline-none text-gray-600"
          placeholder="Data Key (title, *, or leave empty for auto)"
          value={data.dataKey || ""}
          onChange={(e) => updateNodeData("dataKey", e.target.value)}
        />
        <input
          className="w-full p-2 text-xs border border-pink-300 rounded focus:border-pink-500 focus:outline-none text-gray-600"
          placeholder="Display Label (optional)"
          value={data.displayText || ""}
          onChange={(e) => updateNodeData("displayText", e.target.value)}
        />
        <div className="text-xs text-pink-600">
          • Leave empty: auto-detect from input
          <br />
          • Use "*": show all data
          <br />• Use "title": show title property
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-pink-500 !border-pink-600"
      />
    </div>
  );
}

// Add this to your ActionNodes.tsx file:

export function WhatsAppNode({
  id,
  data,
  selected,
}: NodeProps<ActionNodeData>) {
  const updateNodeData = (key: string, value: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nodeDataUpdate", {
          detail: { id, data: { ...data, [key]: value } },
        })
      );
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg bg-green-50 shadow-sm min-w-[250px] ${
        selected ? "border-green-500 shadow-md" : "border-green-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !border-green-600"
      />

      <div className="font-medium text-sm text-green-800 mb-2">
        📱 {data.label}
      </div>

      <div className="space-y-2">
        <input
          className="w-full p-2 text-xs border border-green-300 rounded focus:border-green-500 focus:outline-none text-gray-600"
          placeholder="Phone Number (with country code: +1234567890)"
          value={data.phoneNumber || ""}
          onChange={(e) => updateNodeData("phoneNumber", e.target.value)}
        />
        
        <textarea
          className="w-full p-2 text-xs border border-green-300 rounded focus:border-green-500 focus:outline-none resize-none text-gray-600"
          placeholder="Message to send..."
          rows={3}
          value={data.message || ""}
          onChange={(e) => updateNodeData("message", e.target.value)}
        />
        
        <div className="text-xs text-green-600">
          Sends WhatsApp message via Cloud API
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-green-600"
      />
    </div>
  );
}