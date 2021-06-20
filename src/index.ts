import Web3 from 'web3';
import { WebsocketProvider, Account } from 'web3-core';
import { deployContract } from './deploy';
import { handleRequestEvent } from './listen';
import { loadCompiledSols } from './load';
import { grabTemperature } from './temperature_grabber';
let fs = require('fs');

function initializeProvider(): WebsocketProvider {
    let provider_data = fs.readFileSync('eth_providers/providers.json');
    let provider_json = JSON.parse(provider_data);
    let provider_link = provider_json["provider_link"];
    return new Web3.providers.WebsocketProvider(provider_link);
}

function getAccount(web3: Web3, name: string): Account {
    let account_data = fs.readFileSync('eth_accounts/accounts.json');
    let account_json = JSON.parse(account_data);
    let account_pri_key = account_json[name]["pri_key"];
    return web3.eth.accounts.wallet.add('0x' + account_pri_key);
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
            let account = getAccount(web3, "trusted_server");
            let loaded = loadCompiledSols(["oracle"]);
            let contract = await deployContract(web3!, account, loaded.contracts["oracle"]["TemperatureOracle"].abi, loaded.contracts["oracle"]["TemperatureOracle"].evm.bytecode.object, [account.address]);
            console.log("oracle contract address:" + contract.options.address);
        } else if (shellArgs[1] == "userapp") {
            let account = getAccount(web3, "user");
            let loaded = loadCompiledSols(["oracle", "userapp"]);
            let contract = await deployContract(web3!, account, loaded.contracts["userapp"]["UserApp"].abi, loaded.contracts["userapp"]["UserApp"].evm.bytecode.object, [account.address]);
            console.log("user app contract address:" + contract.options.address);
        }
        web3Provider.disconnect(1000, 'Normal Closure');
    } else if (cmd0 == "listen") {
        if (shellArgs.length < 3) {
            console.error("e.g. node index.js listen oracle 0x23a01...");
            process.exit(1);
        }
        if (shellArgs[1] == "oracle") {
            let account = getAccount(web3, "trusted_server");
            let loaded = loadCompiledSols(["oracle"]);
            let contractAddr = shellArgs[2];
            let contract = new web3.eth.Contract(loaded.contracts["oracle"]["TemperatureOracle"].abi, contractAddr, {});
            handleRequestEvent(contract, web3, account, async (data: any) => {
                let city = web3.utils.hexToAscii(data);
                let temperature = await grabTemperature(city);
                console.log("the temperature in " + city + " is " + temperature);
                return web3.utils.toTwosComplement(temperature);
            });
        }
    }
})();