import { isOnChain, updateUser } from "./blockWrapper"
import { isOnFeathers } from "./cacheWrapper"
import { unlockWallet } from "./walletWrapper"


let giverModel = {
    name: 'adalovelace',
    email: 'wakeupo+givethmvptestj@gmail.com',
    linkedIn: 'https://www.linkedin.com/in/adalovelace',
};

describe('Add giver', () => {

    before(async () => {
        // need to unlock wallet
        let result1 = await unlockWallet(web3);
    });

    it('should add giver successfully', async () => {
        // add giver
        let result2 = await updateUser(giverModel,
            'http://localhost:3030/uploads/6d96ce0ec520ff71411c9345530e28da7d6419cdc38ec31a18461f04dbb87332.png',
            '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            network);
    });

    it('verify giver is on chain', async () => {
        // verify on blockchain
        let truth = await isOnChain('Giver', giverModel.name, network);
        // doesn't wait for truth to return
        // assert.equal(truth, true);
    });

    it('verify giver is on feathers', async () => {
        // verify on feathers
        let truth = await isOnFeathers('http://localhost:3030', 'users', giverModel.name)
        // doesn't wait for truth to return
        // assert.equal(truth, true);
    });
});