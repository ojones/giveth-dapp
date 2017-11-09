import React from 'react';
import EditDAC from './EditDAC';


describe('EditDAC view', () => {
    const wrapper = mount(<EditDAC />);

    it('should submit form without error', () => {
        wrapper.find('#title-input').simulate('change', {target: {value: 'Test DAC name'}});
        wrapper.find('.ql-editor').simulate('change', {target: {value: 'Test description of DAC'}});
        wrapper.find('.btn-success').simulate('click');
        expect(wrapper.type()).to.eql('a');
    });
});