import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useEffect } from 'react';
import axios from 'axios';
import LinkTo from './linkto';

const Navbar = () => {
    const { data } = useAccount();
    const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL
    
    useEffect(()=>{
        const getUser = async () =>{
            await axios.post(`${REACT_APP_BACKEND_URL}/users/get-or-create`, {walletAddress: data?.address})
            }
        if(data?.address){
            getUser()
        }
    },[data?.address])
    return(
        <nav className="flex items-center flex-wrap bg-gray-700 p-5 bg-nav_background">
            <LinkTo href='/'>
            <a className='inline-flex items-center p-2 ml-10 '>
                <svg
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
                className='fill-current text-white h-8 w-8 mr-2'
                >
                <path d='M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z' />
                </svg>
                <span className='text-xl text-white font-bold uppercase tracking-wide'>
                Kob Startup Project
                </span>
            </a>
            </LinkTo>
            <div className='hidden w-full lg:inline-flex lg:flex-grow lg:w-auto'>
                <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
                    <LinkTo href='/'>
                    <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white '>
                        Explore
                    </a>
                    </LinkTo>
                    <LinkTo href='/#'>
                    <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white '>
                        Stats
                    </a>
                    </LinkTo>
                    <LinkTo href='/#'>
                    <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white '>
                        Resource
                    </a>
                    </LinkTo>
                    <LinkTo href='/#'>
                    <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white '>
                        Community
                    </a>
                    </LinkTo>
                    {/* <LinkTo href='/collections'>
                    <a className='lg:inline-flex lg:w-auto w-full shadow-md px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white'>
                        Collections
                    </a>
                    </LinkTo> */}
                    {data && (
                        <>
                        <LinkTo href='/collections/my-collection'>
                            <a className='lg:inline-flex lg:w-auto w-full  px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white'>
                                My Collections
                            </a>
                        </LinkTo>
                        {/* <LinkTo href='/nfts/create/pending'>
                            <a className='lg:inline-flex lg:w-auto w-full shadow-md px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white'>
                                Pending NFTs
                            </a>
                        </LinkTo> */}
                        <LinkTo href='/profile'>
                            <a className='lg:inline-flex lg:w-auto w-full  px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white'>
                                Profile
                            </a>
                        </LinkTo>
                        
                        </>
                    )}
                    <LinkTo href='/nfts/create/single'>
                        <a className='lg:inline-flex lg:w-auto w-full  px-3 py-2 mx-2 rounded-lg text-white font-bold items-center justify-center text-white'>
                            Create NFT
                        </a>
                    </LinkTo>
                    <ConnectButton className="shadow-md" chainStatus="icon" accountStatus="avatar" showBalance={false}/>
                </div>
            </div>
        </nav>
    )
}

export default Navbar