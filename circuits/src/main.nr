fn main(x: Field, y: pub Field) {
    assert(y.lt(x));
}
 
// Circuit public input can be taken from nft metadata which previously owned 
// from our touch the grass collection and set as challenge to pass that value.
// This is a simple circuit that checks if two field elements are satisfy the constraint.
#[test]
fn test() {
    let x = Field::from(10);
    let y = Field::from(5);
    main(x, y);
}


// For Starknet verifier in case you failed to send correct proof this will return 
// revert error as below 

/*       40: Contract error: {"revert_error":{"class_hash":"0x7d60546ce82060235d82da1a2a1f652a340a9d70a62e4764bb33d9cb1bbed9","contract_address":"0x1c4b07d5c5547fc6648386e6ce017979500f1e314fd55036fbb5e2b9e5a4318"
,"error":"0x57726f6e6720476c762646616b65474c5620726573756c74 ('Wrong Glv&FakeGLV result')"
,"selector":"0x365c21326e13afc2af5f483ed8d3e75ba167caf8757a743d26c03cd8f37f3b5"}}
    at RpcChannel2.errorHandler (file:///home/ahmet_said/express_server/node_modules/starknet/dist/index.mjs:4881:13)
    at RpcChannel2.fetchEndpoint (file:///home/ahmet_said/express_server/node_modules/starknet/dist/index.mjs:4903:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async zkVerifyCall (file:///home/ahmet_said/express_server/api/utils/zk_verify_call.js:9:22)
    at async file:///home/ahmet_said/express_server/api/index.js:31:5 {
  request: {
    method: 'starknet_call',
    params: { request: [Object], block_id: 'pending' }
  },
  baseError: {
    code: 40,
    data: { revert_error: [Object] },
    message: 'Contract error'
  }
} */