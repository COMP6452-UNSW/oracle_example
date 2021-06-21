// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./oracle.sol";

contract UserApp is TemperatureOracleClient {
    int256 public temperature;

    constructor(address oracleAd) TemperatureOracleClient(oracleAd) {}

    function getTemperature(string calldata city) public {
        requestTemperatureFromOracle(city);
    }

    function receiveTemperatureFromOracle(
        uint256 requestId,
        int256 _temperature
    ) internal override {
        temperature = _temperature;
    }
}
