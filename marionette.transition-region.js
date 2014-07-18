(function() {
  Marionette.TransitionRegion = Marionette.Region.extend({
    transitionInCss: {
      opacity: 0
    },

    show: function(view, options) {
      this._ensureElement();

      var currentView = this.currentView;

      // If the view has an animate out function, then wait for it to conclude and then continue.
      // Otherwise, simply continue.
      if (this.currentView && _.isFunction(this.currentView.animateOut)) {
        this.listenToOnce(this.currentView, 'animateOut', _.bind(this._onTransitionOut, this, view, options));
        this.currentView.animateOut();
        // Return this for backwards compat
        return this;
      }
      else {
        return this._onTransitionOut(view, options);
      }
    },

    // This is most of the original show function.
    _onTransitionOut: function(view, options) {
      this.triggerMethod('animateOut', this.currentView);

      var showOptions = options || {};
      var isDifferentView = view !== this.currentView;
      var preventDestroy =  !!showOptions.preventDestroy;
      var forceShow = !!showOptions.forceShow;

      // we are only changing the view if there is a view to change to begin with
      var isChangingView = !!this.currentView;

      // The region is only animating if there's an animateIn method on the new view
      var animatingIn = _.isFunction(view.animateIn);

      // only destroy the view if we don't want to preventDestroy and the view is different
      var _shouldDestroyView = !preventDestroy && isDifferentView;

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
      this.triggerMethod("before:show", view);
      if (_.isFunction(view.triggerMethod)) {
        view.triggerMethod("before:show");
      } else {
        this.triggerMethod.call(view, "before:show");
      }

      // Only hide the view if we want to animate it
      if (animatingIn) {
        view.$el.css(this.transitionInCss);
      }

      // Attach the view's Html to the region's el
      if (isDifferentView || isViewDestroyed) {
        this.attachHtml(view);
      }

      this.currentView = view;

      // show triggerMethods
      this.triggerMethod("show", view);
      if (_.isFunction(view.triggerMethod)) {
        view.triggerMethod("show");
      } else {
        this.triggerMethod.call(view, "show");
      }

      // If there's an animateIn method, then call it and wait for it to complete
      if (animatingIn) {
        this.listenToOnce(view, 'animateIn', _.bind(this._onTransitionIn, this));
        view.animateIn();
        return this;
      }

      // Otherwise, continue on
      else {
        return this._onTransitionIn();
      }
    },

    // After it's shown, then we triggerMethod 'animateIn'
    _onTransitionIn: function() {
      this.triggerMethod('animateIn', this.currentView);
      return this;
    },

    // Empty the region, animating the view out first if it needs to be
    empty: function(options) {
      options = options || {};

      var view = this.currentView;
      if (!view || view.isDestroyed){ return; }

      // Animate by default
      var animate = options.animate === undefined ? true : options.animate;

      // Animate the view before destroying it if a function exists. Otherwise,
      // immediately destroy it
      if (_.isFunction(view.animateOut) && animate) {
        this.listenToOnce(this.currentView, 'animateOut', _.bind(this._destroyView, this));
        this.currentView.animateOut();
      } else {
        this._destroyView();
      }
    },

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
  });
})();
