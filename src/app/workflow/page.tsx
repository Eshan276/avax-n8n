"use client";
import AvaxWallet from "@/components/AvaxWallet";
import { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
  NodeChange,
  applyNodeChanges,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { WhatsAppNode, AiNode } from "@/components/nodes/ActionNodes";

// Import the new node components
import { BlockTriggerNode, TimeTriggerNode, PriceTriggerNode } from "@/components/nodes/TriggerNodes";
import { SendAvaxNode, SwapTokenNode, ContractCallNode } from "@/components/nodes/ActionNodes";
import { CompareNode, DelayNode } from "@/components/nodes/ConditionNodes";
import { NodeData } from "@/types/nodes";
import { SetDataNode, GetDataNode } from "@/components/nodes/DataNodes";
import { ApiCallNode, ShowDataNode } from "@/components/nodes/ActionNodes";
import { NftPriceTriggerNode } from "@/components/nodes/TriggerNodes";

// Updated types
interface WorkflowNode extends Node {
  data: NodeData;
}

// Legacy nodes (keep for backwards compatibility)
function ActionNode({ id, data, selected }: any) {
  const [localData, setLocalData] = useState(data);

  const updateNodeData = (key: string, value: string) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nodeDataUpdate", {
          detail: { id, data: newData },
        })
      );
    }
  };

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  return (
    <div
      className={`p-3 border rounded-lg bg-white shadow-sm min-w-[200px] ${
        selected ? "border-blue-500 shadow-md" : "border-gray-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !border-blue-600"
      />

      <div className="font-medium mb-2 text-sm text-gray-800">
        {localData.label}
      </div>

      {localData.label.includes("Action") && (
        <div className="space-y-2">
          <input
            className="w-full p-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-600"
            placeholder="To Address (0x...)"
            value={localData.to || ""}
            onChange={(e) => updateNodeData("to", e.target.value)}
          />
          <input
            className="w-full p-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-600"
            placeholder="Amount (AVAX)"
            type="number"
            step="0.01"
            min="0"
            value={localData.amount || ""}
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

function TriggerNode({ data, selected }: any) {
  return (
    <div
      className={`p-3 border rounded-lg bg-blue-50 shadow-sm min-w-[180px] ${
        selected ? "border-blue-500 shadow-md" : "border-blue-300"
      }`}
    >
      <div className="font-medium text-sm text-blue-800 mb-1">
        🚀 {data.label}
      </div>
      <div className="text-xs text-blue-600">Listens for new blocks</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !border-blue-600"
      />
    </div>
  );
}

// Updated node types with new nodes
const nodeTypes: NodeTypes = {
  // New node types
  blockTrigger: BlockTriggerNode,
  timeTrigger: TimeTriggerNode,
  priceTrigger: PriceTriggerNode,
  nftPriceTrigger: NftPriceTriggerNode,
  sendAvax: SendAvaxNode,
  swapToken: SwapTokenNode,
  contractCall: ContractCallNode,
  apiCall: ApiCallNode,
  showData: ShowDataNode,
  compare: CompareNode,
  delay: DelayNode,
  whatsApp: WhatsAppNode,
  ai: AiNode,
  // Legacy nodes (for backwards compatibility)
  action: ActionNode,
  trigger: TriggerNode,

  setData: SetDataNode,
  getData: GetDataNode,
};

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const workflowDataStore = new Map<string, any>();

  // Handle node data updates from custom events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNodeUpdate = (event: any) => {
      const { id, data } = event.detail;
      setNodes((prevNodes) =>
        prevNodes.map((node) => (node.id === id ? { ...node, data } : node))
      );
    };

    window.addEventListener("nodeDataUpdate", handleNodeUpdate);
    return () => window.removeEventListener("nodeDataUpdate", handleNodeUpdate);
  }, []);

  // Initialize default nodes
  const getInitialNodes = (): WorkflowNode[] => [
    {
      id: "1",
      type: "blockTrigger",
      data: { 
        label: "New Block Trigger", 
        description: "Triggers when a new block is mined",
        type: "block"
      },
      position: { x: 250, y: 50 },
    },
    {
      id: "2",
      type: "sendAvax",
      data: { 
        label: "Send AVAX", 
        description: "Send AVAX to an address",
        type: "send",
        to: "", 
        amount: "" 
      },
      position: { x: 200, y: 200 },
    },
  ];

  const getInitialEdges = (): Edge[] => [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      type: "smoothstep",
      style: { stroke: "#3b82f6", strokeWidth: 2 },
    },
  ];

  // Client-side only mounting
  useEffect(() => {
    setMounted(true);

    try {
      const saved = localStorage.getItem("avax-workflow-v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.edges && Array.isArray(parsed.nodes)) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to load workflow:", error);
    }

    setNodes(getInitialNodes());
    setEdges(getInitialEdges());
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted || nodes.length === 0) return;

    try {
      const workflow = {
        nodes,
        edges,
        timestamp: Date.now(),
      };

      localStorage.setItem("avax-workflow-v3", JSON.stringify(workflow));
    } catch (error) {
      console.warn("Failed to save workflow:", error);
    }
  }, [nodes, edges, mounted]);

  // Event handlers
  const onConnect = useCallback((params: Connection) => {
    const newEdge = {
      ...params,
      type: "smoothstep",
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      id: `edge-${Date.now()}`,
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as WorkflowNode[]);
  }, []);

  // Add node function
  const addNode = (type: string, label: string, description?: string) => {
    const baseData = { 
      label, 
      description,
      type: type.replace(/Trigger|Node/g, '').toLowerCase() as any
    };

    // Add specific fields based on node type
    let nodeData = baseData;
    if (type.includes('send') || type.includes('swap') || type === 'action') {
      nodeData = { ...baseData, to: "", amount: "" };
    }

    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type: type,
      data: nodeData,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 200,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Legacy add functions for backwards compatibility
  const addTriggerNode = () => addNode("blockTrigger", "New Block Trigger", "Triggers when a new block is mined");
  const addActionNode = () => addNode("sendAvax", "Send AVAX", "Send AVAX to an address");

  // MetaMask provider helper
  const getMetaMaskProvider = () => {
    if (typeof window === "undefined") return null;

    if (window.ethereum?.providers) {
      return window.ethereum.providers.find(
        (provider: any) => provider.isMetaMask
      );
    }

    if (window.ethereum?.isMetaMask) {
      return window.ethereum;
    }

    return null;
  };

  const executeWorkflow = async () => {
    const metaMask = getMetaMaskProvider();

    if (!metaMask) {
      alert("MetaMask not found or not available");
      return;
    }

    try {
      setIsExecuting(true);
      console.log("🚀 Starting workflow execution...");

      const accounts = await metaMask.request({
        method: "eth_accounts",
      });
      console.log("📋 Connected accounts:", accounts);

      if (accounts.length === 0) {
        alert("Please connect your wallet first");
        return;
      }

      const account = accounts[0];
      console.log("👤 Using account:", account);

      const chainId = await metaMask.request({
        method: "eth_chainId",
      });

      const chainIdDecimal = parseInt(chainId, 16);
      console.log("🌐 Current chain ID (hex):", chainId);
      console.log("🌐 Current chain ID (decimal):", chainIdDecimal);

      if (chainId !== "0xA869" && chainIdDecimal !== 43113) {
        console.log("❌ Wrong network detected!");
        alert(
          `Please switch to Avalanche Fuji testnet.\nCurrent: ${chainIdDecimal}\nExpected: 43113`
        );
        return;
      }

      console.log("✅ Correct network confirmed - Avalanche Fuji");
      console.log("📊 Processing nodes:", nodes.length);

      // Execute nodes based on their type
      for (const node of nodes) {
        console.log("🔍 Processing node:", node.id, node.type, node.data.label);
        console.log(node.type , node.data.url);
        // Handle Send AVAX nodes
        if (
          (node.type === "sendAvax" ||
            (node.type === "action" &&
              node.data.label.includes("Send AVAX"))) &&
          node.data.to &&
          node.data.amount
        ) {
          console.log("💸 Found Send AVAX action node");
          console.log("📝 Node data:", {
            to: node.data.to,
            amount: node.data.amount,
            label: node.data.label,
          });

          // Validate recipient address
          const addressRegex = /^0x[a-fA-F0-9]{40}$/;
          const isValidAddress = addressRegex.test(node.data.to);

          if (!isValidAddress) {
            console.log("❌ Invalid address format");
            alert(`Invalid recipient address: ${node.data.to}`);
            continue;
          }

          // Convert amount to wei
          const amountFloat = parseFloat(node.data.amount);
          const amountInWei = BigInt(
            Math.floor(amountFloat * Math.pow(10, 18))
          );
          const amountInWeiHex = "0x" + amountInWei.toString(16);

          console.log("💰 Amount conversion:", {
            originalAmount: node.data.amount,
            amountFloat: amountFloat,
            amountInWei: amountInWei.toString(),
            amountInWeiHex: amountInWeiHex,
          });

          const txParams = {
            from: account,
            to: node.data.to,
            value: amountInWeiHex,
            gas: "0x5208",
          };

          console.log("📋 Transaction parameters:", txParams);
          console.log("🔄 Sending transaction...");

          const txHash = await metaMask.request({
            method: "eth_sendTransaction",
            params: [txParams],
          });

          console.log("✅ Transaction sent successfully!");
          console.log("📄 Transaction hash:", txHash);

          const explorerUrl = `https://testnet.snowtrace.io/tx/${txHash}`;
          alert(
            `Transaction sent successfully!\nTx Hash: ${txHash}\nView on explorer: ${explorerUrl}`
          );
        }

        // Handle Contract Call nodes
        else if (
          node.type === "contractCall" &&
          node.data.contractAddress &&
          node.data.functionName
        ) {
          console.log("📞 Found Contract Call node");
          console.log("📝 Contract data:", {
            address: node.data.contractAddress,
            function: node.data.functionName,
            parameters: node.data.parameters,
          });

          try {
            // Parse parameters
            let params = [];
            if (node.data.parameters) {
              try {
                params = JSON.parse(node.data.parameters);
              } catch (parseError) {
                console.error(
                  "❌ Invalid JSON parameters:",
                  node.data.parameters
                );
                alert(`Invalid JSON parameters: ${node.data.parameters}`);
                continue;
              }
            }

            // Create contract interface for the Simple Storage contract
            const contractABI = [
              "function store(uint256 num) public",
              "function retrieve() public view returns (uint256)",
            ];

            // Create contract instance using ethers
            const { ethers } = await import("ethers");
            const provider = new ethers.BrowserProvider(metaMask);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
              node.data.contractAddress,
              contractABI,
              signer
            );

            console.log(
              "📋 Calling contract function:",
              node.data.functionName,
              "with params:",
              params
            );

            // Call the contract function
            if (node.data.functionName === "store") {
              // For write functions, send transaction
              const tx = await contract.store(...params);
              console.log("📄 Contract transaction sent:", tx.hash);

              // Wait for confirmation
              const receipt = await tx.wait();
              console.log("✅ Contract transaction confirmed:", receipt.hash);

              const explorerUrl = `https://testnet.snowtrace.io/tx/${tx.hash}`;
              alert(
                `Contract call successful!\nFunction: ${node.data.functionName}\nValue stored: ${params[0]}\nTx Hash: ${tx.hash}\nView: ${explorerUrl}`
              );
            } else if (node.data.functionName === "retrieve") {
              // For read functions, just call
              const result = await contract.retrieve();
              console.log("📖 Contract read result:", result.toString());
              alert(
                `Contract read successful!\nFunction: ${
                  node.data.functionName
                }\nStored value: ${result.toString()}`
              );
            } else {
              console.log("❌ Unknown function:", node.data.functionName);
              alert(
                `Unknown function: ${node.data.functionName}. Available: store, retrieve`
              );
            }
          } catch (contractError: any) {
            console.error("❌ Contract call error:", contractError);
            alert(`Contract call failed: ${contractError.message}`);
            continue;
          }
        } else if (
          node.type === "whatsApp" &&
          node.data.phoneNumber &&
          node.data.message
        ) {
          console.log("📱 Found WhatsApp node");

          try {
            const response = await fetch("/api/whatsapp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                number: node.data.phoneNumber,
                message: node.data.message,
              }),
            });

            const result = await response.json();

            if (result.success) {
              console.log(
                "✅ WhatsApp message sent successfully:",
                result.data
              );
              alert(
                `📱 WhatsApp Message Sent!\nTo: ${node.data.phoneNumber}\nMessage: ${node.data.message}`
              );
            } else {
              console.error("❌ WhatsApp message failed:", result.error);
              alert(`WhatsApp Message Failed: ${JSON.stringify(result.error)}`);
            }
          } catch (error: any) {
            console.error("❌ WhatsApp error:", error);
            alert(`WhatsApp Error: ${error.message}`);
          }
        }

        // Handle Swap Token nodes (placeholder)
        else if (
          node.type === "swapToken" &&
          node.data.tokenAddress &&
          node.data.to &&
          node.data.amount
        ) {
          console.log("🔄 Found Swap Token node (not implemented yet)");
          alert("Swap functionality coming soon!");
        }

        // Handle Time Trigger nodes
        else if (node.type === "timeTrigger" && node.data.interval) {
          console.log("⏰ Found Time Trigger node");
          console.log(`⏰ Time trigger set for ${node.data.interval} seconds`);
          // Note: In a real implementation, this would set up a recurring timer
          alert(
            `Time trigger configured for ${node.data.interval} seconds interval`
          );
        }

        // Handle Price Trigger nodes
        else if (node.type === "priceTrigger" && node.data.threshold) {
          console.log("💰 Found Price Trigger node");
          console.log(`💰 Price trigger set for $${node.data.threshold}`);
          // Note: In a real implementation, this would monitor price feeds
          alert(
            `Price trigger configured for $${node.data.threshold} threshold`
          );
        }

        // Handle Compare nodes
        else if (
          node.type === "compare" &&
          node.data.operator &&
          node.data.value
        ) {
          console.log("🔍 Found Compare node");
          console.log(
            `🔍 Compare: value ${node.data.operator} ${node.data.value}`
          );
          alert(`Compare condition: ${node.data.operator} ${node.data.value}`);
        }

        // Handle Delay nodes
        else if (node.type === "delay" && node.data.delayTime) {
          console.log("⏳ Found Delay node");
          console.log(`⏳ Delaying for ${node.data.delayTime} seconds`);

          // Actually implement the delay
          await new Promise((resolve) =>
            setTimeout(resolve, parseInt(node.data.delayTime) * 1000)
          );

          alert(`Delayed execution by ${node.data.delayTime} seconds`);
        } else if (node.type === "setData" && node.data.storageKey) {
          console.log("💾 Found Set Data node");

          try {
            let valueToStore;

            if (node.data.dataType === "json" && node.data.inputJson) {
              // Parse and store JSON
              valueToStore = JSON.parse(node.data.inputJson);
              console.log("📝 Storing JSON data:", valueToStore);
            } else if (node.data.inputValue) {
              // Store simple value
              valueToStore = node.data.inputValue;
              console.log("📝 Storing value:", valueToStore);
            } else {
              console.log("❌ No data to store");
              alert("No data provided to store");
              continue;
            }

            // Store in workflow data store
            workflowDataStore.set(node.data.storageKey, valueToStore);
            console.log(`✅ Data stored with key: ${node.data.storageKey}`);
            alert(
              `Data stored successfully!\nKey: ${
                node.data.storageKey
              }\nValue: ${JSON.stringify(valueToStore)}`
            );
          } catch (error: any) {
            console.error("❌ Set Data error:", error);
            alert(`Failed to store data: ${error.message}`);
          }
        }

        // Handle Get Data nodes
        else if (node.type === "getData" && node.data.storageKey) {
          console.log("📤 Found Get Data node");

          try {
            const storedData = workflowDataStore.get(node.data.storageKey);

            if (storedData === undefined) {
              console.log("❌ No data found for key:", node.data.storageKey);
              alert(`No data found for key: ${node.data.storageKey}`);
              continue;
            }

            let outputValue = storedData;

            // If outputKey is specified and stored data is an object, extract specific key
            if (
              node.data.outputKey &&
              typeof storedData === "object" &&
              storedData !== null
            ) {
              outputValue = storedData[node.data.outputKey];
              console.log(
                `📤 Extracted value for key '${node.data.outputKey}':`,
                outputValue
              );
            } else {
              console.log("📤 Retrieved full data:", outputValue);
            }

            alert(
              `Data retrieved successfully!\nKey: ${
                node.data.storageKey
              }\nValue: ${JSON.stringify(outputValue)}`
            );
          } catch (error: any) {
            console.error("❌ Get Data error:", error);
            alert(`Failed to retrieve data: ${error.message}`);
          }
        } else if (node.type === "apiCall" && node.data.url) {
          console.log("🌐 Found API Call node");

          try {
            const response = await fetch("/api/proxy", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: node.data.url,
                method: node.data.method || "GET",
                headers: node.data.headers || "",
                body: node.data.body || "",
              }),
            });

            const result = await response.json();

            if (result.success) {
              console.log("✅ API call successful:", result.data);

              // Store API response in workflow data store
              workflowDataStore.set(`api_${node.id}`, result.data);

              alert(
                `API Call Successful!\nStatus: ${result.status}\nData stored with key: api_${node.id}`
              );
            } else {
              console.error("❌ API call failed:", result.error);
              alert(`API Call Failed: ${result.error}`);
            }
          } catch (error: any) {
            console.error("❌ API call error:", error);
            alert(`API Call Error: ${error.message}`);
          }
        }
        // Replace the existing Show Data handling with this:
        else if (node.type === "showData") {
          console.log("📊 Found Show Data node");

          try {
            let dataToShow = null;
            let dataSource = "unknown";

            // Method 1: Special case for "*" - show all data
            if (node.data.dataKey === "*") {
              const allData = {};
              for (const [key, value] of workflowDataStore.entries()) {
                allData[key] = value;
              }
              dataToShow = allData;
              dataSource = "all stored data";
            }
            // Method 2: Try to get data from connected input first
            else {
              // Find nodes that connect to this show data node
              const inputEdges = edges.filter(
                (edge) => edge.target === node.id
              );
              console.log("📊 Input edges for show data:", inputEdges);

              if (inputEdges.length > 0) {
                // Get the source node
                const sourceEdge = inputEdges[0]; // Take first input
                const sourceNodeId = sourceEdge.source;

                // Check if source node has stored data
                const possibleKeys = Array.from(
                  workflowDataStore.keys()
                ).filter((key) => key.includes(sourceNodeId));

                console.log("📊 Possible data keys from source:", possibleKeys);

                if (possibleKeys.length > 0) {
                  dataToShow = workflowDataStore.get(possibleKeys[0]);
                  dataSource = `connected node: ${possibleKeys[0]}`;
                  console.log("📊 Raw data from connected node:", dataToShow);
                }
              }

              // Method 3: If no connected input, try exact key match
              if (dataToShow === null && node.data.dataKey) {
                dataToShow = workflowDataStore.get(node.data.dataKey);
                if (dataToShow !== undefined) {
                  dataSource = `stored key: ${node.data.dataKey}`;
                }
              }
            }

            // Method 4: Extract specific property if requested
            if (
              dataToShow &&
              node.data.dataKey &&
              node.data.dataKey !== "*" &&
              typeof dataToShow === "object"
            ) {
              if (dataToShow.hasOwnProperty(node.data.dataKey)) {
                const extractedValue = dataToShow[node.data.dataKey];
                console.log(
                  `📊 Extracting property '${node.data.dataKey}':`,
                  extractedValue
                );
                dataToShow = extractedValue;
                dataSource = `property '${node.data.dataKey}' from ${dataSource}`;
              } else {
                console.log(
                  `📊 Property '${node.data.dataKey}' not found in object. Available properties:`,
                  Object.keys(dataToShow)
                );
              }
            }

            console.log("📊 Final data to show:", dataToShow);
            console.log("📊 Data source:", dataSource);

            if (dataToShow === null || dataToShow === undefined) {
              const availableKeys = Array.from(workflowDataStore.keys());
              const sampleData =
                availableKeys.length > 0
                  ? workflowDataStore.get(availableKeys[0])
                  : null;
              const availableProps =
                sampleData && typeof sampleData === "object"
                  ? Object.keys(sampleData)
                  : [];

              alert(
                `No data found!\nTried: ${
                  node.data.dataKey || "auto-detect from input"
                }\nAvailable storage keys: ${availableKeys.join(
                  ", "
                )}\nAvailable properties in latest data: ${availableProps.join(
                  ", "
                )}`
              );
              continue;
            }

            const displayLabel = node.data.displayText || "Data Display";
            const formattedData =
              typeof dataToShow === "object"
                ? JSON.stringify(dataToShow, null, 2)
                : String(dataToShow);

            // Create a modal to display the data
            const modal = document.createElement("div");
            modal.className =
              "fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50";
            modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg max-w-4xl max-h-96 overflow-auto shadow-xl">
        <h3 class="text-lg font-bold mb-2">${displayLabel}</h3>
        <p class="text-sm text-gray-600 mb-4">Source: ${dataSource}</p>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap text-gray-800">${formattedData}</pre>
        <button onclick="this.closest('.fixed').remove()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
          Close
        </button>
      </div>
    `;

            document.body.appendChild(modal);

            console.log("📊 Data displayed successfully");
          } catch (error: any) {
            console.error("❌ Show Data error:", error);
            alert(`Show Data Error: ${error.message}`);
          }
        } else if (node.type === "nftPriceTrigger" && node.data.nftContract) {
          console.log("🖼️ Found NFT Price Trigger node");

          try {
            const response = await fetch("/api/nft-price", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                nftContract: node.data.nftContract,
                tokenId: node.data.tokenId,
                marketplace: node.data.marketplace || "joepegs",
              }),
            });

            const result = await response.json();

            if (result.success) {
              const priceData = result.data;
              console.log("✅ NFT Price data fetched:", priceData);

              // Store price data in workflow data store
              workflowDataStore.set(`nft_price_${node.id}`, priceData);

              // Check price condition if specified
              if (node.data.priceThreshold && node.data.priceCondition) {
                const threshold = parseFloat(node.data.priceThreshold);
                const currentPrice = priceData.floorPrice;
                let conditionMet = false;

                switch (node.data.priceCondition) {
                  case "above":
                    conditionMet = currentPrice > threshold;
                    break;
                  case "below":
                    conditionMet = currentPrice < threshold;
                    break;
                  case "equal":
                    conditionMet = Math.abs(currentPrice - threshold) < 0.01;
                    break;
                }

                console.log(
                  `🖼️ Price condition: ${currentPrice} ${node.data.priceCondition} ${threshold} = ${conditionMet}`
                );

                if (conditionMet) {
                  alert(
                    `🖼️ NFT Price Trigger Activated!\nCurrent Price: ${currentPrice} AVAX\nCondition: ${node.data.priceCondition} ${threshold} AVAX\nMarketplace: ${priceData.marketplace}`
                  );
                } else {
                  alert(
                    `🖼️ NFT Price Checked\nCurrent Price: ${currentPrice} AVAX\nCondition NOT met: ${node.data.priceCondition} ${threshold} AVAX`
                  );
                }
              } else {
                alert(
                  `🖼️ NFT Price Retrieved!\nFloor Price: ${priceData.floorPrice} AVAX\nLast Sale: ${priceData.lastSale} AVAX\nMarketplace: ${priceData.marketplace}`
                );
              }
            } else {
              console.error("❌ NFT price fetch failed:", result.error);
              alert(`NFT Price Fetch Failed: ${result.error}`);
            }
          } catch (error: any) {
            console.error("❌ NFT price trigger error:", error);
            alert(`NFT Price Trigger Error: ${error.message}`);
          }
        }
        // Handle AI nodes
        // Replace the AI execution logic with this:

        // Handle AI nodes
        else if (node.type === "ai" && node.data.prompt) {
          console.log("🤖 Found AI node");

          try {
            let finalPrompt = node.data.prompt;

            // Replace {input} with data from previous nodes
            if (finalPrompt.includes("{input}")) {
              const inputEdges = edges.filter(
                (edge) => edge.target === node.id
              );

              if (inputEdges.length > 0) {
                const sourceNodeId = inputEdges[0].source;
                const possibleKeys = Array.from(
                  workflowDataStore.keys()
                ).filter((key) => key.includes(sourceNodeId));

                if (possibleKeys.length > 0) {
                  const inputData = workflowDataStore.get(possibleKeys[0]);
                  const dataString =
                    typeof inputData === "object"
                      ? JSON.stringify(inputData, null, 2)
                      : String(inputData);

                  finalPrompt = finalPrompt.replace("{input}", dataString);
                  console.log("🤖 Using input data in prompt");
                }
              }
            }

            // Get output actions list
            const outputActions = node.data.outputActions || [];

            // Modify prompt to only return one action from the list
            if (outputActions.length > 0) {
              finalPrompt += `\n\nIMPORTANT: You must respond with ONLY ONE of these exact words: ${outputActions.join(
                ", "
              )}. Do not include any other text, explanation, or formatting. Just return one word from this list.`;
            }

            console.log("🤖 Final prompt:", finalPrompt);

            const response = await fetch("/api/ai", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: finalPrompt,
              }),
            });

            const result = await response.json();

            if (result.success) {
              // Clean the response to get only the action
              let aiResponse = result.data.response.trim();

              // If output actions are defined, validate the response
              if (outputActions.length > 0) {
                const validAction = outputActions.find((action) =>
                  aiResponse.toLowerCase().includes(action.toLowerCase())
                );

                if (validAction) {
                  aiResponse = validAction; // Use the exact action from the list
                } else {
                  // If AI didn't return a valid action, default to first one
                  aiResponse = outputActions[0];
                  console.log(
                    "🤖 AI response not in action list, defaulting to:",
                    aiResponse
                  );
                }
              }

              console.log("✅ AI action selected:", aiResponse);

              // Store only the action
              workflowDataStore.set(`ai_${node.id}`, aiResponse);
              workflowDataStore.set(`ai_${node.id}_actions`, [aiResponse]);
              
              // Show the selected action
              //alert(`🤖 AI Decision: ${aiResponse}`);
            } else {
              console.error("❌ AI request failed:", result.error);
              alert(`AI Request Failed: ${JSON.stringify(result.error)}`);
            }
          } catch (error: any) {
            console.error("❌ AI error:", error);
            alert(`AI Error: ${error.message}`);
          }
        }
        // Skip trigger nodes and other unimplemented nodes
        else {
          console.log("⏭️ Skipping node:", node.type, node.data.label);
        }
      }

      console.log("🎉 Workflow execution completed!");
    } catch (error: any) {
      console.error("❌ Failed to execute workflow:", error);
      alert(`Failed to execute workflow: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Debug MetaMask
  const debugMetaMask = async () => {
    if (!window.ethereum) {
      console.log("❌ No ethereum object found");
      return;
    }

    try {
      console.log("🔍 DEBUGGING METAMASK STATE:");
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      console.log("📋 Accounts from eth_accounts:", accounts);

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      console.log("🌐 Chain ID from eth_chainId:", chainId, "decimal:", parseInt(chainId, 16));
    } catch (error) {
      console.error("❌ Debug error:", error);
    }
  };

  // Utility functions
  const clearWorkflow = () => {
    if (confirm("Are you sure you want to clear the entire workflow?")) {
      setNodes(getInitialNodes());
      setEdges(getInitialEdges());
      localStorage.removeItem("avax-workflow-v3");
    }
  };

  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) =>
      eds.filter((e) => {
        const sourceExists = nodes.some((n) => n.id === e.source && !n.selected);
        const targetExists = nodes.some((n) => n.id === e.target && !n.selected);
        return sourceExists && targetExists;
      })
    );
  };

  const exportWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      metadata: {
        created: new Date().toISOString(),
        version: "3.0",
      },
    };

    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `avax-workflow-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target?.result as string);
        if (workflow.nodes && workflow.edges) {
          setNodes(workflow.nodes);
          setEdges(workflow.edges);
        }
      } catch (error) {
        alert("Invalid workflow file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Workflow Builder...</p>
        </div>
      </div>
    );
  }

  const actionCount = nodes.filter((n) => n.type === "sendAvax" || n.type === "swapToken" || n.type === "contractCall" || n.type === "action").length;
  const triggerCount = nodes.filter((n) => n.type === "blockTrigger" || n.type === "timeTrigger" || n.type === "priceTrigger" || n.type === "trigger").length;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">AVAX Workflow</h1>
          <p className="text-sm text-gray-500">Build automation workflows</p>
        </div>

        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Trigger Nodes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Trigger Nodes
            </h3>
            <button
              onClick={() =>
                addNode(
                  "blockTrigger",
                  "New Block Trigger",
                  "Triggers when a new block is mined"
                )
              }
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              🔗 Block Trigger
            </button>
            <button
              onClick={() =>
                addNode(
                  "timeTrigger",
                  "Time Trigger",
                  "Triggers at specified intervals"
                )
              }
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              ⏰ Time Trigger
            </button>
            <button
              onClick={() =>
                addNode(
                  "priceTrigger",
                  "Price Trigger",
                  "Triggers when price reaches threshold"
                )
              }
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              💰 Price Trigger
            </button>
            <button
              onClick={() =>
                addNode(
                  "nftPriceTrigger",
                  "NFT Price Trigger",
                  "Triggers when NFT price meets conditions"
                )
              }
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              🖼️ NFT Price Trigger
            </button>
          </div>

          {/* Action Nodes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Action Nodes
            </h3>
            <button
              onClick={() =>
                addNode("sendAvax", "Send AVAX", "Send AVAX to an address")
              }
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              💸 Send AVAX
            </button>
            <button
              onClick={() =>
                addNode("swapToken", "Swap Tokens", "Swap tokens via DEX")
              }
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              🔄 Swap Tokens
            </button>
            <button
              onClick={() =>
                addNode(
                  "contractCall",
                  "Contract Call",
                  "Call smart contract function"
                )
              }
              className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              📞 Contract Call
            </button>
            <button
              onClick={() =>
                addNode("apiCall", "API Call", "Make HTTP requests to APIs")
              }
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              🌐 API Call
            </button>
            <button
              onClick={() =>
                addNode("showData", "Show Data", "Display data in UI")
              }
              className="w-full bg-pink-500 hover:bg-pink-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              📊 Show Data
            </button>
            <button
              onClick={() =>
                addNode("whatsApp", "Send WhatsApp", "Send WhatsApp message")
              }
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              📱 Send WhatsApp
            </button>
            <button
              onClick={() =>
                addNode(
                  "ai",
                  "AI Assistant",
                  "Generate AI responses"
                )
              }
              className="w-full bg-violet-500 hover:bg-violet-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              🤖 AI Assistant
            </button>
          </div>

          {/* Condition Nodes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Condition Nodes
            </h3>
            <button
              onClick={() =>
                addNode(
                  "compare",
                  "Compare Values",
                  "Compare values with conditions"
                )
              }
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              🔍 Compare
            </button>
            <button
              onClick={() => addNode("delay", "Delay", "Add delay to workflow")}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              ⏳ Delay
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Data Nodes
            </h3>
            <button
              onClick={() =>
                addNode("setData", "Set Data", "Store data for later use")
              }
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              💾 Set Data
            </button>
            <button
              onClick={() =>
                addNode("getData", "Get Data", "Retrieve stored data")
              }
              className="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors text-left"
            >
              📤 Get Data
            </button>
          </div>

          {/* Workflow Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Actions
            </h3>
            <button
              onClick={executeWorkflow}
              disabled={isExecuting || actionCount === 0}
              className={`w-full text-white text-sm py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isExecuting || actionCount === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isExecuting ? "⏳ Executing..." : "▶ Run Workflow"}
            </button>

            <button
              onClick={deleteSelected}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors"
            >
              🗑 Delete Selected
            </button>

            <button
              onClick={debugMetaMask}
              className="w-full bg-yellow-500 text-white text-sm py-2.5 px-4 rounded-lg transition-colors"
            >
              Debug MetaMask
            </button>
          </div>

          {/* Wallet Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Wallet
            </h3>
            <AvaxWallet />
          </div>

          {/* File Operations */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              File
            </h3>
            <button
              onClick={exportWorkflow}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors"
            >
              📤 Export Workflow
            </button>

            <label className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
              📁 Import Workflow
              <input
                type="file"
                accept=".json"
                onChange={importWorkflow}
                className="hidden"
              />
            </label>

            <button
              onClick={clearWorkflow}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors"
            >
              🔄 Clear All
            </button>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Nodes:</span>
              <span className="font-medium">{nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Triggers:</span>
              <span className="font-medium text-blue-600">{triggerCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Actions:</span>
              <span className="font-medium text-green-600">{actionCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Connections:</span>
              <span className="font-medium">{edges.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { stroke: "#3b82f6", strokeWidth: 2 },
          }}
          minZoom={0.2}
          maxZoom={2}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background color="#e2e8f0" gap={20} size={1} variant="dots" as any />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              if (node.type?.includes("Trigger") || node.type === "trigger")
                return "#3b82f6";
              if (
                node.type?.includes("send") ||
                node.type?.includes("swap") ||
                node.type?.includes("contract") ||
                node.type === "action"
              )
                return "#10b981";
              if (
                node.type?.includes("compare") ||
                node.type?.includes("delay")
              )
                return "#f59e0b";
              return "#6b7280";
            }}
            maskColor="rgba(0,0,0,0.05)"
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
