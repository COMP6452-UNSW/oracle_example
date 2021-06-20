# oracle_example

## getting started

```mkdir eth_providers && touch eth_providers/providers.json```

```mkdir eth_accounts && touch eth_accounts/accounts.json```

fill in providers and accounts

```npm install```

```npx tsc```

```node build/index.js deploy oracle```

```node build/index.js listen oracle [oracle-address-from-previous-step]```