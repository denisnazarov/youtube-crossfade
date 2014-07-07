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
  classNames: ['youtube-player'],

  videoId: null, //set in template
  videoStart: null,
  videoEnd: null,

  currentTime: null,

  startEndPoll: function(){
    var self = this;
    var player = this.get('player');

    this._intervalId = window.setInterval(function(){
      self.set('currentTime', player.getCurrentTime());
    }, 100);
  },

  stopEndPoll: function(){
    window.clearInterval(this._intervalId);
  },

  currentTimeObserver: function(){
    var currentTime = this.get('currentTime');
    var videoEnd = this.get('videoEnd');

    if (currentTime > videoEnd){
      this.videoEnded();
    }
  }.observes('currentTime'),

  setupYouTubeApi: function(){
    var self = this;
    var elementId = this.get('elementId');
    var videoStart = this.get('videoStart');
    var YT = window.YT;

    playerVars.start = videoStart;

    new YT.Player(elementId, {
      playerVars: playerVars,
      events: {
        onReady: function(event){
          var player = event.target;
          player.mute();
          Ember.run(function(){
            self.set('player', player);
            self.changeVideoToCurrent();
          });
        },
        onStateChange: function(e){
          var ENDED = YT.PlayerState.ENDED,
              PLAYING = YT.PlayerState.PLAYING,
              PAUSED = YT.PlayerState.PAUSED,
              state = e.data;

          if (state === ENDED){
            Ember.run(self, 'videoEnded');
          }
        }
      }
    });
  },

  changeVideoToCurrent: function(){
    this.startEndPoll();
    this.get('player').loadVideoById({
      videoId: this.get('videoId'),
      startSeconds: this.get('videoStart')
    });
  }.observes('videoId'),

  videoEnded: function(){
    this.stopEndPoll();
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
  }
});
