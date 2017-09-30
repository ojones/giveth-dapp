import React from 'react';
import GoBackButton from './GoBackButton';

import Adapter from 'enzyme-adapter-react-15';

configure({ adapter: new Adapter() });

describe('GoBackButton link', () => {
    const wrapper = shallow(<GoBackButton />);

    it('should be an an anchor tag link', () => {
        expect(wrapper.type()).to.eql('a');
    });
});