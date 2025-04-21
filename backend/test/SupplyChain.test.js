//const ganache = require('ganache');
//const { Web3 } = require('web3');

const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SupplyChain Smart Contract", function () {
    let supplyChain;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy contract
        const SupplyChain = await ethers.getContractFactory("SupplyChain");
        supplyChain = await SupplyChain.deploy();
        await supplyChain.waitForDeployment();
    });

    it("Should add a new product successfully", async function () {
        await supplyChain.addProduct("Laptop", "Dell", "QRCODE123");
        const product = await supplyChain.getProductDetails(1);

        expect(product[0]).to.equal("Laptop");  // name
        expect(product[1]).to.equal("Dell");    // manufacturer
        expect(product[3]).to.equal(owner.address); // owner
        expect(product[4]).to.equal("QRCODE123"); // QR Code
    });

    it("Should prevent adding a product with duplicate QR Code", async function () {
        await supplyChain.addProduct("Phone", "Samsung", "QRCODE123");
        await expect(supplyChain.addProduct("Tablet", "Apple", "QRCODE123"))
            .to.be.revertedWith("QR Code already used");
    });

    it("Should transfer ownership successfully", async function () {
        await supplyChain.addProduct("Laptop", "Dell", "QRCODE123");

        await supplyChain.transferOwnership(1, addr1.address);
        const product = await supplyChain.getProductDetails(1);

        expect(product[3]).to.equal(addr1.address);
    });

    it("Should prevent unauthorized ownership transfer", async function () {
        await supplyChain.addProduct("Laptop", "Dell", "QRCODE123");

        await expect(
            supplyChain.connect(addr1).transferOwnership(1, addr2.address)
        ).to.be.revertedWith("You are not the owner");
    });

    it("Should not allow transferring to the zero address", async function () {
        await supplyChain.addProduct("Laptop", "Dell", "QRCODE123");

        await expect(
            supplyChain.transferOwnership(1, ethers.ZeroAddress)
        ).to.be.revertedWith("Invalid new owner address");
    });

    it("Should correctly track QR code usage", async function () {
        await supplyChain.addProduct("Laptop", "Dell", "QRCODE123");
        const isUsed = await supplyChain.isQrCodeUsed("QRCODE123");

        expect(isUsed).to.be.true;
    });
});
