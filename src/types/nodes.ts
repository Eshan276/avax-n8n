export interface BaseNodeData {
  label: string;
  description?: string;
}

export interface TriggerNodeData extends BaseNodeData {
  type: "block" | "time" | "price" | "event" | "nftPrice";
  interval?: string;
  threshold?: string;
  // NFT Price fields
  nftContract?: string;
  tokenId?: string;
  marketplace?: "joepegs" | "campfire" | "kalao" | "opensea";
  priceThreshold?: string;
  priceCondition?: "above" | "below" | "equal";
}

export interface ActionNodeData extends BaseNodeData {
  type:
    | "send"
    | "swap"
    | "stake"
    | "approve"
    | "contract"
    | "apiCall"
    | "showData";
  to?: string;
  amount?: string;
  tokenAddress?: string;
  contractAddress?: string;
  functionName?: string;
  parameters?: string;
  // API Call fields
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: string;
  body?: string;
  curlCommand?: string;
  mode?: string;
  // Show Data fields
  dataKey?: string;
  displayText?: string;
  phoneNumber?: string;
  message?: string;
  prompt?: string;
  outputActions?: string[];
}

export interface ConditionNodeData extends BaseNodeData {
  type: "compare" | "filter" | "delay";
  operator?: ">" | "<" | "==" | "!=" | ">=" | "<=" | "contains";
  value?: string;
  inputKey?: string; // Add this line
  delayTime?: number;
}

export interface NotificationNodeData extends BaseNodeData {
  type: "webhook" | "email" | "discord";
  url?: string;
  message?: string;
}

export interface DataNodeData extends BaseNodeData {
  type: "setData" | "getData";
  inputValue?: string;
  inputJson?: string;
  outputKey?: string;
  storageKey?: string;
  dataType?: "value" | "json";
}

// Update the main NodeData type:
export type NodeData =
  | TriggerNodeData
  | ActionNodeData
  | ConditionNodeData
  | NotificationNodeData
  | DataNodeData;