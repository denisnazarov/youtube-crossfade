import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Route.extend({
  model: function(){
    var playlistURL = "http://gdata.youtube.com/feeds/api/playlists/PLArvEia7B_Fyn_GeKqv4s1iBwuYL1Mem-?v=2&alt=json&start-index=60&max-results=50";
    return ajax(playlistURL).then(function(data){
      return data.feed.entry.map(function(entry){
        var aspectRatio = entry.media$group.yt$aspectRatio && entry.media$group.yt$aspectRatio.$t || 'fullscreen';
        var duration = entry.media$group.yt$duration.seconds;
        var videoID = entry.media$group.yt$videoid.$t;
        return {
          aspectRatio: aspectRatio,
          videoId: videoID,
          startTime: 0,
          endTime: 15
        };
      });
    });
  }
});
