// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplyChain 
{
    struct Product 
    {
        uint id;
        string name;
        uint timestamp;
        address owner;
        string qrCodeHash;
    }

    mapping(uint => Product) public products;
    mapping(string => bool) private qrCodeExists;
    mapping(uint => address[]) private productHistory;      // To store ownership history

    uint public productCount;
    
    event ProductAdded(uint id, string name, address owner, string qrCodeHash);
    event OwnershipTransferred(uint id, address from, address to);

    address public manufacturer;

    constructor() 
    {
        manufacturer = msg.sender;
    }

    function isQrCodeUsed(string memory _qrCodeHash) public view returns (bool) 
    {
        return qrCodeExists[_qrCodeHash];
    }

    function addProduct(string memory _name, string memory _qrCodeHash) public 
    {
        require(msg.sender == manufacturer, "Only manufacturer can add products");
        require(!qrCodeExists[_qrCodeHash], "QR Code already used");
        require(bytes(_qrCodeHash).length > 0, "QR Code cannot be empty");

        productCount++;
        products[productCount] = Product(productCount, _name, block.timestamp, msg.sender, _qrCodeHash);
        qrCodeExists[_qrCodeHash] = true;

        productHistory[productCount].push(msg.sender);      // Store the first owner

        emit ProductAdded(productCount, _name, msg.sender, _qrCodeHash);
    }

    function transferOwnership(uint _id, address _newOwner) public 
    {
        require(products[_id].owner != address(0), "Product does not exist");
        require(_newOwner != address(0), "Invalid new owner address");
        require(products[_id].owner == msg.sender, "You are not the owner");
        require(msg.sender != _newOwner, "Cannot transfer to yourself");

        products[_id].owner = _newOwner;
        productHistory[_id].push(_newOwner); // Store the new owner in history

        emit OwnershipTransferred(_id, msg.sender, _newOwner);
    }

    function getProductDetails(uint _id) public view returns (string memory, uint, address, string memory) 
    {
        Product memory product = products[_id];
        require(product.owner != address(0), "Product does not exist");

        return (product.name, product.timestamp, product.owner, product.qrCodeHash);
    }

    // New function to get all products
    function getAllProducts() public view returns (Product[] memory) 
    {
        Product[] memory productList = new Product[](productCount);
        for (uint i = 1; i <= productCount; i++) {
            productList[i - 1] = products[i];
        }
        return productList;
    }

    // New function to track product history
    function trackProductHistory(uint _id) public view returns (address[] memory) 
    {
        require(products[_id].owner != address(0), "Product does not exist");
        return productHistory[_id];
    }
}
