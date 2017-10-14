import { getTruncatedText, displayTransactionError } from '../src/lib/helpers';
import { addFeathersCampaign, addFeathersDAC, addFeathersUser, addFeathersMilestone } from "./cacheWrapper"
import LPPCampaign from 'lpp-campaign';
import LPPMilestone from 'lpp-milestone';
import { utils } from 'web3';

export const isOnChain = async (adminType, name, network) => {
    // getNetwork(web3)
    //     .then(network => {
            const {liquidPledging} = network;
            liquidPledging.getState()
                .then(lpState => {
                    return findManager(lpState, adminType, name);
                })
        // })
};

const findManager = (lpState, adminType, name) => {
    let isFound = false;
    lpState.admins.forEach(v => {
        if (v) {
            if (v.name === name && v.type === adminType) {
                isFound = true;
            }
        }
    });
    console.log('name and adminType found on chain:', isFound);
    return isFound
};

export const updateCampaign = (model, file, summary, projectId, network) => {
    const constructedModel = {
        title: model.title,
        description: model.description,
        communityUrl: model.communityUrl,
        summary: getTruncatedText(summary, 200),
        image: file,
        projectId: projectId,
        dacs: model.dacs,
        reviewerAddress: model.reviewerAddress
    }

    // if(this.props.isNew){
    if (true) {
        const createCampaign = (txHash) => {
            addFeathersCampaign(constructedModel, txHash, '0x0000000000000000000000000000000000000000', 0, 0, 'pending')
            // .then(() => this.props.history.push('/my-campaigns'));
        };

        let txHash;
        let etherScanUrl;
        // let network = test_getNetwork(web3);
        // Promise.all([ getNetwork(), getWeb3() ])
        //     .then(([ network, web3 ]) => {
        const { liquidPledging } = network;
        etherScanUrl = network.txHash;

        // web3, lp address, name, parentProject, reviewer
        LPPCampaign.new(web3, liquidPledging.$address, model.title, '', 0, model.reviewerAddress)
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
                displayTransactionError(txHash, etherScanUrl);
            });
    }
    // else {
    //     feathersClient.service('campaigns').patch(this.state.id, constructedModel)
    //         .then(()=> afterEmit())
    // }
};

export const updateDAC = async (model, file, summary, delegateId, network) => {
    const constructedModel = {
        title: model.title,
        description: model.description,
        communityUrl: model.communityUrl,
        summary: getTruncatedText(summary, 200),
        delegateId: delegateId,
        image: file,
    };

    // if(this.props.isNew){
    if (true) {
        const createDAC = (txHash) => {
            constructedModel.txHash = txHash;
            addFeathersDAC(constructedModel, txHash, 0, 0, 'pending')
            // .then(() => this.props.history.push('/my-campaigns'));
        };

        let txHash;
        let etherScanUrl;
        // let network = await test_getNetwork(web3);
        // getNetwork()
        //     .then(network => {
        const { liquidPledging } = network;
        etherScanUrl = network.etherscan;
        liquidPledging.addDelegate(model.title, '', 0, '0x0')
            .once('transactionHash', hash => {
                txHash = hash;
                createDAC(txHash);
                console.log(`Your DAC is pending. ${network.etherscan}tx/${txHash}`)
            })
            .then(() => {
                console.log(`New DAC transaction mined ${network.etherscan}tx/${txHash}`);
                // afterEmit(true);
            })
            // })
            .catch(err => {
                console.log('New DAC transaction failed:', err);
                displayTransactionError(txHash, etherScanUrl);
            });
    }
    // else {
    //     feathersClient.service('dacs').patch(id, constructedModel)
    //         .then(()=> afterEmit())
    // }
};

