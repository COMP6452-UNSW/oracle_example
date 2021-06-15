import Web3 from 'web3';
import { WebsocketProvider } from 'web3-core';
import { deployContract } from './deploy';
import { methodSend } from './send';
import { loadCompiledSols } from './load';

let fs = require('fs');

function initializeProvider(): WebsocketProvider {
    let provider_data = fs.readFileSync('eth_providers/providers.json');
    let provider_json = JSON.parse(provider_data);
    let provider_link = provider_json["provider_link"];
    return new Web3.providers.WebsocketProvider(provider_link);
}

var shellArgs = process.argv.slice(2);
if (shellArgs.length < 1) {
    console.error("node programName cmd, e.g. node index.js deploy");
    process.exit(1);
}

(async function run() {
    const web3Provider = initializeProvider();
    const web3 = new Web3(web3Provider);

    var cmd0 = shellArgs[0];

    if (cmd0 == "deploy") {
        if (shellArgs.length < 2) {
            console.error("e.g. node index.js deploy oracle");
            process.exit(1);
        }
        if (shellArgs[1] == "oracle") {
            let account_data = fs.readFileSync('eth_accounts/accounts.json');
            let account_json = JSON.parse(account_data);
            let account_pri_key = account_json["trusted_server"]["pri_key"];
            let account = web3.eth.accounts.wallet.add('0x' + account_pri_key);

            let loaded = loadCompiledSols(["oracle"]);
            let contract = await deployContract(web3!, account, loaded.contracts["oracle"]["TemperatureOracle"].abi, loaded.contracts["oracle"]["TemperatureOracle"].evm.bytecode.object, [account.address]);
            console.log(contract.options.address);
        } else if (shellArgs[1] == "userapp") {
            let account_data = fs.readFileSync('eth_accounts/accounts.json');
            let account_json = JSON.parse(account_data);
            let account_pri_key = account_json["user"]["pri_key"];
            let account = web3.eth.accounts.wallet.add('0x' + account_pri_key);

            let loaded = loadCompiledSols(["oracle"]);
            let contract = await deployContract(web3!, account, loaded.contracts["oracle"]["UserApp"].abi, loaded.contracts["oracle"]["UserApp"].evm.bytecode.object, [account.address]);
            console.log(contract.options.address);
        }
        web3Provider.disconnect(1000, 'Normal Closure');
    } else if (cmd0 == "listen") {
        if (shellArgs.length < 3) {
            console.error("e.g. node index.js listen oracle 0x23a01...");
            process.exit(1);
        }
        if (shellArgs[1] == "oracle") {
            let account_data = fs.readFileSync('eth_accounts/accounts.json');
            let account_json = JSON.parse(account_data);
            let account_pri_key = account_json["trusted_server"]["pri_key"];
            let account = web3.eth.accounts.wallet.add('0x' + account_pri_key);

            var contractAddr = shellArgs[2];
            let loaded = loadCompiledSols(["oracle"]);
            let contract = new web3.eth.Contract(loaded.contracts["oracle"]["TemperatureOracle"].abi, contractAddr, {});
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
    }
})();