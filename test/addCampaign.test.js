import test_getNetwork from "../src/lib/blockchain/test_getNetwork";
import { feathersClient } from '../src/lib/feathersClient';
import { getTruncatedText, authenticate } from '../src/lib/helpers';
import GivethWallet from "../src/lib/blockchain/GivethWallet";
import getWeb3 from "../src/lib/blockchain/getWeb3";
import ZeroClientProvider from "../src/lib/blockchain/ZeroClientProvider";
import liquidpledging from 'liquidpledging';
var request = require('request');


function setWallet(wallet) {
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

function unlockWallet(done) {
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
            setWallet(wallet);
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
            done();
        })
        .catch((error) => {
            if (typeof error === 'object') {
                console.error(error);

                error = (error.type && error.type === 'FeathersError') ? "authentication error" :
                    "Error unlocking wallet. Possibly an invalid password.";
            }
            // this.setState({isLoading: false, error})
            done();
        });
}

const updateCampaign = (model, file, summary, projectId, done) => {
    const constructedModel = {
        title: model.title,
        description: model.description,
        communityUrl: model.communityUrl,
        summary: getTruncatedText(summary, 200),
        image: file,
        projectId: projectId,
        dacs: model.dacs,
    }

    // if(this.props.isNew){
    if (true) {
        const createCampaign = (txHash) => {
            constructedModel.txHash = txHash;
            feathersClient.service('campaigns').create(constructedModel)
                // .then(() => this.props.history.push('/my-campaigns'));
        };

        let txHash;
        let etherScanUrl;
        let network = test_getNetwork(web3);
        // getNetwork()
        //     .then(network => {
                const { liquidPledging } = network;
                etherScanUrl = network.txHash;

                liquidPledging.addProject(model.title, '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0', 0, 0, '0x0')
                    .once('transactionHash', hash => {
                        txHash = hash;
                        createCampaign(txHash);
                        console.log(`Your campaign is pending. ${etherScanUrl}tx/${txHash}`)
                    })
                    .then(() => {
                        console.log(`Your Campaign was created! ${etherScanUrl}tx/${txHash}`);
                    })
            // })
            .catch(err => {
                console.log('New Campaign transaction failed:', err);
                let msg;
                if (txHash) {
                    msg = `Something went wrong with the transaction. ${etherScanUrl}tx/${txHash}`;
                    //TODO update or remove from feathers? maybe don't remove, so we can inform the user that the tx failed and retry
                } else {
                    msg = "Something went wrong with the transaction. Is your wallet unlocked?";
                }
                console.log(msg);
                done();
            });
    }
    // else {
    //     feathersClient.service('campaigns').patch(this.state.id, constructedModel)
    //         .then(()=> afterEmit())
    // }
};

const findManager = (name, type, lpState, done) => {
    let truth = false;
    lpState.managers.forEach(v => {
            if (v) {
                if (v.name === name && v.type === type) {
                    truth = true;
                }
            }
        });
    assert.equal(truth, true);
    done()
};

const isOnChain = (name, type, done) => {
    test_getNetwork(web3)
        .then(network => {
            const {liquidPledging} = network;
            liquidPledging.getState()
                .then(lpState => {
                    console.log(lpState);
                    findManager(name, type, lpState, done);
                })
            })
};

const isOnFeathers = async (name, service) => {
    return await feathersClient.service(service).find().then(() => {
            console.log('hello can you see me');
        });
};

let campaignModel = {
    title: 'test title',
    description: 'test description',
    summary: '',
    image: '',
    videoUrl: '',
    communityUrl: '',
    projectId: 0,
    ownerAddress: null,
    uploadNewImage: false,
    dacs: [],
};


describe('Add campaign on blockchains and feathers', () => {

    before((done) => {
        // need to unlock wallet
        unlockWallet(done);
    });

    it('should add campaign successfully', (done) => {
        // add campaign
        updateCampaign(campaignModel,
        'http://localhost:3030/uploads/6d96ce0ec520ff71411c9345530e28da7d6419cdc38ec31a18461f04dbb87332.png',
        'test summary',
        0,
        done);
    });

    it('should verify campaign on chain successfully', (done) => {
        // verify on blockchain
        isOnChain(campaignModel.title, 'Project', done);
    });

    it('should verify campaign on feathers successfully', (done) => {
        request.get('http://localhost:3030/campaigns/?title=' + encodeURIComponent(campaignModel.title), function (err, res, body){
            const respJSON = JSON.parse(body);
            if (respJSON.data) {
                assert.notEqual(respJSON.data.length, 0);
                done();
            }
        });
    });
});