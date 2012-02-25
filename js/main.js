var include = function(path){ document.write('<script type="text/javascript" src="'+path+'"></script>'); };
include("js/game.js");
include("js/level.js");

$(document).ready(function() {
  Level.initialize();
  Game.initialize();
});



