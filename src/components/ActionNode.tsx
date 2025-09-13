import { Handle, Position, NodeProps } from "reactflow";

interface ActionNodeData {
  label: string;
  to?: string;
  amount?: string;
}

export function ActionNode({ id, data }: NodeProps<ActionNodeData>) {
  const updateNodeData = (key: string, value: string) => {
    // Dispatch custom event to parent component
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nodeDataUpdate", {
          detail: { id, data: { ...data, [key]: value } },
        })
      );
    }
  };

  return (
    <div className="p-3 border rounded-lg bg-white shadow-sm min-w-[200px] border-gray-300">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !border-blue-600"
      />

      <div className="font-medium mb-2 text-sm text-gray-800">{data.label}</div>

      {data.label.includes("Action") && (
        <div className="space-y-2">
          <input
            className="w-full p-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            placeholder="To Address (0x...)"
            value={data.to || ""}
            onChange={(e) => updateNodeData("to", e.target.value)}
          />
          <input
            className="w-full p-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            placeholder="Amount (AVAX)"
            type="number"
            step="0.01"
            min="0"
            value={data.amount || ""}
            onChange={(e) => updateNodeData("amount", e.target.value)}
          />
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-green-600"
      />
    </div>
  );
}
