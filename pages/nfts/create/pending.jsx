import axios from 'axios'
import { useEffect, useState, useMemo, useRef } from 'react'
import Head from "next/head";
import Link from 'next/link';
import Image from 'next/image'
import { useAccount, useSendTransaction, useWaitForTransaction, useConnect } from 'wagmi';
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
  const {data:account }= useAccount()
  const { connect, connectors, activeConnector } = useConnect()
  const [nfts, setNfts] = useState([]);
  const [status, setStatus] = useState(null);
  const API_URL = process.env.API_URL

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const REACT_APP_ALCHEMY_URL = process.env.REACT_APP_ALCHEMY_URL
  const web3 = createAlchemyWeb3(REACT_APP_ALCHEMY_URL);
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
    'data': tokenUris?.length>0? window.contract.methods.bulkMinting(tokenUris).encodeABI()  : ""
  };
  const { data: txData, sendTransaction, status: transStatus } =
          useSendTransaction({
          request: transactionParameters,
          onError(error) {
            console.log(error)
            console.log(error.message)
            setStatus("Error")
            if(error.code == "INSUFFICIENT_FUNDS"){
                alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
            }
            if(error.includes("insufficient")){
                alert("Sorry, your wallet has insufficient funds. Please fund your wallet via Binance")
            }
          },
          onSuccess(data) {
            console.log('Success', data)
            setStatus("Wait until transcation complete")
          },
          })
  const bulkMint = () => {
    if(tokenUris.length <1){
      alert("please select one")
    }else{
      if(!activeConnector){
        connect(connectors[5])
       }
      setTimeout(()=>{
        setStatus("Minting")
        sendTransaction()
      }, 5000);
    }
  }

  const { data: wait } = useWaitForTransaction({
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
            setStatus("Completed")
            setTimeout(()=> {
              setStatus('')
              window.location.reload(false)
          }, 5000);
          }
        }
        updateNft()
      }
    }
    updateTokenId()
  },[wait])

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
      {status && (
        <div>
          {status}
          <svg role="status" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
        </div>
        )}
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