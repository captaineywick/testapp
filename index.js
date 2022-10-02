import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

// VAR HTML IDs
const connectButton = document.getElementById("connectButton")
const submitButton = document.getElementById("submitButton")

// Functions
connectButton.onclick = connect
submitButton.onclick = submit

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function submit() {
    const feeAmount = "0.001"
    const tokenName = document.getElementById("tokenName").value
    const tickerName = document.getElementById("tickerName").value
    const totalSupply = document.getElementById("totalSupply").value
    console.log(`Fee Amount: ${feeAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.createTokenContract(
                totalSupply,
                tokenName,
                tickerName,
                {
                    value: ethers.utils.parseEther(feeAmount),
                    gasLimit: 1000000,
                }
            )
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            if (error.code === "UNSUPPORTED_OPERATION") {
                window.alert("Please connect your MetaMask")
            }
            console.log(error)
        }
    } else {
        submitButton.innerHTML = "Please install MetaMask"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(`Completed with ${transactionReceipt.confirmations} confirmations. `)
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}
