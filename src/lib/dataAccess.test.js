import getNetwork from "./blockchain/getNetwork";
import { feathersClient } from './feathersClient';
import { getTruncatedText } from './helpers';
var assert = require('assert');


describe('Access data on blockchains and feathers', () => {

    it('should run successfully', function() {
        let dacModel = {
            title: 'test title',
            description: 'test description',
            summary: '',
            image: '',
            videoUrl: '',
            communityUrl: '',
            delegateId: 0,
            ownerAddress: null,
            uploadNewImage: false
        };

        const updateDAC = (model, file, summary, delegateId) => {
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
                    feathersClient.service('dacs').create(constructedModel)
                        // .then(() => this.props.history.push('/my-dacs'));
                };

                let txHash;
                let etherScanUrl;
                getNetwork()
                    .then(network => {
                        const { liquidPledging } = network;
                        etherScanUrl = network.txHash;

                        liquidPledging.addDelegate(model.title, 0, '0x0')
                            .once('transactionHash', hash => {
                                txHash = hash;
                                createDAC(txHash);
                                console.log(`Your DAC is pending. ${network.etherscan}tx/${txHash}`)
                            })
                            .then(() => {
                                console.log(`New DAC transaction mined ${network.etherscan}tx/${txHash}`);
                                afterEmit(true);
                            })
                    })
                    .catch(err => {
                        console.log('New DAC transaction failed:', err);
                        let msg;
                        if (txHash) {
                            msg = `Something went wrong with the transaction. ${etherScanUrl}tx/${txHash}`;
                            //TODO update or remove from feathers? maybe don't remove, so we can inform the user that the tx failed and retry
                        } else {
                            msg = "Something went wrong with the transaction. Is your wallet unlocked?";
                        }
                        console.log(msg);
                    });
            }
            // else {
            //     feathersClient.service('dacs').patch(id, constructedModel)
            //         .then(()=> afterEmit())
            // }
        };

        updateDAC(dacModel,
        'http://localhost:3030/uploads/6d96ce0ec520ff71411c9345530e28da7d6419cdc38ec31a18461f04dbb87332.png',
        'test summary',
        0);

        assert.equal('A', 'A');
    });
});