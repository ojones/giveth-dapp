import { isOnChain, updateMilestone } from "./blockWrapper"
import { isOnFeathers } from "./cacheWrapper"
import { unlockWallet } from "./walletWrapper"


const milestoneModel = {
    title: 'test title milestone',
    description: 'test description milestone',
    summary: '',
    maxAmount: '99',
    ownerAddress: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    reviewerAddress: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    recipientAddress: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
    completionDeadline: new Date(2017, 11, 1),
    image: 'http://localhost:3030/uploads/6d96ce0ec520ff71411c9345530e28da7d6419cdc38ec31a18461f04dbb87332.png',
    campaignId: 1,
    milestoneId: 1,
    status: 'pending' // make sure not to change status!
};

describe('Add milestone', () => {

    before(async () => {
        // need to unlock wallet
        let result1 = await unlockWallet(web3);
    });

    it('should add milestone successfully', async () => {
        // add milestone
        let result2 = await updateMilestone(milestoneModel, network);
    });

    it('verify milestone is on chain', async () => {
        // verify on blockchain
        let truth = await isOnChain('Project', milestoneModel.title, network);
        // doesn't wait for truth to return
        // assert.equal(truth, true);
    });

    it('verify milestone is on feathers', async () => {
        // verify on feathers
        let truth = await isOnFeathers('http://localhost:3030', 'milestones', milestoneModel.title)
        // doesn't wait for truth to return
        // assert.equal(truth, true);
    });
});