

export function craftMetadataJson(distance){
    const metadata = {
        name: "zk-touchgrass",
        description: "Uploaded via backend",
        version: "1.0.0",
        image: "https://ipfs.io/ipfs/bafybeihryj2lktpj35gougxsc2gerypxkrbhza2o7m6i5gb3jx6gcmyfau",
        attributes: [
            {
                trait_type: "Distance",
                value: distance
            }
        ]
    }
    return metadata;
}