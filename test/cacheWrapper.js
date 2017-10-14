import {feathersClient} from "../src/lib/feathersClient"

const request = require('request');

export const isOnFeathers = (url, service, title) => {
    let isFound = false;
    request.get("{0}/{1}/?title={2}".format(url, service, encodeURIComponent(title)), function (err, res, body){
        const respJSON = JSON.parse(body);
        if (respJSON.data) {
            isFound = true;
        }
        console.log('title found on feathers:', isFound);
        return isFound
    });
};

export const addFeathersCampaign = (contructedModel, txHash, pluginAddress, totalDonated, donationCount, status) => {
    feathersClient.service('campaigns').create(Object.assign({}, constructedModel, {
        txHash,
        pluginAddress: pluginAddress,
        totalDonated: totalDonated,
        donationCount: donationCount,
        status: status
    }))
};

export const addFeathersDAC = (contructedModel, txHash, totalDonated, donationCount) => {
    feathersClient.service('campaigns').create(Object.assign({}, constructedModel, {
        txHash,
        totalDonated: totalDonated,
        donationCount: donationCount
    }))
};

export const addFeathersUser = (userAddress, constructedModel) => {
    feathersClient.service('/users').patch(userAddress, constructedModel)
};

export const addFeathersMilestone = (constructedModel, txHash) => {
    feathersClient.service('milestones').create(Object.assign({}, constructedModel, {
        txHash,
        pluginAddress: '0x0000000000000000000000000000000000000000',
        totalDonated: 0,
        donationCount: 0,
    }))
};
