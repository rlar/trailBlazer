var Game = new function(){
  this.canvas;
  this.canvasContext;
  this.canvasBuffer;
  this.canvasBufferContext;
  this.playerPosn;
  this.moveCount;
  
  this.initialize = function(){
  
    this.loadCanvases();
    if (!this.canvasBufferContext)
      return;

    var self = this;
    var keyupHandler = function (event) {
      self.doMove(event);
      self.draw();
      self.checkVictory();
    };
    $(document).bind('keyup', keyupHandler);
    
    this.playerPosn = {x: 0, y: 0};
    this.moveCount = 0;
    Level.loadLevel();
    this.draw();
  };
  
  this.loadCanvases = function(){
    this.canvas = document.getElementById('canvas');
    
    if (this.canvas && this.canvas.getContext) {
      this.canvasContext = this.canvas.getContext('2d');
      this.canvasBuffer = document.createElement('canvas');
      this.canvasBuffer.width = this.canvas.width;
      this.canvasBuffer.height = this.canvas.height;
      this.canvasBufferContext = this.canvasBuffer.getContext('2d');
    }
  };
  
  this.doMove = function(event){
    var KeyID = event.keyCode;
    var newPosn = {x: this.playerPosn.x, y: this.playerPosn.y};
    
    switch (KeyID) {
      case 87: // W
      case 38: // up
        newPosn.y--;
        break;

      case 65: // A
      case 37: // left
        newPosn.x--;
        break;

      case 68: // D
      case 39: // down
        newPosn.x++;
        break;

      case 83: // S
      case 40: // right
        newPosn.y++;
        break;
    }
    
    if (Level.tiles[newPosn.x] &&  Level.tiles[newPosn.x][newPosn.y]){
      var result = Level.tiles[newPosn.x][newPosn.y].movePlayerHere();
      switch (result){
        case Level.moveResultEnum.VALID:
          this.playerPosn = newPosn;
          this.moveCount++;
          break;
          
        case Level.moveResultEnum.INVALID:
          break;
          
        case Level.moveResultEnum.GAMEOVER:
          this.retryLevel();
          break;
      }
    }
  };

  this.draw = function(){
    Level.buffer(this.canvasBufferContext);
        
    this.canvasContext.drawImage(this.canvasBuffer, 0, 0);
  };
  
  this.checkVictory = function(){
    if (Level.isComplete()){
      alert("Level complete! It only took " + this.moveCount + " moves!");
      var newLevelLoaded = Level.loadNext();
      
      if ( newLevelLoaded ){
        this.moveCount = 0;
        this.draw();
        }
      else{
        alert("You've beaten all the levels! :O:O");
        this.clearCanvas();
      }
    }
  };
  
  this.retryLevel = function(){
    this.draw(); // show the user where they stepped
    alert("You stepped on a red tile! D:\nTry again!");
    Level.reload();
  }
  
  this.clearCanvas = function(){
    this.canvas.width = this.canvas.width;
    $(document).unbind('keyup');
  };
};