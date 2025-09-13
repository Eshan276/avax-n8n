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

// Types
interface ActionNodeData {
  label: string;
  to?: string;
  amount?: string;
}

interface WorkflowNode extends Node {
  data: ActionNodeData;
}

// Custom ActionNode component
function ActionNode({ id, data, selected }: any) {
  const [localData, setLocalData] = useState(data);

  const updateNodeData = (key: string, value: string) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);

    // Dispatch custom event to parent
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

// Trigger Node Component
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

// Node types
const nodeTypes: NodeTypes = {
  action: ActionNode,
  trigger: TriggerNode,
};

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

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
      type: "trigger",
      data: { label: "New AVAX Block" },
      position: { x: 250, y: 50 },
    },
    {
      id: "2",
      type: "action",
      data: { label: "Action: Send AVAX", to: "", amount: "" },
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

    // Load from localStorage
    try {
      const saved = localStorage.getItem("avax-workflow-v2");
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

    // Set defaults
    setNodes(getInitialNodes());
    setEdges(getInitialEdges());
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted || nodes.length === 0) return;

    try {
      const workflow = {
        nodes: nodes.map((node) => ({
          ...node,
          data: {
            label: node.data.label,
            to: node.data.to || "",
            amount: node.data.amount || "",
          },
        })),
        edges,
        timestamp: Date.now(),
      };

      localStorage.setItem("avax-workflow-v2", JSON.stringify(workflow));
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

  // Add node functions
  const addTriggerNode = () => {
    const newNode: WorkflowNode = {
      id: `trigger-${Date.now()}`,
      type: "trigger",
      data: { label: "New AVAX Block" },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 200 + 50,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addActionNode = () => {
    const newNode: WorkflowNode = {
      id: `action-${Date.now()}`,
      type: "action",
      data: { label: "Action: Send AVAX", to: "", amount: "" },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 200,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Execute workflow
  // Add this helper function at the top of your component (same as in AvaxWallet)
  const getMetaMaskProvider = () => {
    if (typeof window === "undefined") return null;

    // If there are multiple providers, find MetaMask specifically
    if (window.ethereum?.providers) {
      return window.ethereum.providers.find(
        (provider: any) => provider.isMetaMask
      );
    }

    // If single provider and it's MetaMask
    if (window.ethereum?.isMetaMask) {
      return window.ethereum;
    }

    return null;
  };

  const executeWorkflow = async () => {
    // Use the specific MetaMask provider instead of generic window.ethereum
    const metaMask = getMetaMaskProvider();

    if (!metaMask) {
      alert("MetaMask not found or not available");
      return;
    }

    try {
      setIsExecuting(true);
      console.log("🚀 Starting workflow execution...");

      // Get the connected account from MetaMask specifically
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

      // Check if we're on Fuji testnet using MetaMask provider
      const chainId = await metaMask.request({
        method: "eth_chainId",
      });

      const chainIdDecimal = parseInt(chainId, 16);
      console.log("🌐 Current chain ID (hex):", chainId);
      console.log("🌐 Current chain ID (decimal):", chainIdDecimal);
      console.log("🌐 Expected Fuji chain ID (hex): 0xA869");
      console.log("🌐 Expected Fuji chain ID (decimal): 43113");
      console.log(
        "🌐 Chain ID match check:",
        chainId === "0xA869",
        chainIdDecimal === 43113
      );

      // Get current network info
      try {
        const networkVersion = await metaMask.request({
          method: "net_version",
        });
        console.log("🌐 Network version:", networkVersion);
      } catch (netError) {
        console.log("❌ Could not get network version:", netError);
      }

      if (chainId !== "0xA869" && chainIdDecimal !== 43113) {
        console.log("❌ Wrong network detected!");
        alert(
          `Please switch to Avalanche Fuji testnet.\nCurrent: ${chainIdDecimal}\nExpected: 43113`
        );
        return;
      }

      console.log("✅ Correct network confirmed - Avalanche Fuji");

      // Get current balance
      try {
        const balance = await metaMask.request({
          method: "eth_getBalance",
          params: [account, "latest"],
        });
        const balanceInAvax = (
          parseInt(balance, 16) / Math.pow(10, 18)
        ).toFixed(4);
        console.log("💰 Current balance:", balanceInAvax, "AVAX");
      } catch (balanceError) {
        console.log("❌ Could not get balance:", balanceError);
      }

      console.log("📊 Processing nodes:", nodes.length);

      // Execute each action node
      for (const node of nodes) {
        console.log("🔍 Processing node:", node.id, node.type, node.data.label);

        if (node.type === "action" && node.data.label.includes("Send AVAX")) {
          console.log("💸 Found Send AVAX action node");
          console.log("📝 Node data:", {
            to: node.data.to,
            amount: node.data.amount,
            label: node.data.label,
          });

          if (!node.data.to || !node.data.amount) {
            console.log("❌ Missing required fields for node:", node.id);
            alert(`Node ${node.id} missing recipient address or amount`);
            continue;
          }

          // Validate recipient address
          const addressRegex = /^0x[a-fA-F0-9]{40}$/;
          const isValidAddress = addressRegex.test(node.data.to);
          console.log("🔍 Address validation:", {
            address: node.data.to,
            isValid: isValidAddress,
            length: node.data.to.length,
          });

          if (!isValidAddress) {
            console.log("❌ Invalid address format");
            alert(`Invalid recipient address: ${node.data.to}`);
            continue;
          }

          // Convert amount to wei (18 decimals for AVAX)
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

          console.log(
            `📤 Preparing to send ${node.data.amount} AVAX to ${node.data.to}`
          );

          const txParams = {
            from: account,
            to: node.data.to,
            value: amountInWeiHex,
            gas: "0x5208", // 21000 gas for simple transfer
          };

          console.log("📋 Transaction parameters:", txParams);

          // Send transaction using MetaMask specifically
          console.log("🔄 Sending transaction...");
          const txHash = await metaMask.request({
            method: "eth_sendTransaction",
            params: [txParams],
          });

          console.log("✅ Transaction sent successfully!");
          console.log("📄 Transaction hash:", txHash);

          const explorerUrl = `https://testnet.snowtrace.io/tx/${txHash}`;
          console.log("🔗 Explorer URL:", explorerUrl);

          alert(
            `Transaction sent successfully!\nTx Hash: ${txHash}\nView on explorer: ${explorerUrl}`
          );
        } else {
          console.log(
            "⏭️ Skipping non-action node:",
            node.type,
            node.data.label
          );
        }
      }

      console.log("🎉 Workflow execution completed!");
    } catch (error: any) {
      console.error("❌ Failed to execute workflow:", error);
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      alert(`Failed to execute workflow: ${error.message}`);
    } finally {
      setIsExecuting(false);
      console.log("🏁 Execution finished, isExecuting set to false");
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

      // Check accounts
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      console.log("📋 Accounts from eth_accounts:", accounts);

      // Check chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      console.log(
        "🌐 Chain ID from eth_chainId:",
        chainId,
        "decimal:",
        parseInt(chainId, 16)
      );

      // Check network version
      const networkVersion = await window.ethereum.request({
        method: "net_version",
      });
      console.log("🌐 Network version:", networkVersion);

      // Check if MetaMask is the active provider
      console.log("🦊 Is MetaMask:", window.ethereum.isMetaMask);
      console.log("🦊 Providers:", window.ethereum.providers);
    } catch (error) {
      console.error("❌ Debug error:", error);
    }
  };

  // Clear workflow
  const clearWorkflow = () => {
    if (confirm("Are you sure you want to clear the entire workflow?")) {
      setNodes(getInitialNodes());
      setEdges(getInitialEdges());
      localStorage.removeItem("avax-workflow-v2");
    }
  };

  // Delete selected nodes
  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) =>
      eds.filter((e) => {
        const sourceExists = nodes.some(
          (n) => n.id === e.source && !n.selected
        );
        const targetExists = nodes.some(
          (n) => n.id === e.target && !n.selected
        );
        return sourceExists && targetExists;
      })
    );
  };

  // Export workflow
  const exportWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      metadata: {
        created: new Date().toISOString(),
        version: "2.0",
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

  // Import workflow
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
          <p className="mt-4 text-gray-600 font-medium">
            Loading Workflow Builder...
          </p>
        </div>
      </div>
    );
  }

  const actionCount = nodes.filter((n) => n.type === "action").length;
  const triggerCount = nodes.filter((n) => n.type === "trigger").length;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">AVAX Workflow</h1>
          <p className="text-sm text-gray-500">Build automation workflows</p>
        </div>

        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Add Nodes Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Add Nodes
            </h3>
            <button
              onClick={addTriggerNode}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              🚀 Trigger Node
            </button>
            <button
              onClick={addActionNode}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              ⚡ Action Node
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
            nodeColor={(node) =>
              node.type === "trigger" ? "#3b82f6" : "#10b981"
            }
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
