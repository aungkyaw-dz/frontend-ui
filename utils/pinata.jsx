import axios from 'axios'
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;
const basePathConverter = require("base-path-converter");
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
            console.log(error)
            console.log(error.message)
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
            name: data.name,
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

export const createBulkMetaData = async(files, data) => {
    try{
        let fileData = new FormData();
        const fileName = JSON.stringify({
            name: data.name,
        })
        fileData.append(`pinataMetadata`, fileName)
        for (const file of files) {
            fileData.append(`file`, file);
        }
        const fileUploadRes = await pinFileToIPFS(fileData);
        if (!fileUploadRes.success) {
            return {
                success: false,
                status: "😢 Something went wrong while uploading your tokenURI.",
            }
        }
        const fileURI = fileUploadRes.pinataUrl
        console.log(fileURI)
        let dataList = new FormData()
        dataList.append("pinataOptions", JSON.stringify({wrapWithDirectory: true})
        )
        for (const file of files){
            const metaData = {
                name: file.name,
                image: `${fileURI}/${file.name}`,
                description: data.description,
                price: data.price
            }
            const jsonName = `${file.name.split(".")[0]}.json`
            console.log(JSON.stringify(jsonName))
            const blob = new Blob([JSON.stringify(metaData)], {type : 'application/json'});
            const a = new File([ blob ], jsonName, {
                type: 'application/json',
            });
            console.log(a)
            dataList.append('file', a)
        }
        console.log(dataList)
        const pinataResponse = await pinFileToIPFS(dataList);
        if (!pinataResponse.success) {
            return {
                success: false,
                status: "😢 Something went wrong while uploading your tokenURI.",
            }
        }
        const tokenURI = pinataResponse.pinataUrl;
        console.log(tokenURI)
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