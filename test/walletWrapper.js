import GivethWallet from "../src/lib/blockchain/GivethWallet";
import { authenticate } from "../src/lib/helpers"
import ZeroClientProvider from "../src/lib/blockchain/ZeroClientProvider";


export const setWallet = (wallet, web3) => {
    if (!wallet) throw new Error('a wallet is required');

    const engine = new ZeroClientProvider({
        wsProvider: web3.currentProvider,
        getAccounts: cb => cb(null, wallet.getAddresses()),
        approveTransaction: (txParams, cb) => {
            //TODO handle locked wallet here?
            cb(null, true);
        },
        signTransaction: (txData, cb) => {
            // provide chainId as GivethWallet.Account does not have a provider set. If we don't provide
            // a chainId, the account will attempt to fetch it via the provider.
            const getId = (txData.chainId) ? Promise.resolve(txData.chainId) : this.eth.net.getId;

            getId()
                .then(id => {
                    txData.chainId = id;

                    try {
                        const sig = wallet.signTransaction(txData);
                        cb(null, sig.rawTransaction);
                    } catch (err) {
                        cb(err);
                    }

                })
        },
    });
}

export const unlockWallet = (web3) => {
    const parsedKeystore = {
        "version": 3,
        "id": "01d5861b-15ed-4f23-b974-9a464257f789",
        "address": "90f8bf6a479f320ead074411a4b0e7944ea8c9c1",
        "crypto": {
            "ciphertext": "a94bd43fcfbd7505a115f87d59b4d0b479d71cdd317c334bf272e0ac9cce28af",
            "cipherparams": {"iv": "de3a17f628ca9b37bfd43c314f8b5363"},
            "cipher": "aes-128-ctr",
            "kdf": "scrypt",
            "kdfparams": {
                "dklen": 32,
                "salt": "f6f9835b5bdb5a550402ebe1234b5b19e9e19c5f9d5116b25c0df4202525c623",
                "n": 8192,
                "r": 8,
                "p": 1
            },
            "mac": "79a09854ff1848dcbdc7127a0f50d844269321be1d6f32e44645db80e0e29cd8"
        }
    };

    let wallet = undefined;
    GivethWallet.loadWallet(parsedKeystore, undefined, 'password')
        .then(w => {
            wallet = w;
        })
        .then(() => {
            authenticate
        })
        .then(token => {
            // this.props.handleWalletChange(wallet);
            setWallet(wallet, web3);
            // getWeb3().then(web3 => {
            //     web3.setWallet(wallet);
            // })
            //     .catch((error) => {
            //         if (typeof error === 'object') {
            //             console.error(error);
            //         }
            //         // this.setState({isLoading: false, error})
            //     });
            // need to get token currently undefined
            // return feathersClient.passport.verifyJWT(token);
        })
        .then(payload => {
            // payload.newUser ? this.props.history.push('/profile') : this.props.history.push('/');
        })
        .catch((error) => {
            if (typeof error === 'object') {
                console.error(error);

                error = (error.type && error.type === 'FeathersError') ? "authentication error" :
                    "Error unlocking wallet. Possibly an invalid password.";
            }
            // this.setState({isLoading: false, error})
        });
}