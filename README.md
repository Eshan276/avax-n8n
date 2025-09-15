# AVAX Workflow Builder 🚀

A visual workflow automation platform for Avalanche blockchain operations. Build, connect, and execute complex blockchain workflows using a drag-and-drop interface.

---

## Features

### 🎯 Trigger Nodes
- **Block Trigger**: Execute workflows when new blocks are mined.
- **Time Trigger**: Schedule workflows to run at specified intervals.
- **Price Trigger**: Monitor token price thresholds and execute actions.

### ⚡ Action Nodes
- **Send AVAX**: Transfer AVAX tokens to specified addresses.
- **Swap Tokens**: Exchange tokens via DEX protocols.
- **Contract Call**: Interact with deployed smart contracts.
- **API Call**: Make HTTP requests to external APIs.
- **Show Data**: Display workflow results in the UI.
- **WhatsApp Integration**: Send notifications via WhatsApp.
- **AI Assistant**: Integrate AI-powered operations.

### 🔧 Condition Nodes
- **Compare Values**: Compare data with conditional logic.
- **Delay**: Add time delays between workflow steps.

### 🏗️ Smart Contract Tools
- **Custom Contract Builder**: Visual contract creation with:
    - State variable management.
    - Function generation with pre-built operations (set, get, increment, transfer).
    - Auto-generated Solidity code.
    - Contract deployment simulation.

---

## Getting Started

### Prerequisites
- **Node.js 18+**
- **MetaMask wallet**
- **Avalanche Fuji testnet setup**

### Installation
1. Clone the repository.
2. Install dependencies:
     ```bash
     npm install
     ```
3. Create a `.env.local` file and configure environment variables.

---

## Usage

### 1. Connect Wallet
- Click **"Connect Wallet"** to link your MetaMask.
- Ensure you're on Avalanche Fuji testnet (Chain ID: `43113`).

### 2. Build Workflows
- Drag nodes from the sidebar to the canvas.
- Connect nodes using handles to create workflow logic.
- Configure each node with required parameters.

### 3. Execute Workflows
- Click **"▶ Run Workflow"** to execute your automation.
- Monitor execution in the browser console.
- View transaction results on Avalanche Explorer.

---

## Node Configuration

### Send AVAX Node
- Configure recipient address and amount.
- Ensure sufficient AVAX balance for gas fees.

### Contract Call Node
- Provide contract address and ABI.
- Specify the function name and parameters.

### API Call Node
- Enter the API endpoint URL.
- Add headers and payload as needed.

### Time Trigger Node
- Set the desired interval for workflow execution.

---

## Workflow Examples

1. **Price Monitoring Bot**: Monitor token prices and execute trades.
2. **Automated DCA (Dollar Cost Averaging)**: Schedule periodic token purchases.
3. **Smart Contract Automation**: Automate interactions with deployed contracts.

---

## Development

### Project Structure
- **Components**: UI components for nodes and workflows.
- **Services**: Blockchain and API integration logic.
- **Utils**: Helper functions for data processing.

### Adding New Nodes
1. **Create Node Component**: Add a new React component for the node.
2. **Register Node Type**: Update the node registry with the new type.
3. **Add Execution Logic**: Implement the node's functionality.

---

## Blockchain Integration

### Supported Networks
- **Avalanche Fuji Testnet** (Chain ID: `43113`).

### Contract ABIs
- Pre-configured ABIs for common contracts:
    - **Simple Storage Contract**
    - **ERC-20 Token Standard**
- Custom contract support via ABI input.

### Transaction Handling
- Automatic gas estimation.
- Transaction confirmation waiting.
- Explorer link generation.
- Error handling and user feedback.

---

## Troubleshooting

### Common Issues

#### MetaMask Not Detected
- Ensure MetaMask extension is installed.
- Refresh the page and try again.

#### Wrong Network
- Switch to Avalanche Fuji testnet in MetaMask.
- Chain ID should be `43113`.

#### Transaction Failures
- Check AVAX balance for gas fees.
- Verify contract addresses and parameters.
- Ensure proper function signatures.

#### API Call Errors
- Check CORS policies for external APIs.
- Verify API endpoint URLs and authentication.

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add tests if applicable.
5. Submit a pull request.

---

## Technologies Used
- **Frontend**: Next.js 15, React 19, TypeScript.
- **Blockchain**: Ethers.js v6, MetaMask integration.
- **UI**: React Flow, Tailwind CSS.
- **State Management**: React Hooks.

---

## License
This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

## Support
For questions and support:
- Create an issue on GitHub.
- Check the documentation.
- Review workflow examples.


