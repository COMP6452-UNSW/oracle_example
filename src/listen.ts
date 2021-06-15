import Web3 from 'web3';
import { Account } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { methodSend } from './send';

export function handleRequestEvent(contract: Contract, web3: Web3, account: Account, grabData: Function) {
    contract.events["request(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId: any) {
            console.log("listening on event 'request'" + ", subscriptionId: " + subscriptionId);
        })
        .on('data', function (event: any) {
            let caller = event.returnValues.caller;
            let requestId = event.returnValues.requestId;
            let data = event.returnValues.data;
            grabData(data).then(async (dback: any) => {
                let receipt = await methodSend(web3, account, contract.options.jsonInterface, "replyData(uint256,address,bytes)", contract.options.address, [requestId, caller, dback]);
            });
        })
        .on('error', function (error: any, receipt: any) {
            console.log(error);
            console.log(receipt);
            console.log("error listening on event 'request'");
        });
}