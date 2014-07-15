import Ember from 'ember';

export default Ember.ContainerView.extend({
  classNames: ['crossfade-video'],
  init: function(){
    this._super();
    var playerFactory = this.container.lookupFactory('component:youtube-player');
    var video1 = playerFactory.create({ended: 'setNextVideo'});
    var video2 = playerFactory.create({ended: 'setNextVideo'});
    this.addObjects([video1, video2]);
    this.set('_activeVideoView', video1);
  },

  currentVideo: null,

  _activeVideoView: null,
  _inactiveVideoView: function(){
    var _activeVideoView = this.get('_activeVideoView'),
        activeIndex = this.indexOf(_activeVideoView),
        inactiveIndex = activeIndex === 0 ? 1 : 0;
    return this.objectAt(inactiveIndex);
  }.property('_activeVideoView'),

  insertNewVideo: function(video){
    this.set('controller.isLoading', true);
    var self = this;
    var nextVideoView = this.get('_inactiveVideoView');
    var loadingPromise = nextVideoView.loadVideo(video);

    loadingPromise.then(function(){
      self.set('_activeVideoView', nextVideoView);
      self.get('_inactiveVideoView').unloadVideo();
      self.set('controller.isLoading', false);
    });

    return loadingPromise;
  },

  currentVideoDidChange: function(){
    var currentVideo = this.get('currentVideo');
    this.insertNewVideo(currentVideo);
  }.observes('currentVideo').on('didInsertElement')
});
