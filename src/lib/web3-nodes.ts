import { ethers } from "ethers";

export async function getLatestBlock(provider: ethers.Provider) {
  const block = await provider.getBlock("latest");
  return block;
}

export async function sendAvaxTx(
  provider: ethers.Provider,
  wallet: ethers.Wallet | null,
  to: string,
  amount: string
) {
  if (!wallet) throw new Error("Wallet not connected");
  if (!ethers.isAddress(to)) throw new Error("Invalid address");
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(amount),
    chainId: 43113, // Fuji testnet
  });
  return tx.hash;
}
