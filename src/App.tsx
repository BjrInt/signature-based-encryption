import './App.css'
import { useState, useEffect } from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import { decrypt, encrypt, getKeypair } from './utils/helpers'
import { UIError } from './utils/types'

const App = () => {
  const initialState = { accounts: [], chainId: "" } 
  const [ wallet, setWallet ] = useState(initialState)
  const [ keypair, setKeypair ] = useState<CryptoKey | null>(null)
  const [ error, setError ] = useState<UIError | null>(null)
  const [ clearPayload, setClearPayload ] = useState<string>("")
  const [ encryptedPayload, setEncryptedPayload ] = useState<string>("")
  const [ decryptedPayload, setDecryptedPayload ] = useState<string>("")

  const handleKeypair = async () => {
    const keyPair = await getKeypair(wallet.accounts[0])
    if(keyPair instanceof CryptoKey) 
      return setKeypair(keyPair)
    
    return setError(keyPair as unknown as UIError)
  }

  useEffect(() => {
    const refreshAccounts = (accounts: any) => {
      if (accounts.length > 0) {
        updateWallet(accounts)
      } else {
        // if length 0, user is disconnected
        setWallet(initialState)
      }
    }

    const refreshChain = (chainId: any) => {               
      setWallet((wallet) => ({ ...wallet, chainId }))      
    }                                                      
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true })

      if (provider) {                                           
        const accounts = await window.ethereum.request(
          { method: 'eth_accounts' }
        )
        refreshAccounts(accounts)
        window.ethereum.on('accountsChanged', refreshAccounts)
        window.ethereum.on("chainChanged", refreshChain)  
      }
    }

    getProvider()

    return () => {
      window.ethereum?.removeListener('accountsChanged', refreshAccounts)
      window.ethereum?.removeListener("chainChanged", refreshChain)  
    }
  }, [])

  const updateWallet = async (accounts:any) => {                                                         
    const chainId = await window.ethereum!.request({                  
      method: "eth_chainId",                                          
    })                                                                
    setWallet({ accounts, chainId })                       
  }

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    updateWallet(accounts)
  }

  const handleClearPayload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClearPayload(e.target.value)
  }

  const handleEncrypt = async () => { 
    if(!keypair) return
    const e = await encrypt(keypair, clearPayload)

    if(typeof e === 'string')
      return setEncryptedPayload(e)

    return setError(e as unknown as UIError)
  }

  const handleDecrypt = async () => { 
    if(!keypair) return
    const e = await decrypt(keypair, encryptedPayload)

    if(typeof e === 'string')
      return setDecryptedPayload(e)

    return setError(e as unknown as UIError)
  }

  return (
    <div className="App">
      { window.ethereum?.isMetaMask && wallet.accounts.length < 1 ?
        <button onClick={handleConnect}>Connect MetaMask</button>
        :
        <div>
          { 
            wallet.accounts.map((ac: string) => (
              <div key={ac}>
                {ac}
              </div>
            ))
          }
        </div>
      }

      {
        error &&
        <div className="error-wrapper">
          { error.message }
        </div>
      }
      
      <div style={{ margin: '1rem' }}>
        <button onClick={handleKeypair}>Generate Encryption Keypair</button>
      </div>

      {
        keypair &&
        <div style={{ margin: '1rem' }}>
          <div>
            <input type="text" value={clearPayload} onChange={handleClearPayload} />
            &nbsp;
            <button onClick={handleEncrypt}>Encrypt</button>
          </div>

          <div>
            <input type="text" value={encryptedPayload} readOnly />
            &nbsp;
            <button onClick={handleDecrypt}>Decrypt</button>
          </div>

          <div>
            { decryptedPayload && 
             <span>Decrypted:&nbsp; { decryptedPayload }</span>
            } 
          </div>
        </div>
      }
    </div>
  )
}

export default App