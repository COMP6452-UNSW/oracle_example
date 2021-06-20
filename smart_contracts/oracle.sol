// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

interface COMP6452OracleInterface {
    function requestData(uint256 requestId, bytes memory data) external;
}

contract COMP6452OracleClient {
    address _oracleAddr;

    uint256 _requestCounter = 0;

    constructor(address oracleAd) {
        _oracleAddr = oracleAd;
    }

    modifier oracleOnly() {
        require(msg.sender == _oracleAddr);
        _;
    }

    function requestDataFromOracle(bytes memory data)
        internal
        returns (uint256)
    {
        COMP6452OracleInterface(_oracleAddr).requestData(
            ++_requestCounter,
            data
        );
        return _requestCounter;
    }

    function receiveDataFromOracle(uint256 requestId, bytes memory data)
        public
        virtual
    {}
}

abstract contract COMP6452Oracle is COMP6452OracleInterface {
    event request(uint256 requestId, address caller, bytes data);

    address public trustedServer;

    modifier trusted() {
        require(msg.sender == trustedServer);
        _;
    }

    constructor(address serverAddr) {
        trustedServer = serverAddr;
    }

    function requestData(uint256 requestId, bytes memory data) public override {
        emit request(requestId, msg.sender, data);
    }

    function replyData(
        uint256 requestId,
        address caller,
        bytes memory data
    ) public trusted {
        COMP6452OracleClient(caller).receiveDataFromOracle(requestId, data);
    }
}

interface TemperatureOracleInterface is COMP6452OracleInterface {
    function requestTemperature(uint256 requestId, string memory city) external;
}

contract TemeratureOracleClient is COMP6452OracleClient {
    constructor(address oracleAd) COMP6452OracleClient(oracleAd) {}

    function requestTemperatureFromOracle(string memory city)
        internal
        returns (uint256)
    {
        requestDataFromOracle(bytes(city));
        return _requestCounter;
    }

    function receiveDataFromOracle(uint256 requestId, bytes memory data)
        public
        override
        oracleOnly
    {
        int256 temp = abi.decode(data, (int256));
        receiveTemperatureFromOracle(requestId, temp);
    }

    function receiveTemperatureFromOracle(uint256 requestId, int256 temperature)
        internal
        virtual
    {}
}

contract TemperatureOracle is COMP6452Oracle, TemperatureOracleInterface {
    constructor(address serverAddr) COMP6452Oracle(serverAddr) {}

    function requestTemperature(uint256 requestId, string memory city)
        public
        override
    {
        requestData(requestId, bytes(city));
    }
}
