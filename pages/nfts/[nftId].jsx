import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
const Aung = () => {
  useEffect(()=>{
    const nftId = window?.location.href.split('/').pop()
    console.log(nftId)
    localStorage.setItem('nftId',nftId)
    if(nftId){
      window.location.href = '/nfts/detail'
    }
  },[])
  return(
    <div>
      
    </div>
  )

}
export default Aung