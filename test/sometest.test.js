import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import CardStats from '../src/components/CardStats'

const wrapper = shallow(<CardStats />);

describe('(Component) CardStats', () => {
    it('renders...', () => {
        expect(wrapper).to.have.length(1);
    });
});