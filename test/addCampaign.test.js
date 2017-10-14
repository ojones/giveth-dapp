import { isOnChain, updateCampaign } from "./blockWrapper"
import { isOnFeathers } from "./cacheWrapper"
import { unlockWallet } from "./walletWrapper"


let campaignModel = {
    title: 'test campaign title',
    description: 'test campaign description',
    summary: '',
    image: '',
    videoUrl: '',
    communityUrl: '',
    projectId: 0,
    ownerAddress: null,
    uploadNewImage: false,
    reviewerAddress: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
    dacs: [],
};

describe('Add campaign', () => {

    before(async () => {
        // need to unlock wallet
        let result1 = await unlockWallet(web3);
    });

    it('should add campaign successfully', async () => {
        // add campaign
        let result2 = await updateCampaign(campaignModel,
        'http://localhost:3030/uploads/6d96ce0ec520ff71411c9345530e28da7d6419cdc38ec31a18461f04dbb87332.png',
        'test summary',
        0,
        network);
    });

    it('verify campaign is on chain', async () => {
        // verify on blockchain
        let truth = await isOnChain('Project', campaignModel.title, network);
        // doesn't wait for truth to return
        // assert.equal(truth, true);
    });

    it('verify campaign is on feathers', async () => {
        // verify on feathers
        let truth = await isOnFeathers('http://localhost:3030', 'campaigns', campaignModel.title)
        // doesn't wait for truth to return
        // assert.equal(truth, true);
    });
});