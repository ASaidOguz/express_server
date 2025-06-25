import { PinataSDK } from "pinata";
import fs from "fs";

export  function connectPinata(jwt){
 return new PinataSDK({
  pinataJwt: jwt,
  pinataGateway: "silver-past-pig-277.mypinata.cloud",
});
}

export async function pinFile( json,jwt) {
    const pinata = connectPinata(jwt);
    try {
const upload = await pinata.upload.public.json(json);
    return upload.cid;
  } catch (error) {
    console.error("Error pinning file:", error);
    throw new Error("Failed to pin file to IPFS");
  }
}

export async function pinImage( image,jwt) {
    const pinata = connectPinata(jwt);
    try {
const upload = await pinata.upload.public.json(json);
    return upload.cid;
  } catch (error) {
    console.error("Error pinning file:", error);
    throw new Error("Failed to pin file to IPFS");
  }
}

export async function handleUploadAndMetadata(file, jwt, name = "zk-touchgrass", description = "Uploaded via backend") {
  const pinata = new PinataSDK({ pinataJwt: jwt });

  const fileStream = fs.createReadStream(file.path);

  // 1. Upload the image
  const imageUpload = await pinata.upload.public.file(fileStream, {
    metadata: { name: file.originalname },
  });
  const imageCid = imageUpload.cid;
  const imageUrl = `ipfs://${imageCid}`;

  // 2. Create and upload metadata JSON
  const metadata = {
    name,
    description,
    image: imageUrl,
  };

  const metadataUpload = await pinata.upload.public.json(metadata, {
    metadata: { name: "metadata.json" },
  });

  const metadataCid = metadataUpload.cid;

  // 3. Clean up temp file
  fs.unlinkSync(file.path);

  return {
    metadataCid,
    imageCid,
    gatewayUrl: `https://silver-past-pig-277.mypinata.cloud/ipfs/${metadataCid}`,
  };
}