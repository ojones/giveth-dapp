import React from 'react';
import GoBackButton from './GoBackButton';

describe('GoBackButton link', () => {
    const wrapper = shallow(<GoBackButton />);

    it('should be an an anchor tag link', () => {
        expect(wrapper.type()).to.eql('a');
    });
});