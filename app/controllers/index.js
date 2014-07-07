import Ember from 'ember';

export default Ember.ArrayController.extend({
  activeVideo: function(){
    return this.get('firstObject');
  }.property('@this.firstObject'),
  actions: {
    setNextVideo: function(){
      var activeVideo = this.get('activeVideo');
      var currentIndex = this.indexOf(activeVideo);
      var nextVideo = this.objectAt(currentIndex + 1) || this.objectAt(0);
      this.set('activeVideo', nextVideo);
    }
  }
});
