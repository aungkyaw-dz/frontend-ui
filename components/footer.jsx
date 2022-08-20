import Image from 'next/image';
import Link from 'next/link';
import facebook from '../asset/images/facebook.svg'
import twitter from '../asset/images/twitter.svg'
import instagram from '../asset/images/instagram.svg'
import linkin from '../asset/images/linkin.svg'

const Footer = () => {


    return(
        <div className=" bg-footer_background p-5">
          <div className='flex flex-wrap justify-evenly p-5 m-5'>
            <div>
              <h5 className='text-3xl text-white pb-5'>Get The latest  NFT updates</h5>
              <form className="w-full max-w-sm">
              <div className="flex items-center bg-gray-300 p-2 text-white">
                <input className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-transparent focus:ring-0" type="email" placeholder="Your e-mail" aria-label="Full name"/>
                <button className="flex-shrink-0 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-pink-500 hover:to-yellow-500  text-sm  text-white py-1 px-2 rounded" type="button">
                  I'm in
                </button>
              </div>
            </form>
            </div>
            <div>
              <h5 className='text-2xl text-white pb-5'>NFT</h5>
              <h6 className='text-md text-white pb-2'>Explore</h6>
              <h6 className='text-md text-white pb-2'>Help center</h6>
              <h6 className='text-md text-white pb-2'>Blog</h6>
              <h6 className='text-md text-white pb-2'>Jobs</h6>
              <h6 className='text-md text-white pb-2'>Become a partner</h6>
              <h6 className='text-md text-white pb-2'>Bug bounty</h6>
            </div>
            <div>
              <h5 className='text-2xl text-white pb-5'>Community</h5>
              <h6 className='text-md text-white pb-2'>ARAI Token</h6>
              <h6 className='text-md text-white pb-2'>Discussion</h6>
              <h6 className='text-md text-white pb-2'>Voting</h6>
              <h6 className='text-md text-white pb-2'>Suggest feature</h6>
              <h6 className='text-md text-white pb-2'>NFT protocol</h6>
              <h6 className='text-md text-white pb-2'>Subscribe</h6>
            </div>
            <div>
              <h5 className='text-2xl text-white pb-5'>Langugage</h5>
              <h6 className='text-md text-white'>Explore</h6>
            </div>
          </div>
          <hr/>
          <div className='flex flex-wrap justify-around p-5'>
            <div className='flex'>
              <h6 className='text-sm text-white px-3'>© NFT, Inc. All rights reserved.</h6>
              <h6 className='text-sm text-white px-3'>Terms</h6>
              <h6 className='text-sm text-white px-3'>Privacy policy</h6>
            </div>
            <div className='flex'>
              <Image src={facebook} width={30} height={30}/>
              <Image src={instagram} width={30} height={30}/>
              <Image src={twitter} width={30} height={30}/>
              <Image src={linkin} width={30} height={30}/>
            </div>
          </div>

        </div>
    )
}

export default Footer