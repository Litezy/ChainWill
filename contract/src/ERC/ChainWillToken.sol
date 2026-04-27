// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChainWillToken {
    // Events
    event Transfer(address indexed _from, address indexed _to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed _to, uint256 _amount);
    event TokensRequested(address indexed _user, uint256 _amount, uint256 _time);

    // State 
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    uint256 public constant MAX_SUPPLY      = 10_000_000e18;
    uint256 public constant REQUEST_AMOUNT  = 1_000e18;
    uint256 public constant REQUEST_INTERVAL = 1 days;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public lastRequestTime;

    // ── Constructor
    constructor() {
        name        = "ChainWill Token";
        symbol      = "CWT";
        owner       = msg.sender;
    }

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // ── Internal mint (no access control — used by both mint() and requestToken()) 
    function _mint(address _to, uint256 _amount) internal {
        require(_to != address(0), "Mint to zero address");
        require(_amount > 0, "Amount must be greater than zero");
        require(totalSupply + _amount <= MAX_SUPPLY, "Max supply exceeded");

        totalSupply += _amount;
        balanceOf[_to] += _amount;

        emit Transfer(address(0), _to, _amount);
    }

    // mint() — owner only
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
        emit Mint(_to, _amount);
    }

    // requestToken() — anyone, once per 24hrs
    function requestToken() external {
        require(
            block.timestamp >= lastRequestTime[msg.sender] + REQUEST_INTERVAL,
            "Can only request once every 24 hours"
        );

        lastRequestTime[msg.sender] = block.timestamp;
        _mint(msg.sender, REQUEST_AMOUNT);

        emit TokensRequested(msg.sender, REQUEST_AMOUNT, block.timestamp);
    }

    // transfer
    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(_to != address(0), "Transfer to zero address");
        require(_to != msg.sender, "Self transfer not allowed");
        require(_amount > 0, "Zero transfer");
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");

        balanceOf[msg.sender] -= _amount;
        balanceOf[_to]        += _amount;

        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    // approve 
    function approve(address _spender, uint256 _amount) public returns (bool) {
        require(_spender != address(0), "Approve to zero address");

        allowance[msg.sender][_spender] = _amount;

        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    // transferFrom 
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        require(_to != address(0), "Transfer to zero address");
        require(_amount > 0, "Zero transfer");
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _amount, "Allowance exceeded");

        allowance[_from][msg.sender] -= _amount;
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;

        emit Transfer(_from, _to, _amount);
        return true;
    }

    // burn
    function burn(uint256 _amount) external {
        require(_amount > 0, "Zero amount");
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");

        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;

        emit Transfer(msg.sender, address(0), _amount);
    }

    // View Fns
    function timeUntilNextRequest(address _user) external view returns (uint256) {
        uint256 nextRequest = lastRequestTime[_user] + REQUEST_INTERVAL;
        if (block.timestamp >= nextRequest) return 0;
        return nextRequest - block.timestamp;
    }

    function canRequest(address _user) external view returns (bool) {
        return block.timestamp >= lastRequestTime[_user] + REQUEST_INTERVAL;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        owner = _newOwner;
    }
}