export const updateUser = async (model, file, userAddress, network) => {
    const constructedModel = {
        name: model.name,
        email: model.email,
        linkedIn: model.linkedIn,
        avatar: file,
        // if no giverId, set to 0 so we don't add 2 givers for the same user if they update their profile
        // before the AddGiver tx has been mined. 0 is a reserved giverId
        // this.state.giverId || 0,
        giverId: 0,
    };

    // TODO if (giverId > 0), need to send tx if commitTime or name has changed
    // TODO store user profile on ipfs and add Giver in liquidpledging contract
    // if (this.state.giverId === undefined) {
    if (true) {
        // getNetwork()
        //     .then(network => {
        //         const { liquidPledging } = network;
        const { liquidPledging } = network;
                let txHash;
                liquidPledging.addGiver(model.name, '', 259200, '0x0') // 3 days commitTime. TODO allow user to set commitTime
                    .once('transactionHash', hash => {
                        txHash = hash;

                        addFeathersUser(userAddress, constructedModel)
                            .then((user) => {
                                console.log('Your profile was created!')
                                // React.toast.success(<p>Your profile was created!<br/><a href={`${network.etherscan}tx/${txHash}`} target="_blank" rel="noopener noreferrer">View transaction</a></p>)
                                // this.setState(Object.assign({}, user, { isSaving: false }));
                            // });
                    })
                    .then(txReceipt =>
                        // React.toast.success(<p>You are now a registered user<br/><a href={`${network.etherscan}tx/${txHash}`} target="_blank" rel="noopener noreferrer">View transaction</a></p>))
                        console.log('You are now a registered user'))
                    .catch(err => {
                        console.log('AddGiver transaction failed:', err)
                        displayTransactionError(txHash, network.etherscan)
                    })
            })
    }
    // else {
    //     feathersClient.service('/users').patch(this.props.currentUser.address, constructedModel)
    //         .then(user => {
    //             React.toast.success("Your profile has been updated.");
    //             this.setState(Object.assign({}, user, { isSaving: false }));
    //         })
    //         .catch(err => console.log('update profile error -> ', err));
    // }
};


export const updateMilestone = (model, network) => {
    const constructedModel = {
        title: model.title,
        description: model.description,
        summary: getTruncatedText(model.summary, 100),
        maxAmount: utils.toWei(model.maxAmount),
        ownerAddress: model.ownerAddress,
        reviewerAddress: model.reviewerAddress,
        recipientAddress: model.recipientAddress,
        completionDeadline: model.ompletionDeadline,
        image: model.Image,
        campaignId: model.campaignId,
        status: model.status // make sure not to change status!
    };

    // if(this.props.isNew){
    if (true) {
        const createMilestone = () => {
            // feathersClient.service('milestones').create(Object.assign({}, constructedModel, {
            //     txHash,
            //     pluginAddress: '0x0000000000000000000000000000000000000000',
            //     totalDonated: 0,
            //     donationCount: 0,
            // }))
            addFeathersMilestone(constructedModel, txHash)
                // .then(() => afterEmit(true))
        };

        let txHash;
        let etherScanUrl;
        // Promise.all([ getNetwork(), getWeb3() ])
        //     .then(([ network, web3 ]) => {
                const { liquidPledging } = network;
                etherScanUrl = network.txHash;

                // web3, lp address, name, parentProject, recipient, maxAmount, reviewer
                LPPMilestone.new(web3, liquidPledging.$address, model.title, '', model.milestoneId, model.recipientAddress, constructedModel.maxAmount, model.reviewerAddress)
                    .on('transactionHash', (hash) => {
                        txHash = hash;
                        createMilestone(txHash);
                        // React.toast.info(<p>Your milestone is pending....<br/><a href={`${etherScanUrl}tx/${txHash}`} target="_blank" rel="noopener noreferrer">View transaction</a></p>)
                        console.log('Your milestone is pending....')
                    })
                    .then(() => {
                        // React.toast.success(<p>Your milestone has been created!<br/><a href={`${etherScanUrl}tx/${txHash}`} target="_blank" rel="noopener noreferrer">View transaction</a></p>)
                        console.log('Your milestone has been created!')
                    })
            // })
            .catch(err => {
                console.log('New milestone transaction failed:', err);
                displayTransactionError(txHash, etherScanUrl)
            });


    }
    // else {
    //     feathersClient.service('milestones').patch(this.state.id, constructedModel)
    //         .then(()=> afterEmit())
    // }

};
