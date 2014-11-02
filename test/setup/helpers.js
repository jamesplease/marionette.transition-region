function setupTestHelpers() {
  beforeEach(function() {
    this._originalRegion = Marionette.Region;
    Marionette.Region = Marionette.TransitionRegion;
    this.sinon = sinon.sandbox.create();
    this.setFixtures   = setFixtures;
    this.clearFixtures = clearFixtures;
    global.stub = _.bind(this.sinon.stub, this.sinon);
    global.spy  = _.bind(this.sinon.spy, this.sinon);
  });

  afterEach(function() {
    Marionette.Region = this._originalRegion;
    this.sinon.restore();
    delete global.stub;
    delete global.spy;
    clearFixtures();
  });
}

var $body = $(document.body);

var setFixtures = function () {
  _.each(arguments, function (content) {
    $body.append(content);
  });
};

var clearFixtures = function () {
  $body.empty();
};

// when running in node
if (typeof exports !== 'undefined') {
  setupTestHelpers();
}

// when running in browser
else {
  this.global = window;
  mocha.setup('bdd');

  window.expect = chai.expect;
  window.sinon = sinon;

  onload = function() {
    mocha.checkLeaks();
    mocha.globals(['stub', 'spy', 'document']);
    mocha.run();
    setupTestHelpers();
  };
}
