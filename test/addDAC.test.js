import { isOnChain, updateDAC } from "./blockWrapper"
import { isOnFeathers } from "./cacheWrapper"
import { unlockWallet } from "./walletWrapper"

let dacModel = {
    title: 'test dac title',
    description: 'test dac description',
    summary: '',
    image: '',
    videoUrl: '',
    communityUrl: '',
    delegateId: 0,
    ownerAddress: null,
    uploadNewImage: false
};

describe('Add DAC', () => {

    before(async () => {
        // need to unlock wallet
        let result1 = await unlockWallet(web3);
    });

    it('should add DAC successfully', async () => {
        // add DAC
        let result2 = await updateDAC(dacModel,
            'http://localhost:3030/uploads/6d96ce0ec520ff71411c9345530e28da7d6419cdc38ec31a18461f04dbb87332.png',
            'test summary',
            0,
            network);
    });

    it('verify DAC is on chain', async () => {
        // verify on blockchain
        let truth = await isOnChain('Delegate', dacModel.title, network);
    });

    it('verify DAC is on feathers', async () => {
        // verify on feathers
        let truth = await isOnFeathers('http://localhost:3030', 'dacs', dacModel.title)
    });
});
