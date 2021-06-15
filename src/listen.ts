import Web3 from 'web3';
import { Account } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { methodSend } from './send';

export function handleRequestEvent(contract: Contract, web3: Web3, account: Account) {
    contract.events["request(uint256,address,bytes)"]()
        .on("connected", function (subscriptionId: any) {
            console.log("listening on event 'request'" + ", subscriptionId: " + subscriptionId);
        })
        .on('data', function (event: any) {
            let caller = event.returnValues.caller;
            let requestId = event.returnValues.requestId;
            let city = web3.utils.hexToAscii(event.returnValues.data);
            const axios = require('axios').default;
            axios.get(`https://goweather.herokuapp.com/weather/${city}`)
                .then(async function (response: any) {
                    console.log(city + ' temperature: ' + response.data.temperature.replace(/[^0-9\.]/g, ''));
                    let receipt = await methodSend(web3, account, contract.options.jsonInterface, "replyData(uint256,address,bytes)", contract.options.address, [requestId, caller, web3.utils.padLeft(web3.utils.numberToHex(response.data.temperature.replace(/[^0-9\.]/g, '')), 64)]);
                })
                .catch(function (error: any) {
                    console.log(error);
                })
                .then(function () {

                });
        })
        .on('error', function (error: any, receipt: any) {
            console.log(error);
            console.log(receipt);
            console.log("error listening on event 'request'");
        });
}