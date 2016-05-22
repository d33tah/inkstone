// Simple helpers for interacting with reactive variables.
import {Settings} from '../model/settings';
import {Timing} from '../model/timing';

ReactiveVar.prototype.pop = function() {
  const value = this.get();
  value.pop();
  this.set(value);
}

ReactiveVar.prototype.push = function(element) {
  const value = this.get();
  value.push(element);
  this.set(value);
}

// Set up the routing table and transitioner.

Router.configure({layoutTemplate: 'layout'});
Router.route('index', {path: '/'});
Router.route('teach', {onStop() { Timing.shuffle(); }});
['help', 'lists', 'settings'].map((x) => Router.route(x));

Transitioner.default({in: 'transition.fadeIn', out: 'transition.fadeOut'});

// Set up global template helpers.

Platform.isAndroid = () => false;
Platform.isIOS = () => true;

Template.layout.helpers({
  theme: () => Settings.get('settings.paper_filter') ?
      'textured' : 'painterly',
});
