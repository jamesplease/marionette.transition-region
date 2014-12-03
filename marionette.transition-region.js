/*
 * marionette.transition-region
 *
 */

  Marionette.TransitionRegion = Marionette.Region.extend({

    // The styling to be set on a View that is about to be
    // transitioned in. The default is a good choice for a view
    // that fades in.
    transitionInCss: {
      opacity: 0
    },

    // Whether or not to transition the old view out
    // at the same time that the new view transitions in.
    // The typical use case for setting this to true is to
    // support sliding views.
    concurrentAnimation: false,

    show: function(view, options) {

      // If animating out, set the animateInQueue.
      // This new view will be what is transitioned in
      if (this._animatingOut) {
        this._setTransitionInCache(view, options);
        return this;
      }

      // Otherwise, if we're transitioning out, then we
      // add this view to the queue. This view will be shown
      // after the current transition is complete.
      else if (this._animatingIn) {
        this._setQueue(view, options);
        this._registerQueue();
        return this;
      }

      // Set the transitionIn cache based on the view and arguments passed.
      this._setTransitionInCache(view, options);
      this._animatingOut = true;

      this._ensureElement();

      var currentView = this._oldView = this.currentView;
      var animateOut = currentView && _.isFunction(this.currentView.animateOut);
      var concurrent = this.getOption('concurrentAnimation');

      // If the view has an animate out function & this isn't concurrent,
      // then start the animation and wait for it to conclude before continue.
      if (animateOut && !concurrent) {
        this.listenToOnce(currentView, 'animateOut', _.bind(this._onTransitionOut, this));
        currentView.animateOut();
        return this;
      }

      // Otherwise, if it's animating out and concurrent then we animate
      // out and continue immediatley.
      else if (animateOut && concurrent) {
        currentView.animateOut();
        return this._onTransitionOut();
      }

      // Lastly, if there's no animation we just keep going. This is the behavior
      // of your standard Region.
      else {
        return this._onTransitionOut();
      }
    },

    // If you're familiar with Marionette.Region.prototype.show, then this
    // will look very familiar to you.
    _onTransitionOut: function() {
      this.triggerMethod('animateOut', this.currentView);

      var view = this._transitionInView;
      var options = this._transitionInOptions;
      this._clearTransitionInCache();

      // This is the last time to update what view is about to be shown.
      // At this point, any subsequent shows will cause a brand new animation phase
      // to commence.
      this._animatingOut = false;
      this._animatingIn = true;

      var showOptions = options || {};
      var isDifferentView = view !== this.currentView;
      var preventDestroy =  !!showOptions.preventDestroy;
      var forceShow = !!showOptions.forceShow;

      // we are only changing the view if there is a view to change to begin with
      var isChangingView = !!this.currentView;

      // The region is only animating if there's an animateIn method on the new view
      var animatingIn = _.isFunction(view.animateIn);

      // only destroy the view if we don't want to preventDestroy and the view is different
      var _shouldDestroyView = !preventDestroy && isDifferentView && !this.getOption('concurrentAnimation');

      // Destroy the old view
      if (_shouldDestroyView) {
        this.empty({animate:false});
      }

      // show the view if the view is different or if you want to re-show the view
      var _shouldShowView = isDifferentView || forceShow;

      // Cut things short if we're not showing the view
      if (!_shouldShowView) {
        return this;
      }

      // Render the new view, then hide its $el
      view.render();

      if (isChangingView) {
        this.triggerMethod('before:swap', view);
      }

      // before:show triggerMethods
      this.triggerMethod('before:show', view);
      if (_.isFunction(view.triggerMethod)) {
        view.triggerMethod('before:show');
      } else {
        this.triggerMethod.call(view, 'before:show');
      }

      // Only hide the view if we want to animate it
      if (animatingIn) {
        var transitionInCss = view.transitionInCss || this.transitionInCss;
        view.$el.css(transitionInCss);
      }

      // Attach or append the HTML, depending on whether we
      // want to concurrently animate or not
      if (!this.getOption('concurrentAnimation')) {
        this.attachHtml(view);
      } else {
        this.appendHtml(view);
      }

      this.currentView = view;

      // show triggerMethods
      this.triggerMethod('show', view);
      if (_.isFunction(view.triggerMethod)) {
        view.triggerMethod('show');
      } else {
        this.triggerMethod.call(view, 'show');
      }

      // If there's an animateIn method, then call it and wait for it to complete
      if (animatingIn) {
        this.listenToOnce(view, 'animateIn', _.bind(this._onTransitionIn, this, showOptions));
        view.animateIn();
        return this;
      }

      // Otherwise, continue on
      else {
        return this._onTransitionIn(showOptions);
      }
    },

    // Append the new child
    appendHtml: function(view) {
      this.el.appendChild(view.el);
    },

    // After it's shown, then we triggerMethod 'animateIn'
    _onTransitionIn: function(options) {
      var preventDestroy =  options.preventDestroy;

      // Destroy the old view, if it exists
      // This is only relevant when this is an animated Region.
      // Otherwise, the older view is destroyed between the swaps.
      var oldView = this._oldView;
      if (!preventDestroy && oldView && !oldView.isDestroyed) {
        if (oldView.destroy) { oldView.destroy(); }
        else if (oldView.remove) { oldView.remove(); }
      }
      delete this._oldView;
      
      this._animatingIn = false;
      this.triggerMethod('animateIn', this.currentView);
      return this;
    },

    // Empty the region, animating the view out first if it needs to be.
    // Ultimately destroys the view.
    empty: function(options) {
      options = options || {};

      var view = this.currentView;
      if (!view || view.isDestroyed){ return; }

      // Animate by default
      var animate = options.animate === undefined ? true : options.animate;

      // Animate the view before destroying it if a function exists. Otherwise,
      // immediately destroy it
      if (animate && _.isFunction(view.animateOut)) {
        this.listenToOnce(this.currentView, 'animateOut', _.bind(this._destroyView, this));
        this.currentView.animateOut();
      } else {
        this._destroyView();
      }
    },

    // An internal method that destroys the view, then removes
    // the reference.
    _destroyView: function() {
      var view = this.currentView;
      if (!view || view.isDestroyed){ return; }

      this.triggerMethod('before:empty', view);

      // call 'destroy' or 'remove', depending on which is found
      if (view.destroy) { view.destroy(); }
      else if (view.remove) { view.remove(); }

      this.triggerMethod('empty', view);

      delete this.currentView;
    },

    // Determine whether view is configured to
    // animate in
    _animateInView: function(view) {
      return !!view.animateIn || !!view.animate || !!view.animateIn;
    },

    // Determine whether view is configured to
    // animate out
    _animateOutView: function(view) {
      return !!view.animateOut || !!view.animate || !!view.animateOut;
    },

    // This is the view that will transition in after
    // the transition out phase. It's cached because
    // the user might trigger the show many times
    // before the transitionIn phase even occurs.
    _setTransitionInCache: function(view, options) {
      this._transitionInView = view;
      this._transitionInOptions = options;
    },

    // Clears the cache for the view that will be
    // transitioned in.
    _clearTransitionInCache: function() {
      delete this._transitionInView;
      delete this._transitionInOptions;
    },

    // This sets the queue. The queue is a single
    // view that is queued to be rendered next. The
    // queue waits for the current transition to
    // finish, and then transitions in the queued view.
    _setQueue: function(view, options) {
      this._queuedView = view;
      this._queueOptions = options;
    },

    // The queue needs to be registered, which
    // sets it up to start a new `show` after the
    // current transition ends. It only registers
    // it once.
    _registerQueue: function() {
      if (this._queued) { return false; }

      this._queued = true;
      this.once('animateIn', _.bind(this._showQueue, this));
    },

    // This shows the queued view, and then clears the queue.
    _showQueue: function() {
      this.show(this._queuedView, this._queuedOptions);
      this._clearQueue();
      this._queued = false;
    },

    // Clears the queue.
    _clearQueue: function() {
      delete this._queuedView;
      delete this._queuedOptions;
    }
  });
