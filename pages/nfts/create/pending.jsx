import axios from 'axios'
import { useEffect, useState, useMemo, useRef } from 'react'
import Head from "next/head";
import Link from 'next/link';
import Image from 'next/image'
import { useAccount, useSendTransaction, useWaitForTransaction, useToken } from 'wagmi';
import {
  Column,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  TableInstance,
  flexRender,
  useReactTable,
} from '@tanstack/react-table'

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const contractABI = require('../../../UrbanTechNFT.json')

const IndeterminateCheckbox =({indeterminate, className = '', ...rest})=> {
  const ref = useRef(null)

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

const PendingNFTs = () => {
  const {data:account}= useAccount()
  const [nfts, setNfts] = useState([]);
  const [status, setStatus] = useState(null);
  const API_URL = process.env.API_URL

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const web3 = createAlchemyWeb3(API_URL);
  const [ready, setReady] = useState(false)

  useEffect(()=>{
    window.contract = new web3.eth.Contract(contractABI.abi, contractAddress);//loadContract();
  },[])


  useEffect(()=>{
    const getNfts = async () => {
      try{
        if(account){
          const res = await axios.get(`${API_URL}/nfts/get-by-user/${account.address}?status=READY`)
          setNfts(res.data.data)
        }
      }
      catch(err) {
        console.log(err)
      }
   }
   getNfts()
  },[account])

  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [tokenUris, setTokenUris] = useState([])

  useEffect(()=>{
    if(rowSelection){
      const list = []
      Object.keys(rowSelection).map(row=>{
        list = [...list, nfts[row].tokenUri]
      })
      setTokenUris(list)
    }
  },[rowSelection])
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({table}) =>{ 
        return (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table .getToggleAllRowsSelectedHandler(),
            }}
          />
        )},
        cell: ({ row }) => {
          return(
            <div className="px-1">
              <IndeterminateCheckbox
                {...{
                  checked: row.getIsSelected(),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: row.getToggleSelectedHandler(),
                }}
              />
            </div>
          )
        },
      },
      {
        accessorKey: 'logo',
        cell: info => <Image src={info.getValue()} width={100} height={100}/>,
        footer: props => props.column.id,
      },
      {
        accessorKey: 'name',
        cell: info => info.getValue(),
        footer: props => props.column.id,
      },
      {
        accessorFn: row => row.Collection.name,
        id: "Collection Name",
        header: () => <span>Collection Name</span>,
        cell: info => info.getValue(),
        footer: props => props.column.id,
      },
      {
        accessorKey: 'status',
        cell: info => info.getValue(),
        footer: props => props.column.id,
      },
    ],
    []
  );
  const table = useReactTable( {
    data: nfts,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  })

  const transactionParameters = {
    to: contractAddress,
    from: account?.address,
    'data': tokenUris.length>0? window.contract.methods.bulkMinting(tokenUris).encodeABI(): ""
  };
  const { data: txData, sendTransaction, status: transStatus } =
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
          })

  const bulkMint = () => {
    if(tokenUris.length <1){
      alert("please select one")
    }else{
      setStatus("minting")
      sendTransaction()
    }
  }

  const { data: wait, isError, isLoading } = useWaitForTransaction({
    hash: txData?.hash,
  })

  useEffect(()=>{
    const updateTokenId = () =>{
      const updateDetails = []
      Object.keys(rowSelection).map((row,index)=>{
        const tokenId = web3.utils.hexToNumber(wait?.logs[index].topics[3])
        const update = {
          nftId: nfts[row].nftId,
          tokenId: tokenId,
          txid: txData?.hash,
          status: "MINTED"
        }
        updateDetails = [...updateDetails, update]
      })
      if(wait){
        const updateNft = async() => {
          const resData = await axios.post(`${API_URL}/nfts/bulkUpdate/`, {updateList: updateDetails})
          if(!resData.error){
            setRowSelection({})
          }
        }
        updateNft()
      }
    }
    updateTokenId()
  },[wait,rowSelection])

  return(
    <div className="container mx-auto">
      <Head>
        <title>My Collections</title>
        <meta name="description" content="List of Nfts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className='text-4xl font-bold p-5'>Pending NFTs</h1>
      {!account && (
        <h1 className='text-lg text-red-500'>Please Connect Wallet to show you NFTs !!!</h1>
      )}
      <div className="p-2">
        <button className='m-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={bulkMint}>Bulk Mint</button>
        <div className="h-2" />
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <th key={header.id} colSpan={header.colSpan} className="p-5 m-5">
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
          {table.getRowModel().rows.map(row => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return <td key={cell.id} className="text-center">
                            {
                              flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                })}
              </tr>
            )
          })}
        </tbody>
          
        </table>
        <div className="h-2" />
        <hr />
        <br />
      </div>
    </div>
  )
}

export default PendingNFTs