import Ember from 'ember';

export default {
  name: 'youtube',
  initialize: function(container, application){
    var ytPromise = new Ember.RSVP.Promise(function(resolve){
      window.onYouTubeIframeAPIReady = function(){
        Ember.run(null, resolve);
      };
    });

    Ember.$.getScript('https://www.youtube.com/iframe_api');

    application.register('promise:youtube', ytPromise, {instantiate: false});
    container.injection('component:youtube-player', 'ytApiPromise', 'promise:youtube');
  }
};
