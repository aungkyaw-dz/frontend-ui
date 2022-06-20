import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import axios from 'axios';

const Navbar = () => {
    const { data } = useAccount()
    const API_URL = process.env.API_URL
    useEffect(()=>{
        const getUser = async () =>{
            await axios.post(`${API_URL}/users/get-or-create`, {walletAddress: data?.address})
            }
        if(data?.address){
            getUser()
            }
    },[data?.address])
    console.log(data)
    console.log("data")
    console.log("data")
    console.log("data")
    console.log("data")
    console.log("data")
    return(
        <nav className='flex items-center flex-wrap bg-transparent p-10 '>
            <Link href='/123'>
            <a className='inline-flex items-center p-2 ml-10 '>
                <svg
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
                className='fill-current text-black h-8 w-8 mr-2'
                >
                <path d='M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z' />
                </svg>
                <span className='text-xl text-black font-bold uppercase tracking-wide'>
                Talwind CSS
                </span>
            </a>
            </Link>
            <div className='hidden w-full lg:inline-flex lg:flex-grow lg:w-auto'>
                <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
                    <Link href='/'>
                    <a className='lg:inline-flex lg:w-auto w-full shadow-md px-3 py-2 mx-2 rounded-lg text-black font-bold items-center justify-center text-black '>
                        Home
                    </a>
                    </Link>
                    <Link href='/collections'>
                    <a className='lg:inline-flex lg:w-auto w-full shadow-md px-3 py-2 mx-2 rounded-lg text-black font-bold items-center justify-center text-black'>
                        Collections
                    </a>
                    </Link>
                    <Link href='/nfts/create/single'>
                        <a className='lg:inline-flex lg:w-auto w-full shadow-md px-3 py-2 mx-2 rounded-lg text-black font-bold items-center justify-center text-black'>
                            Create NFT
                        </a>
                    </Link>
                    <Link href='/collections/my-collection'>
                        <a className='lg:inline-flex lg:w-auto w-full shadow-md px-3 py-2 mx-2 rounded-lg text-black font-bold items-center justify-center text-black'>
                            My Collections
                        </a>
                    </Link>
                    {data && (
                        <Link href='/profile'>
                        <a className='lg:inline-flex lg:w-auto w-full shadow-md px-3 py-2 mx-2 rounded-lg text-black font-bold items-center justify-center text-black'>
                            profile
                        </a>
                        </Link>
                    )}
                    <ConnectButton className="shadow-md" chainStatus="none" accountStatus="avatar" showBalance={false}/>
                </div>
            </div>
        </nav>
    )
}

export default Navbar