```markdown
# Anamika blockchain project
# Supply Chain Authentication Using Blockchain System

A blockchain-powered web application designed for **secure product authentication and traceability** in the supply chain. This system uses **Ethereum's Sepolia testnet** to log product transfers immutably and supports **MetaMask integration** for wallet-based authentication and transactions.

---

## 🔐 Key Features

- ⛓️ Blockchain Integration with Ethereum (Sepolia)
- 🧑‍💼 Role-Based Access (Manufacturer, Retailer, Customer)
- 🔍 Product Verification System
- 🔄 Product Ownership Transfers
- 💼 MetaMask Integration for Ethereum transactions

---

## 🛠️ Tech Stack

| Layer       | Technology                 |
|-------------|----------------------------|
| Frontend    | HTML, CSS, JavaScript      |
| Backend     | Node.js, Express.js        |
| Blockchain  | Ethereum (Sepolia), Web3/Ethers |
| Wallet      | MetaMask                   |
| Database    | PostgreSQL                 |

---

## 📁 Folder Structure

```

supplychain-authentication-using-blockchain-system/
│
├── backend/
│   ├── server.js              # Main Express server
│   ├── .env                   # Environment configuration (see below)
│   ├── db.js / config.js      # Database connection logic
│   └── node\_modules/
│
├── blockchain.js              # Blockchain logic
├── contract/                  # Smart contract (if applicable)
├── index.html                 # Entry page
├── manufacturer-dashboard.html
├── retailer-dashboard.html
├── customer-dashboard.html    # Role-based dashboards
├── script.js                  # Frontend JS
├── styles.css                 # CSS styling
└── README.md                  # This file

````

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [MetaMask Extension](https://metamask.io/)
- [Infura](https://infura.io/) account
- A deployed smart contract on Sepolia (or use Remix to deploy one)

---

### 📦 Backend Setup

1. **Clone the repository**

```bash
git clone https://github.com/Ansika2005/supplychain-authentication-using-blockchain-system-.git
cd supplychain-authentication-using-blockchain-system-
````

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Create a `.env` file** inside the `backend/` folder:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD="your-db-password"
DB_HOST=localhost
DB_NAME=supplychain
DB_PORT=5432
JWT_SECRET=your-jwt-secret
NODE_ENV=development

# Blockchain Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-infura-project-id
PRIVATE_KEY=your-wallet-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key

# MetaMask Configuration
METAMASK_ENABLED=false
DEFAULT_NETWORK=sepolia
CONTRACT_ADDRESS=your-deployed-contract-address
```

4. **Start the backend server**

```bash
node server.js
```

---

### 💻 Frontend Usage

* Open `index.html` in your browser
* Navigate to Manufacturer / Retailer / Customer dashboard
* Use MetaMask to simulate transactions if enabled

---

## 🔗 Blockchain Setup

* Ensure MetaMask is connected to **Sepolia Test Network**
* Fund your wallet with Sepolia test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
* Use the `CONTRACT_ADDRESS` of your deployed smart contract
* Backend uses the `PRIVATE_KEY` from `.env` to sign blockchain transactions

---

## 👥 Roles

| Role         | Responsibilities                        |
| ------------ | --------------------------------------- |
| Manufacturer | Add products and transfer to retailer   |
| Retailer     | Verify and transfer to customer         |
| Customer     | Verify product history and authenticity |

---

## 🔐 MetaMask Integration

If `METAMASK_ENABLED=true`:

* Users will be prompted to connect their MetaMask wallet.
* Transactions will require wallet signature.
* Ensure MetaMask is set to the **Sepolia** network.

---

## 🐛 Troubleshooting

* **Contract not working?** Ensure the address matches your deployed contract on Sepolia.
* **Blockchain error?** Check Infura project ID and wallet balance.
* **DB not connecting?** Verify PostgreSQL credentials in `.env`.

---

## 🙋‍♀️ Author

**Ansika Singh** **Aditi Pawar**

* GitHub: [@Ansika2005](https://github.com/Ansika2005)
* GitHub: [void-aditi](https://github.com/void-aditi)
---

## 📄 License

MIT License

---

## 💬 Feedback

Feel free to open an issue or submit a pull request if you'd like to contribute!
