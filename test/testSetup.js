'use strict';

import jsdom from 'jsdom';
require('dotenv').config({path: './.env.local'});

global.document = jsdom.jsdom('<html><body></body></html>');
global.window = document.defaultView;
global.navigator = window.navigator;

function noop() {
    return {};
}

// prevent mocha tests from breaking when trying to require a css file
require.extensions['.css'] = noop;
require.extensions['.svg'] = noop;

import Adapter from 'enzyme-adapter-react-15';
import { shallow, configure } from 'enzyme';
global.shallow = shallow;
global.configure = configure;
configure({ adapter: new Adapter() });

import { expect, assert } from 'chai';
global.assert = assert;
global.expect = expect;