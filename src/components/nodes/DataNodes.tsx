import { Handle, Position, NodeProps } from "reactflow";

interface DataNodeData {
  label: string;
  description?: string;
  type: "setData" | "getData";
  inputValue?: string;
  inputJson?: string;
  outputKey?: string;
  storageKey?: string;
  dataType?: "value" | "json";
}

export function SetDataNode({ id, data, selected }: NodeProps<DataNodeData>) {
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
      className={`p-3 border rounded-lg bg-cyan-50 shadow-sm min-w-[250px] ${
        selected ? "border-cyan-500 shadow-md" : "border-cyan-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-500 !border-cyan-600"
      />

      <div className="font-medium text-sm text-cyan-800 mb-2">
        💾 {data.label}
      </div>

      <div className="space-y-2">
        {/* Storage Key */}
        <input
          className="w-full p-2 text-xs border border-cyan-300 rounded focus:border-cyan-500 focus:outline-none text-gray-600"
          placeholder="Storage Key (e.g., 'userBalance')"
          value={data.storageKey || ""}
          onChange={(e) => updateNodeData("storageKey", e.target.value)}
        />

        {/* Data Type Selection */}
        <select
          className="w-full p-2 text-xs border border-cyan-300 rounded focus:border-cyan-500 focus:outline-none text-gray-600"
          value={data.dataType || "value"}
          onChange={(e) => updateNodeData("dataType", e.target.value)}
        >
          <option value="value">Simple Value</option>
          <option value="json">JSON Object</option>
        </select>

        {/* Input based on data type */}
        {data.dataType === "json" ? (
          <textarea
            className="w-full p-2 text-xs border border-cyan-300 rounded focus:border-cyan-500 focus:outline-none resize-none text-gray-600"
            placeholder='{"name": "John", "balance": 100}'
            rows={3}
            value={data.inputJson || ""}
            onChange={(e) => updateNodeData("inputJson", e.target.value)}
          />
        ) : (
          <input
            className="w-full p-2 text-xs border border-cyan-300 rounded focus:border-cyan-500 focus:outline-none text-gray-600"
            placeholder="Value to store"
            value={data.inputValue || ""}
            onChange={(e) => updateNodeData("inputValue", e.target.value)}
          />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cyan-500 !border-cyan-600"
      />
    </div>
  );
}

export function GetDataNode({ id, data, selected }: NodeProps<DataNodeData>) {
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
      className={`p-3 border rounded-lg bg-teal-50 shadow-sm min-w-[250px] ${
        selected ? "border-teal-500 shadow-md" : "border-teal-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-teal-500 !border-teal-600"
      />

      <div className="font-medium text-sm text-teal-800 mb-2">
        📤 {data.label}
      </div>

      <div className="space-y-2">
        {/* Storage Key */}
        <input
          className="w-full p-2 text-xs border border-teal-300 rounded focus:border-teal-500 focus:outline-none text-gray-600"
          placeholder="Storage Key to retrieve"
          value={data.storageKey || ""}
          onChange={(e) => updateNodeData("storageKey", e.target.value)}
        />

        {/* Optional: JSON Key for extracting specific value */}
        <input
          className="w-full p-2 text-xs border border-teal-300 rounded focus:border-teal-500 focus:outline-none text-gray-600"
          placeholder="JSON Key (optional, e.g., 'balance')"
          value={data.outputKey || ""}
          onChange={(e) => updateNodeData("outputKey", e.target.value)}
        />

        <div className="text-xs text-teal-600">
          Leave JSON Key empty to get full stored data
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500 !border-teal-600"
      />
    </div>
  );
}
