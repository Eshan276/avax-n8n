import { Handle, Position, NodeProps } from "reactflow";
import { ConditionNodeData } from "@/types/nodes";

export function CompareNode({
  id,
  data,
  selected,
}: NodeProps<ConditionNodeData>) {
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
      className={`p-3 border rounded-lg bg-orange-50 shadow-sm min-w-[200px] ${
        selected ? "border-orange-500 shadow-md" : "border-orange-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-orange-500 !border-orange-600"
      />

      <div className="font-medium text-sm text-orange-800 mb-2">
        🔍 {data.label}
      </div>

      <div className="space-y-2">
        <select
          className="w-full p-2 text-xs border border-orange-300 rounded focus:border-orange-500 focus:outline-none text-gray-600"
          value={data.operator || ""}
          onChange={(e) => updateNodeData("operator", e.target.value)}
        >
          <option value="">Select operator</option>
          <option value=">">Greater than</option>
          <option value="<">Less than</option>
          <option value="==">Equal to</option>
          <option value="!=">Not equal to</option>
          <option value=">=">Greater or equal</option>
          <option value="<=">Less or equal</option>
        </select>
        <input
          className="w-full p-2 text-xs border border-orange-300 rounded focus:border-orange-500 focus:outline-none text-gray-600"
          placeholder="Value to compare"
          value={data.value || ""}
          onChange={(e) => updateNodeData("value", e.target.value)}
        />
      </div>

      <div className="flex justify-between mt-3">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!bg-green-500 !border-green-600 !left-6"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!bg-red-500 !border-red-600 !right-6"
        />
      </div>

      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>True</span>
        <span>False</span>
      </div>
    </div>
  );
}

export function DelayNode({
  id,
  data,
  selected,
}: NodeProps<ConditionNodeData>) {
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
      className={`p-3 border rounded-lg bg-gray-50 shadow-sm min-w-[200px] ${
        selected ? "border-gray-500 shadow-md" : "border-gray-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-500 !border-gray-600"
      />

      <div className="font-medium text-sm text-gray-800 mb-2">
        ⏳ {data.label}
      </div>

      <div className="space-y-2">
        <input
          className="w-full p-2 text-xs border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-600"
          placeholder="Delay (seconds)"
          type="number"
          value={data.delayTime || ""}
          onChange={(e) => updateNodeData("delayTime", e.target.value)}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-500 !border-gray-600"
      />
    </div>
  );
}
