import React from "react";
import { Button, Dropdown, Modal } from 'flowbite-react';
import { useAccount, useConnect, useSendTransaction } from "wagmi";

import { MarketPlaceABI, LeafABI } from '../../utils/abi';
import { useState } from "react";
import { BigNumber } from 'ethers';
import axios from "axios";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const MarketList = ({lists, contractAddress}) => {
  const contractABI = MarketPlaceABI
  const LeafContractABI = LeafABI
  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL
  const marketAddress = process.env.MARKET_ADDRESS;
  const web3 = createAlchemyWeb3(REACT_APP_BACKEND_URL);
  const contract = new web3.eth.Contract(contractABI.abi, marketAddress);
  const [selected, setSelected] = useState(null)
  const [status, setStatus]=useState("")
  const [message, setMessage]=useState("")

  const { data } = useAccount()
  const { connect, connectors, activeConnector } = useConnect()

  const transactionParameters = {
    to: marketAddress,
    from: data?.address,
    data: selected? contract.methods.createMarketSale(contractAddress , selected?.marketId ).encodeABI():"",
    value: selected ? BigNumber.from((selected.price*1000000000000000000).toString()):`0x${(0).toString(16)}`,
    gasPrice: 35000000000,
  };


  const { data: txData, isSuccess, sendTransaction } =
          useSendTransaction({
            request: transactionParameters,
            onError(error) {
                if(error.code == "INSUFFICIENT_FUNDS"){
                    alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
                }
                if(error.includes("insufficient")){
                    alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
                }
              },
            onSuccess(data) {
              const updateCollection = async ()=>{
                const wait  = await data.wait()
                if(wait){
                  const resData = await axios.post(`${REACT_APP_BACKEND_URL}/lists/update/${selected.listId}`, {status: "SOLDOUT"})
                  setStatus('complete')
                  setMessage('Yay, You bought the collection')

                }
              }
              updateCollection()
              console.log('Success', data)
            },
          })

  const handleBuy = (item)=> {
    setSelected(item)
  }

  const handleCancel = () => setSelected(null)

  const handleConfrim = () => {
    if(!activeConnector){
      connect(connectors[5])
    }
    setStatus("wait")
    setMessage("Please confirm in wallet")
    sendTransaction()
  }

  return(
    <div className="market-lists p-5">
      {
        selected ? (
          <div className="w-96 m-auto">
            {
              message ? (
                <div>
                  { status === 'wait' ?
                  <svg role="status" className="w-8 h-8 m-auto text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>:
                  (status === "complete" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ): (
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ))
                  }
                  <p className='text-sm font-medium text-gray-700 p-5 pt-2 w-100 text-center'>{message}</p>
                </div>
              ):(
                <div>
                  <h1 className="text-center">Please Confirm</h1>
                  <div className="w-50 flex justify-between">
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleConfrim}>Confirm</Button>
                  </div>
                </div>
              )
            }
            
          </div>
        ): (
        <table className="m-auto">
          <thead>
            <tr>
              <th className="w-48 text-left">Price</th>
              <th className="w-96">Owner Address</th>
              <th className="w-48">Total Items</th>
              <th className="w-48">Status</th>
              <th className="w-48">Listed Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {
            lists && lists.map((item, index)=>(
              <tr key={index}>
                <td className="text-left">{item.price} ETH</td>
                <td className="text-center">{item.Creator.username}</td>
                <td className="text-center">{item.total}</td>
                <td className="text-center">{item.status}</td>
                <td className="text-center">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                  {
                    item.status ==='LISTING' && (
                      <Button disabled={data?.address == item.Creator.walletAddress} onClick={()=>handleBuy(item)}>Buy</Button>
                    )
                  }
                </td>
              </tr>
            ))
          }
          </tbody>

        </table>
        )
      }
      
      
    </div>
  )
}

export default MarketList