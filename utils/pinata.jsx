import axios from 'axios'
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;

export const pinFileToIPFS = async (data) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    //making axios POST request to Pinata ⬇️

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secret
            }
        })
        .then(function (response) {
            return {
                success: true,
                pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
            };
        })
        .catch(function (error) {
            return {
                success: false,
                message: error.message,
            };
        });
};

export const pinJSONToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    //making axios POST request to Pinata ⬇️
    return axios 
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

    });
};

export const CreateMetaData = async(file, data) => {
    try{
        let fileData = new FormData();
        fileData.append("file", file);
        const fileName = JSON.stringify({
            name: data.title,
        })
        fileData.append("pinataMetadata", fileName)
        const fileUploadRes = await pinFileToIPFS(fileData);
        if (!fileUploadRes.success) {
            return {
                success: false,
                status: "😢 Something went wrong while uploading your tokenURI.",
            }
        }
        const fileURI = fileUploadRes.pinataUrl
        const  metaData = new Object();
        metaData.name = data.name;
        metaData.image = fileURI
        metaData.description = data.description;
        metaData.link = data.description;
        metaData.price = data.price;
        const pinataResponse = await pinJSONToIPFS(metaData);
        if (!pinataResponse.success) {
            return {
                success: false,
                status: "😢 Something went wrong while uploading your tokenURI.",
            }
        }
        const tokenURI = pinataResponse.pinataUrl;
        return {
            success: true,
            url: tokenURI
        }
    }catch(err) {
        return {
            success: false,
            message: err.message,
        }
    }
} 