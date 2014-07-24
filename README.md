# marionette.transition-region

This library is in pre-alpha development. Use at your own risk.

Animated transitions between your Marionette Views should be easy, and that's what this library is for.

### About

Marionette's robust View layer handles a wide range of common interfaces with deft. However, if you've
tried to implemented animated transitions you'll find that Marionette leaves much of that up to you,
the developer. This library solves the problem of unnecessary boilerplate by providing a clean API for
handling animated transitions.

### Getting Started

The simplest way to get started is with a basic example.

```js
// Create a TransitionRegion as you would any other region
var transitionRegion = new Marionette.TransitionRegion({
  el: '.my-region'
});

// Specify your transitions on your views
var FadeView = Marionette.ItemView.extend({
  template: _.template('<h1>An Animated View</h1>'),

  // Our animation in will use jQuery animate. Once it's done,
  // we trigger 'animateIn' to let the Region know.
  animateIn: function() {
    this.$el.animate(
      { opacity: 1 },
      ANIMATION_DURATION,
      _.bind(this.trigger, this, 'animateIn')
    );
  },

  // Just like the above, except this time we trigger 'animateOut'
  animateOut: function() {
    this.$el.animate(
      { opacity: 0 },
      ANIMATION_DURATION,
      _.bind(this.trigger, this, 'animateOut')
    );
  }
});

// Create a model for our views
var model = new Backbone.Model();

// Showing views will cause them to animate
transitionRegion.show(new FadeView(model));
transitionRegion.show(new FadeView(model));
transitionRegion.show(new FadeView(model));
```

### Region API

#### Properties

##### `transitionInCss`

This CSS is specified on the View before it transitions in. Useful for hiding views if you intend
to fade them in, or to position them appropriately if you plan to slide them in.

The default value is to set the opacity of the View to 0.

##### `concurrentAnimation`

A Boolean that specifies whether or not the transition in and out effects should happen
concurrently. Mainly used for sliding views. Defaults to false.

#### Events

TransitionRegions trigger all of the same events as standard Regions, and a few additional ones.

##### `animateOut`

Triggered when the outbound animation is completed. Passing the View as the first argument.

##### `animateIn`

Like `animateOut`, but fired when the new View has completed animating in. Passes the view as the
first argument.

### View API

#### `animateIn()`

Specify this method on your view to indicate that the view animates in. Perform your animation
within this method, and then trigger the 'animateIn' event to inform the Region that the animation
is complete.

#### `animateOut()`

Like the above, but for animating out. Trigger 'animateOut' when your animation is complete.

#### `animate`

Set this property to true to inform the Region that the View animates both in and out. This 
is intended to be used in conjunction with a Behavior.

Setting this value to true is unnecessary if you have both an `animateIn` and `animateOut` method
on your View.

#### `animateIn`

Like `animate`, this is a Boolean that informs the Region that your View will animate in. It is
intended to be used with a Behavior that adds animations. You don't need to specify this property
if you have an `animateIn` method on your View.

#### `animateOut`

Like the other Boolean properties, but this one is for animating out. It's only needed if you haven't
specified an `animateOut` method on your View.

#### `transitionInCss`

The CSS to set on your View before it transitions in. Specify this to override the default value on the Region.

```js
// For sliding views, you might specify the transitionInCss to position the
// view to the right or left of the Region.
var SlidingView = Marionette.ItemView.extend({
  transitionInCss: {
    position: 'absolute',
    left: 500,
  }
});
```
