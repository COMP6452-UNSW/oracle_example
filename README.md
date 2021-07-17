# oracle_example

## getting started

```mkdir eth_providers && touch eth_providers/providers.json```

```mkdir eth_accounts && touch eth_accounts/accounts.json```

fill in providers and accounts

e.g.

```
{
    "provider_link": "ws://0.0.0.0:7545"
}
```

```
{
    "trusted_server": {
        "pri_key": ORACLE_ACCOUNT_PRIVATEKEY
    },
    "user": {
        "pri_key": USER_APP_ADMIN_ACCOUNT_PRIVATEKEY
    }
}
```

```npm install```

```npx tsc```

```node build/index.js deploy oracle```

```node build/index.js listen oracle [oracle-address-from-previous-step]```

## writing oracle

The oracle definition is in [smart_contracts/oracle.sol](smart_contracts/oracle.sol). To define a new oracle, create a __concrete oracle__ class similar to ```TemperatureOracle```, and a __concrete oracle client__ class similar to ```TemperatureOracleClient``` class. Then change the __user app__ code in [smart_contracts/userapp.sol](smart_contracts/userapp.sol) as well as the __off-chain part__ in [src/index.ts](src/index.ts). The __external information__ from off-chain part can be acquired by some approach similar to [src/temperature_grabber.ts](src/temperature_grabber.ts).