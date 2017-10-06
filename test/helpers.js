import { expect, assert } from 'chai';
import { sinon, spy } from 'sinon';
import { mount, render, shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
require('dotenv').config({path: './.env.local'});

const Web3 = require('web3');
const web3 = new Web3('ws://localhost:8546');

global.assert = assert;
global.expect = expect;
global.sinon = sinon;
global.spy = spy;

global.mount = mount;
global.render = render;
global.shallow = shallow;
global.configure = configure;

configure({ adapter: new Adapter() });

global.web3 = web3;

