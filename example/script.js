/*
 * transitionRegion
 * ----------------
 * We instantiate our TransitionRegion here. Take note how there's
 * nothing special here at all. In fact, it's backwards compatible
 * with normal regions. It just has some super powers if you pair it
 * with the right View.
 *
 */

(function() {
  var myRegion = new Marionette.TransitionRegion({
    el: 'div.region'
  });

  window.myRegion = myRegion;
})();

/*
 * NormalView
 * ----------
 * Just a normal ItemView.
 *
 */

(function() {
  var NormalView = Marionette.ItemView.extend({
    template: _.template('<h1>Normal View</h1><div>A random number: <%= randomNumber %></div>'),
    className: 'normal-view view'
  });

  window.NormalView = NormalView;
})();

/*
 * AnimationView
 * ------------
 * A view that supports animated transitions. All you do is add in
 * either animateIn or animateOut methods. Once you've done your animation
 * simply trigger 'animateOut' or 'animateIn' to let the region know.
 *
 */

(function() {
  var ANIMATION_DURATION = 300;

  var AnimationView = Marionette.ItemView.extend({
    template: _.template('<h1>Animated View</h1><div>A random name: <%= randomName %></div>'),
    className: 'animated-view view',

    // Do some jQuery stuff, then, once you're done, trigger 'animateIn' to let the region
    // know that you're done
    animateIn: function() {
      this.$el.animate(
        { opacity: 1 },
        ANIMATION_DURATION,
        _.bind(this.trigger, this, 'animateIn')
      );
    },

    // Same as above, except this time we trigger 'animateOut'
    animateOut: function() {
      this.$el.animate(
        { opacity: 0 },
        ANIMATION_DURATION,
        _.bind(this.trigger, this, 'animateOut')
      );
    }
  });

  window.AnimationView = AnimationView;
})();

/*
 * random
 * ------
 * This generates random numbers and names to populate
 * our templates, to make it a bit more obvious when the 
 * view changes.
 *
 */

(function() {
  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var names = [
    'Sam', 'Jameskyle', 'Humphreys', 'Jason', 'MeoMix',
    'Joanne', 'jpdesign', 'Jmeas', 'pekala', 'chiplay',
    'joe zim', 'dbailey', 'cobbweb'
  ];

  function randomName() {
    var randomIndex = randomNumber(0, names.length-1);
    return names[randomIndex];
  }

  window.randomNumber = randomNumber;
  window.randomName = randomName;
})();

/*
 * buttons
 * -------
 * Make those buttons do something
 *
 */

(function() {
  function newNormal() {
    var normalView = new NormalView({
      model: new Backbone.Model({
        randomNumber: randomNumber(0, 100)
      })
    });
    myRegion.show(normalView);
  }

  function newAnimated() {
    var animationView = new AnimationView({
      model: new Backbone.Model({
        randomName: randomName()
      })
    });
    myRegion.show(animationView);
  }

  function emptyRegion() {
    myRegion.close();
  }

  var $newNormal = $('.show-normal');
  var $newAnimated = $('.show-animated');
  var $emptyRegion = $('.empty-region');

  $newNormal.on('click', newNormal);
  $newAnimated.on('click', newAnimated);
  $emptyRegion.on('click', emptyRegion);
})();
