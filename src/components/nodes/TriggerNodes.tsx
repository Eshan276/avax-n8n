import { Handle, Position, NodeProps } from "reactflow";
import { TriggerNodeData } from "@/types/nodes";

export function BlockTriggerNode({
  id,
  data,
  selected,
}: NodeProps<TriggerNodeData>) {
  return (
    <div
      className={`p-3 border rounded-lg bg-blue-50 shadow-sm min-w-[200px] ${
        selected ? "border-blue-500 shadow-md" : "border-blue-300"
      }`}
    >
      <div className="font-medium text-sm text-blue-800 mb-1">
        🔗 {data.label}
      </div>
      <div className="text-xs text-blue-600">{data.description}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !border-blue-600"
      />
    </div>
  );
}

export function TimeTriggerNode({
  id,
  data,
  selected,
}: NodeProps<TriggerNodeData>) {
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
      className={`p-3 border rounded-lg bg-purple-50 shadow-sm min-w-[200px] ${
        selected ? "border-purple-500 shadow-md" : "border-purple-300"
      }`}
    >
      <div className="font-medium text-sm text-purple-800 mb-2">
        ⏰ {data.label}
      </div>
      <div className="space-y-2">
        <input
          className="w-full p-2 text-xs border border-purple-300 rounded focus:border-purple-500 focus:outline-none text-gray-600"
          placeholder="Interval (seconds)"
          type="number"
          value={data.interval || ""}
          onChange={(e) => updateNodeData("interval", e.target.value)}
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !border-purple-600"
      />
    </div>
  );
}

export function PriceTriggerNode({
  id,
  data,
  selected,
}: NodeProps<TriggerNodeData>) {
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
      className={`p-3 border rounded-lg bg-yellow-50 shadow-sm min-w-[200px] ${
        selected ? "border-yellow-500 shadow-md" : "border-yellow-300"
      }`}
    >
      <div className="font-medium text-sm text-yellow-800 mb-2">
        💰 {data.label}
      </div>
      <div className="space-y-2">
        <input
          className="w-full p-2 text-xs border border-yellow-300 rounded focus:border-yellow-500 focus:outline-none"
          placeholder="Price Threshold ($)"
          type="number"
          step="0.01"
          value={data.threshold || ""}
          onChange={(e) => updateNodeData("threshold", e.target.value)}
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-yellow-500 !border-yellow-600"
      />
    </div>
  );
}


// Add this new component:

export function NftPriceTriggerNode({
  id,
  data,
  selected,
}: NodeProps<TriggerNodeData>) {
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
      className={`p-3 border rounded-lg bg-orange-50 shadow-sm min-w-[250px] ${
        selected ? "border-orange-500 shadow-md" : "border-orange-300"
      }`}
    >
      <div className="font-medium text-sm text-orange-800 mb-2">
        🖼️ {data.label}
      </div>

      <div className="space-y-2">
        {/* Marketplace Selection */}
        <select
          className="w-full p-2 text-xs border border-orange-300 rounded focus:border-orange-500 focus:outline-none text-gray-600"
          value={data.marketplace || "joepegs"}
          onChange={(e) => updateNodeData("marketplace", e.target.value)}
        >
          <option value="joepegs">Joepegs</option>
          <option value="campfire">Campfire</option>
          <option value="kalao">Kalao</option>
          <option value="opensea">OpenSea</option>
        </select>

        {/* NFT Contract Address */}
        <input
          className="w-full p-2 text-xs border border-orange-300 rounded focus:border-orange-500 focus:outline-none text-gray-600"
          placeholder="NFT Contract Address (0x...)"
          value={data.nftContract || ""}
          onChange={(e) => updateNodeData("nftContract", e.target.value)}
        />

        {/* Token ID */}
        <input
          className="w-full p-2 text-xs border border-orange-300 rounded focus:border-orange-500 focus:outline-none text-gray-600"
          placeholder="Token ID (optional, for specific NFT)"
          value={data.tokenId || ""}
          onChange={(e) => updateNodeData("tokenId", e.target.value)}
        />

        {/* Price Condition */}
        <div className="flex gap-1">
          <select
            className="flex-1 p-2 text-xs border border-orange-300 rounded focus:border-orange-500 focus:outline-none text-gray-600"
            value={data.priceCondition || "below"}
            onChange={(e) => updateNodeData("priceCondition", e.target.value)}
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
            <option value="equal">Equal</option>
          </select>

          <input
            className="flex-1 p-2 text-xs border border-orange-300 rounded focus:border-orange-500 focus:outline-none text-gray-600"
            placeholder="Price (AVAX)"
            type="number"
            step="0.01"
            value={data.priceThreshold || ""}
            onChange={(e) => updateNodeData("priceThreshold", e.target.value)}
          />
        </div>

        <div className="text-xs text-orange-600">
          Triggers when NFT price condition is met
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-orange-500 !border-orange-600"
      />
    </div>
  );
}