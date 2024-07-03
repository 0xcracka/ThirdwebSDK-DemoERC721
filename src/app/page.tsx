/* eslint-disable react/jsx-no-undef */

"use client";
import Image from "next/image";
import {
  ConnectButton,
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { get } from "http";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  claimTo,
  getActiveClaimCondition,
  getTotalClaimedSupply,
  nextTokenIdToMint,
} from "thirdweb/extensions/erc721";
import { Arimo } from "next/font/google";
import { useState } from "react";

export default function Home() {
  const account = useActiveAccount();

  const chain = defineChain(baseSepolia);
  console.log(chain);

  const [quantity, setQuantity] = useState(1);

  const contract = getContract({
    client: client,
    chain: chain,
    address: "0xfc3457eaa33913c7d582bb955e6aeef1dadf3ec0",
  });

  const { data: contractMetadata, isLoading: isContractMetadataLoading } =
    useReadContract(getContractMetadata, {
      contract: contract,
    });
  console.log(contractMetadata);

  const { data: claimSupply, isLoading: isClaimSupplyLoading } =
    useReadContract(getTotalClaimedSupply, {
      contract: contract,
    });

  const { data: totalNFTSupply, isLoading: isTotalNFTSupplyLoading } =
    useReadContract(nextTokenIdToMint, {
      contract: contract,
    });

  const { data: claimCondition, isLoading: isClaimConditionLoading } =
    useReadContract(getActiveClaimCondition, {
      contract: contract,
    });

  const getPrice = (quantity: number) => {
    const total =
      quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center">
        <Header />
        <ConnectButton client={client} chain={chain} />

        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="rounded-xl"
              />
              <h2 className="text-xl font-semibold mt-4">
                {contractMetadata?.name}
              </h2>
              <p className="text-lg mt-2">{contractMetadata?.description}</p>
            </>
          )}
          {isClaimSupplyLoading || isTotalNFTSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold">
              Total NFT supply: {claimSupply?.toString()} /{" "}
              {totalNFTSupply?.toString()}
            </p>
          )}
          <div className="flex flex-row items-center justify-center my-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-10 text-center border border-gray-300 rounded-md bg-black text-white"
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
          <TransactionButton
            transaction={() =>
              claimTo({
                contract: contract,
                to: account?.address || "",
                quantity: BigInt(quantity),
              })
            }
            onTransactionConfirmed={async () => {
              alert("Claimed successfully");
              setQuantity(1);
            }}
          >
            {`Claim NFT (${getPrice(quantity)} ETH)`}
          </TransactionButton>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-row items-cemter">
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        NFT Claim App
      </h1>
    </header>
  );
}
