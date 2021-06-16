# oracle_example

## getting started

```npm install```

```npx tsc```

```node build/index.js deploy oracle```

```node build/index.js listen oracle [oracle-address-from-previous-step]```

## Limitation

- cannot precisely get temperature < 0 (due to regex used & uint256 type used)