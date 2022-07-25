import Head from "next/head";
import Link from "next/link";

const Index = () => {
  return(
    <div>
      <Head>
        <title>Create New NFT</title>
        <meta name="description" content="create a new nft" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container m-auto">
        <div className="h-100">
          <div className="text-center">
            <p className="text-2xl">Create new item</p>
            <p className="text-base">Upload Image and create new NFT</p>
          </div>
          <div className="container grid md:grid-cols-2 gap-1 justify-center">
            <div className="shadow-md w-3/4 m-auto h-96 flex justify-center items-end p-5">
            <div className="">
              <Link href="create/single">
                <button  className="border-2 rounded-full p-3">
                  Create a single NFT
                </button>
              </Link>
            </div>
            </div>
            <div className="shadow-md w-3/4 m-auto h-96 flex justify-center items-end p-5" >
              <div className="">
                <Link  href="create/bulk">
                  <button  className="border-2 rounded-full p-3">
                    Create multiple NFTs
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Index