/*
 * Our Regions
 * -----------
 * We instantiate our regions here. Take note how there's
 * nothing special here at all. In fact, it's backwards compatible
 * with normal regions. It just has some super powers if you pair it
 * with the right View.
 *
 */

(function() {
  var normalRegion = new Marionette.TransitionRegion({
    el: '.normal-region'
  });

  var fadeRegion = new Marionette.TransitionRegion({
    el: '.fade-region'
  });

  // For the sliding region, we set the class-level property
  // that makes the transition in and out effects happen concurrently
  var slideRegion = new Marionette.TransitionRegion({
    el: '.slide-region',
    concurrentAnimation: true
  });

  window.normalRegion = normalRegion;
  window.fadeRegion = fadeRegion;
  window.slideRegion = slideRegion;
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
 * FadeView
 * --------
 * A view that supports animated transitions. All you do is add in
 * either animateIn or animateOut methods. Once you've done your animation
 * simply trigger 'animateOut' or 'animateIn' to let the region know.
 *
 */

(function() {
  var ANIMATION_DURATION = 200;

  var FadeView = Marionette.ItemView.extend({
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

  window.FadeView = FadeView;
})();

/*
 * SlideView
 * ---------
 * Another view. This one does slide stuff LIKE MAGIC
 *
 */

(function() {
  var ANIMATION_DURATION = 400;

  var SlideView = Marionette.ItemView.extend({
    template: _.template('<h1>Animated View</h1><div>A random place: <%= randomPlace %>.<br>Also more test so you can see that they do exist at the same time.</div>'),
    className: 'animated-view view',

    transitionInCss: {
      position: 'absolute',
      left: 500,
    },

    // Do some jQuery stuff, then, once you're done, trigger 'animateIn' to let the region
    // know that you're done
    animateIn: function() {
      this.$el.animate(
        { left: 0 },
        ANIMATION_DURATION,
        _.bind(this.trigger, this, 'animateIn')
      );
    },

    // Same as above, except this time we trigger 'animateOut'
    animateOut: function() {
      this.$el.animate(
        { left: -500 },
        ANIMATION_DURATION,
        _.bind(this.trigger, this, 'animateOut')
      );
    }
  });

  window.SlideView = SlideView;
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

  var places = [
    'Yosemite', 'Philadelphia', 'Boston', 'Brooklyn', 'Ukraine',
    'Kokomo', 'Florida', 'Your house', 'Palo Alto', 'Bermuda'
  ];


  function randomName() {
    var randomIndex = randomNumber(0, names.length-1);
    return names[randomIndex];
  }

  function randomPlace() {
    var randomIndex = randomNumber(0, places.length-1);
    return places[randomIndex];
  }

  window.randomNumber = randomNumber;
  window.randomName = randomName;
  window.randomPlace = randomPlace;
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
    normalRegion.show(normalView);
  }

  function newFadeView() {
    var fadeView = new FadeView({
      model: new Backbone.Model({
        randomName: randomName()
      })
    });
    fadeRegion.show(fadeView);
  }

  function newSlideView() {
    var slideView = new SlideView({
      model: new Backbone.Model({
        randomPlace: randomPlace()
      })
    });
    slideRegion.show(slideView);
  }

  function emptyNormalRegion() {
    normalRegion.empty();
  }

  function emptyFadeRegion() {
    fadeRegion.empty();
  }

  function emptySlideRegion() {
    slideRegion.empty();
  }

  var $newNormal = $('.show-normal');
  var $fadeIn = $('.fade-in');
  var $slideIn = $('.slide-in');
  var $emptyNormal = $('.empty-normal');
  var $emptyFade = $('.empty-fade');
  var $emptySlide = $('.empty-slide');

  $newNormal.on('click', newNormal);
  $fadeIn.on('click', newFadeView);
  $slideIn.on('click', newSlideView);
  $emptyNormal.on('click', emptyNormalRegion);
  $emptyFade.on('click', emptyFadeRegion);
  $emptySlide.on('click', emptySlideRegion);
})();
