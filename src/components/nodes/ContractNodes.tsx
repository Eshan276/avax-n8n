import { Handle, Position, NodeProps } from "reactflow";
import { useState, useEffect } from "react";

interface CustomContractNodeData {
  label: string;
  description: string;
  type: string;
  contractName: string;
  accounts: Array<{
    name: string;
    address: string;
    balance: string;
    variableType: string; // New: uint256, address, bool, etc.
  }>;
  functions: Array<{
    name: string;
    parameters: string;
    visibility: string;
    returnType: string;
    functionBody: string; // New: what the function actually does
    description: string; // New: function description
  }>;
  selectedFunction: string;
  callParameters: string;
  deployedAddress?: string;
}

export function CustomContractNode({
  id,
  data,
  selected,
}: NodeProps<CustomContractNodeData>) {
  const [localData, setLocalData] = useState({
    ...data,
    accounts: data.accounts || [],
    functions: data.functions || [],
  });
  const generateFunctionBody = (func: any, accounts: any[]) => {
    const targetVar = accounts.find((acc) => acc.name === func.targetVariable);

    if (!func.operation || !targetVar) {
      return "// Select operation and variable above";
    }

    let code = "";

    switch (func.operation) {
      case "set":
        if (func.parameters) {
          const paramName =
            func.parameters.split(" ")[1]?.replace(",", "") || "_value";
          code = `${targetVar.name} = ${paramName};\nemit ${func.name}Called(${targetVar.name});`;
        } else {
          code = `// Add parameter like: ${targetVar.variableType} _newValue\n${targetVar.name} = _newValue;`;
        }
        break;

      case "get":
        code = `return ${targetVar.name};`;
        break;

      case "increment":
        if (targetVar.variableType === "uint256") {
          code = `${targetVar.name} += 1;\nemit ${func.name}Called(${targetVar.name});`;
        } else {
          code = `// Can only increment uint256 variables`;
        }
        break;

      case "transfer":
        if (targetVar.variableType === "address") {
          code = `payable(${targetVar.name}).transfer(msg.value);\nemit ${func.name}Called(msg.value);`;
        } else {
          code = `// Transfer requires address variable`;
        }
        break;

      case "custom":
        code = func.functionBody || "// Write custom logic here";
        break;

      default:
        code = "// Select an operation";
    }

    return code;
  };
  const updateNodeData = (key: string, value: any) => {
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

  // Add new account
  const addAccount = () => {
    const newAccount = {
      name: `account${localData.accounts.length + 1}`,
      address: "",
      balance: "0",
      variableType: "address", // Default to address
    };
    updateNodeData("accounts", [...localData.accounts, newAccount]);
  };

  // Update account
  const updateAccount = (index: number, field: string, value: string) => {
    const updatedAccounts = [...localData.accounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    updateNodeData("accounts", updatedAccounts);
  };

  // Remove account
  const removeAccount = (index: number) => {
    const updatedAccounts = localData.accounts.filter((_, i) => i !== index);
    updateNodeData("accounts", updatedAccounts);
  };

  // Add new function
  const addFunction = () => {
    const newFunction = {
      name: `myFunction${localData.functions.length + 1}`,
      parameters: "",
      visibility: "public",
      returnType: "void",
      functionBody:
        "// Write your function logic here\n// Example: value = _newValue;",
      description: "Describe what this function does",
    };
    updateNodeData("functions", [...localData.functions, newFunction]);
  };

  // Update function
  const updateFunction = (index: number, field: string, value: string) => {
    const updatedFunctions = [...localData.functions];
    updatedFunctions[index] = { ...updatedFunctions[index], [field]: value };
    updateNodeData("functions", updatedFunctions);
  };

  // Remove function
  const removeFunction = (index: number) => {
    const updatedFunctions = localData.functions.filter((_, i) => i !== index);
    updateNodeData("functions", updatedFunctions);
  };

  useEffect(() => {
    setLocalData({
      ...data,
      accounts: data.accounts || [],
      functions: data.functions || [],
    });
  }, [data]);

  return (
    <div
      className={`p-4 border rounded-lg bg-white shadow-sm min-w-[450px] max-w-[550px] ${
        selected ? "border-purple-500 shadow-md" : "border-gray-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !border-purple-600"
      />

      <div className="font-medium mb-3 text-sm text-gray-800 flex items-center gap-2">
        🏗️ {localData.label}
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Contract Name - stays the same */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Contract Name
          </label>
          <input
            className="w-full p-2 text-xs border border-gray-300 rounded focus:border-purple-500 focus:outline-none text-gray-600"
            placeholder="MyContract"
            value={localData.contractName || ""}
            onChange={(e) => updateNodeData("contractName", e.target.value)}
          />
        </div>

        {/* State Variables Section - stays the same */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-gray-700">
              State Variables ({localData.accounts.length})
            </label>
            <button
              onClick={addAccount}
              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
            >
              + Add Variable
            </button>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {localData.accounts.map((account, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded border">
                <div className="flex justify-between items-center mb-1">
                  <input
                    className="flex-1 p-1 text-xs border rounded mr-2 text-gray-600"
                    placeholder="Variable name (e.g., owner, balance, count)"
                    value={account.name}
                    onChange={(e) =>
                      updateAccount(index, "name", e.target.value)
                    }
                  />
                  <button
                    onClick={() => removeAccount(index)}
                    className="bg-red-500 text-white px-1 py-1 rounded text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1 mb-1">
                  <select
                    className="p-1 text-xs border rounded text-gray-600"
                    value={account.variableType}
                    onChange={(e) =>
                      updateAccount(index, "variableType", e.target.value)
                    }
                  >
                    <option value="address">address</option>
                    <option value="uint256">uint256</option>
                    <option value="string">string</option>
                    <option value="bool">bool</option>
                    <option value="bytes32">bytes32</option>
                    <option value="mapping">mapping</option>
                  </select>

                  <input
                    className="p-1 text-xs border rounded text-gray-600"
                    placeholder="Initial value"
                    value={account.balance}
                    onChange={(e) =>
                      updateAccount(index, "balance", e.target.value)
                    }
                  />
                </div>

                <input
                  className="w-full p-1 text-xs border rounded text-gray-600"
                  placeholder="Address or value (optional)"
                  value={account.address}
                  onChange={(e) =>
                    updateAccount(index, "address", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Functions Section - REPLACE THIS ENTIRE SECTION */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-gray-700">
              Functions ({localData.functions.length})
            </label>
            <button
              onClick={addFunction}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              + Add Function
            </button>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto">
            {localData.functions.map((func, index) => (
              <div key={index} className="bg-blue-50 p-3 rounded border">
                {/* Function Name & Remove */}
                <div className="flex justify-between items-center mb-2">
                  <input
                    className="flex-1 p-1 text-xs border rounded mr-2 text-gray-600 font-medium"
                    placeholder="Function name (e.g., increment, transfer)"
                    value={func.name}
                    onChange={(e) =>
                      updateFunction(index, "name", e.target.value)
                    }
                  />
                  <button
                    onClick={() => removeFunction(index)}
                    className="bg-red-500 text-white px-1 py-1 rounded text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>

                {/* Description */}
                <input
                  className="w-full p-1 text-xs border rounded mb-2 text-gray-600"
                  placeholder="Describe what this function does"
                  value={func.description}
                  onChange={(e) =>
                    updateFunction(index, "description", e.target.value)
                  }
                />

                {/* Visibility & Return Type */}
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <select
                    className="p-1 text-xs border rounded text-gray-600"
                    value={func.visibility}
                    onChange={(e) =>
                      updateFunction(index, "visibility", e.target.value)
                    }
                  >
                    <option value="public">public</option>
                    <option value="external">external</option>
                    <option value="internal">internal</option>
                    <option value="private">private</option>
                  </select>

                  <select
                    className="p-1 text-xs border rounded text-gray-600"
                    value={func.returnType}
                    onChange={(e) =>
                      updateFunction(index, "returnType", e.target.value)
                    }
                  >
                    <option value="void">void</option>
                    <option value="uint256">uint256</option>
                    <option value="string">string</option>
                    <option value="bool">bool</option>
                    <option value="address">address</option>
                  </select>
                </div>

                {/* Parameters */}
                <input
                  className="w-full p-1 text-xs border rounded mb-2 text-gray-600"
                  placeholder="Parameters: uint256 _value, address _to"
                  value={func.parameters}
                  onChange={(e) =>
                    updateFunction(index, "parameters", e.target.value)
                  }
                />

                {/* Function Body - NEW SECTION */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Function Body:
                  </label>

                  {/* Operation selector */}
                  <select
                    className="w-full p-1 text-xs border rounded mb-2 text-gray-600"
                    value={func.operation || ""}
                    onChange={(e) =>
                      updateFunction(index, "operation", e.target.value)
                    }
                  >
                    <option value="">Select operation</option>
                    <option value="set">Set variable value</option>
                    <option value="get">Get variable value</option>
                    <option value="increment">Increment variable</option>
                    <option value="transfer">Transfer tokens</option>
                    <option value="custom">Custom logic</option>
                  </select>

                  {/* Variable selector */}
                  {localData.accounts.length > 0 && (
                    <select
                      className="w-full p-1 text-xs border rounded mb-2 text-gray-600"
                      value={func.targetVariable || ""}
                      onChange={(e) =>
                        updateFunction(index, "targetVariable", e.target.value)
                      }
                    >
                      <option value="">Select variable to use</option>
                      {localData.accounts.map((account, idx) => (
                        <option key={idx} value={account.name}>
                          {account.name} ({account.variableType})
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Auto-generated function body preview */}
                  <div className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-600">
                    <div className="text-xs font-medium mb-1">
                      Generated Code:
                    </div>
                    <pre className="whitespace-pre-wrap">
                      {generateFunctionBody(func, localData.accounts)}
                    </pre>
                  </div>

                  {/* Custom logic textarea (only show when custom is selected) */}
                  {func.operation === "custom" && (
                    <textarea
                      className="w-full p-2 text-xs border rounded mt-2 text-gray-600 font-mono"
                      placeholder="Write custom Solidity code here..."
                      rows={3}
                      value={func.functionBody || ""}
                      onChange={(e) =>
                        updateFunction(index, "functionBody", e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rest of the component stays the same... */}
        {/* Function Call Section */}
        {localData.functions.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Test Function Call
            </label>
            <select
              className="w-full p-2 text-xs border border-gray-300 rounded focus:border-purple-500 focus:outline-none mb-2 text-gray-600"
              value={localData.selectedFunction || ""}
              onChange={(e) =>
                updateNodeData("selectedFunction", e.target.value)
              }
            >
              <option value="">Select function to call</option>
              {localData.functions.map((func, index) => (
                <option key={index} value={func.name}>
                  {func.name}({func.parameters}) - {func.description}
                </option>
              ))}
            </select>

            {localData.selectedFunction && (
              <input
                className="w-full p-2 text-xs border border-gray-300 rounded focus:border-purple-500 focus:outline-none text-gray-600"
                placeholder="Call parameters as JSON: [123, '0x123...', 'hello']"
                value={localData.callParameters || ""}
                onChange={(e) =>
                  updateNodeData("callParameters", e.target.value)
                }
              />
            )}
          </div>
        )}

        {/* Deploy Status */}
        {localData.deployedAddress && (
          <div className="bg-green-50 p-2 rounded">
            <div className="text-xs font-medium text-green-800">
              ✅ Contract Deployed
            </div>
            <div className="text-xs font-mono text-green-600 break-all">
              {localData.deployedAddress}
            </div>
          </div>
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