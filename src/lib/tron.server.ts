// Server-only TronGrid helpers. Free public API, no key required.
import { PLATFORM_WALLET, USDT_TRC20_CONTRACT } from "./constants";

// Convert hex 0x... or 41... address to base58 TRON address using TronGrid /wallet/validateaddress
async function hexToBase58(hex: string): Promise<string | null> {
  try {
    const r = await fetch("https://api.trongrid.io/wallet/validateaddress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address: hex }),
    });
    const j = await r.json();
    return j.base58 ?? null;
  } catch {
    return null;
  }
}

export interface TxVerifyResult {
  valid: boolean;
  reason?: string;
  amount?: number; // USDT
  to?: string;
  from?: string;
}

/**
 * Verify a TRC20 USDT transaction:
 *  - Confirms on-chain
 *  - Contract is USDT TRC20
 *  - Recipient equals our platform wallet
 *  - Returns the amount transferred (in USDT)
 */
export async function verifyUsdtDeposit(txid: string): Promise<TxVerifyResult> {
  try {
    const res = await fetch(`https://api.trongrid.io/v1/transactions/${encodeURIComponent(txid)}`);
    if (!res.ok) return { valid: false, reason: "txid_not_found" };
    const json = await res.json();
    const data = json?.data?.[0];
    if (!data) return { valid: false, reason: "txid_not_found" };

    const ret = data?.ret?.[0]?.contractRet;
    if (ret !== "SUCCESS") return { valid: false, reason: `tx_status_${ret ?? "unknown"}` };

    const contract = data?.raw_data?.contract?.[0];
    if (contract?.type !== "TriggerSmartContract") return { valid: false, reason: "not_smart_contract" };

    const value = contract.parameter?.value;
    const contractAddrHex: string | undefined = value?.contract_address;
    const dataHex: string | undefined = value?.data;
    const ownerHex: string | undefined = value?.owner_address;
    if (!contractAddrHex || !dataHex) return { valid: false, reason: "missing_contract_data" };

    const contractB58 = await hexToBase58(contractAddrHex);
    if (contractB58 !== USDT_TRC20_CONTRACT) return { valid: false, reason: "not_usdt_trc20" };

    // ERC20-style transfer(address,uint256): method 0xa9059cbb (4 bytes) + 32-byte recipient + 32-byte amount
    // TronGrid omits the 0x prefix and may also omit method id (depending on raw_data); handle both
    let payload = dataHex.toLowerCase();
    if (payload.startsWith("0x")) payload = payload.slice(2);
    if (payload.startsWith("a9059cbb")) payload = payload.slice(8);
    if (payload.length < 128) return { valid: false, reason: "bad_payload" };

    const recipientHex = "41" + payload.slice(24, 64); // TRON addresses start with 0x41
    const amountHex = payload.slice(64, 128);
    const recipientB58 = await hexToBase58(recipientHex);
    const ownerB58 = ownerHex ? await hexToBase58(ownerHex) : undefined;

    if (recipientB58 !== PLATFORM_WALLET) {
      return { valid: false, reason: "wrong_recipient", to: recipientB58 ?? undefined, from: ownerB58 ?? undefined };
    }

    const amountRaw = BigInt("0x" + amountHex);
    // USDT TRC20 uses 6 decimals
    const amount = Number(amountRaw) / 1_000_000;
    return { valid: true, amount, to: recipientB58, from: ownerB58 };
  } catch (e) {
    console.error("verifyUsdtDeposit error", e);
    return { valid: false, reason: "verify_exception" };
  }
}
