if (!global.document || !global.window) {
  var jsdom = require('jsdom').jsdom;

  global.document = jsdom('<html><head><script></script></head><body></body></html>', null, {
    FetchExternalResources   : ['script'],
    ProcessExternalResources : ['script'],
    MutationEvents           : '2.0',
    QuerySelector            : false
  });

  global.window = document.createWindow();
  global.navigator = global.window.navigator;
}

var sinon = require('sinon');
var chai = require('chai');
var chaiJq = require('chai-jq');
var sinonChai = require('sinon-chai');

global._ = require('underscore');
global.Backbone = require('backbone');
global.$ = global.jQuery = Backbone.$ = require('jquery');
global.Marionette = require('backbone.marionette');

chai.use(sinonChai);
chai.use(chaiJq);

global.expect = chai.expect;
global.sinon = sinon;

require('../../marionette.transition-region.js');
