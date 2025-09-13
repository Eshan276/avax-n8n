import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { sendAvaxTx } from "../../../lib/web3-nodes";

export async function POST(req: NextRequest) {
  try {
    const { nodes, edges, privateKey } = await req.json(); // Private key for demo; secure in prod
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_URL
    );
    const wallet = privateKey ? new ethers.Wallet(privateKey, provider) : null;

    let output: Record<string, any> = {};

    // Simple sequential execution (improve for complex flows)
    for (const node of nodes) {
      if (node.type === "input" && node.data.label.includes("New AVAX Block")) {
        const block = await provider.getBlock("latest");
        output[node.id] = { blockNumber: block?.number };
      } else if (
        node.type === "action" &&
        node.data.label.includes("Send AVAX")
      ) {
        if (!node.data.to || !node.data.amount) {
          throw new Error(`Node ${node.id} missing to/amount`);
        }
        const txHash = await sendAvaxTx(
          provider,
          wallet,
          node.data.to,
          node.data.amount
        );
        output[node.id] = { txHash };
      }
    }

    return NextResponse.json({ output });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
