# oracle_example

## getting started

```mkdir eth_providers && touch eth_providers/providers.json```

```mkdir eth_accounts && touch eth_accounts/accounts.json```

fill in providers and accounts

```npm install```

```npx tsc```

```node build/index.js deploy oracle```

```node build/index.js listen oracle [oracle-address-from-previous-step]```

## writing oracle

The oracle definition is in [smart_contracts/oracle.sol](smart_contracts/oracle.sol). To define a new oracle, create a concrete oracle class similar to TemperatureOracle, and a concrete oracle client class similar to TemperatureOracleClient class. Then change the user app code in [smart_contracts/userapp.sol](smart_contracts/userapp.sol) as well as the off-chain part in [src/index.ts](src/index.ts). The information from off-chain part can be acquired by some approach similar to [src/temperature_grabber.ts](src/temperature_grabber.ts).