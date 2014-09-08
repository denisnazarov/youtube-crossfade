import Ember from 'ember';

var playerVars = {
  html5: 1,
  controls: 0,
  disablekb: 1,
  iv_load_policy: 3,
  rel: 0,
  showinfo: 0,
  modestbranding: 1,
  playsinline: 1
};

export default Ember.Component.extend({
  setupDeferred: function(){
    this._playerDeferred = Ember.RSVP.defer();
    this._playerLoaded = this._playerDeferred.promise;
    this._super();
  }.on('init'),

  classNames: ['youtube-player'],

  videoId: null, //set in template
  videoStart: null,
  videoEnd: null,

  currentTime: null,

  startEndPoll: function(){
    var self = this;
    var player = this.get('player');

    this._intervalId = window.setInterval(function(){
      Ember.run(self, function(){
        this.set('currentTime', player.getCurrentTime());
      });
    }, 100);
  },

  stopEndPoll: function(){
    window.clearInterval(this._intervalId);
  },

  currentTimeObserver: function(){
    var currentTime = this.get('currentTime');
    var videoStart = this.get('videoStart');
    var videoEnd = this.get('videoEnd');
    var player = this.get('player');

    if (currentTime > videoEnd){
      player.seekTo(videoStart);
      if (!this.get('hasEnded')){
        this.videoEnded();
      }
      this.set('hasEnded', true);
    }
  }.observes('currentTime'),

  setupYouTubeApi: function(){
    var self = this;
    var elementId = this.get('elementId');
    var YT = window.YT;

    function readyHandler(event){
      var player = event.target;
      player.mute();
      Ember.run(self, function(){
        this._playerDeferred.resolve();
        this.set('player', player);
        this.changeVideoToCurrent();
      });
    }

    function stateChangeHandler(event){
      var PLAYING = YT.PlayerState.PLAYING,
          state = event.data;

      if (state === PLAYING){
        Ember.run(self, function(){
          this._loadingDeferred.resolve();
        });
      }
    }

    var options = {
      playerVars: playerVars,
      events: {
        onReady: readyHandler,
        onStateChange: stateChangeHandler
      }
    };

    new YT.Player(elementId, options);
  },

  changeVideoToCurrent: function(){
    this.startEndPoll();
    this.get('player').loadVideoById({
      videoId: this.get('videoId'),
      startSeconds: this.get('videoStart')
    });
  }.observes('videoId'),

  videoEnded: function(){
    //this.stopEndPoll();
    this.sendAction('ended');
  },

  didInsertElement: function(){
    var self = this;

    this.get('ytApiPromise').then(function(){
      self.setupYouTubeApi();
    });
  },
  willDestroyElement: function(){
    this.stopEndPoll();
  },
  loadVideo: function(video){
    var self = this;
    this._playerLoaded.then(function(){
      self.set('hasEnded', false);
      self.setProperties({
        videoStart: video.startTime,
        videoEnd: video.endTime,
        videoId: video.videoId
      });
    });
    this._loadingDeferred = Ember.RSVP.defer();
    this._loadingDeferred.promise.then(function(){
      self.$().css('opacity', 1);
    });
    return this._loadingDeferred.promise;
  },
  unloadVideo: function(){
    this.$().css('opacity', 0);
  }
});
