var Level = new function(){
  this.tiles;
  this.levelsXML;
  this.levelsArray;// to be deprecated
  this.currentLevelIdx;
  this.numLevels;
  this.minMoves;
  this.ColourEnum = {
    RED: 0,
    BLUE: 1,
    WHITE: 2,
    GREY: 3
  };
  this.fillStyleMap = [
    "rgb(200,0,0)",
    "rgb(0,0,200)",
    "rgb(255,255,255)",
    "rgb(210,210,210)"
  ];
  this.moveResultEnum = {
    VALID: 0,
    INVALID: 1,
    GAMEOVER: 2
  };
  
  this.initialize = function(){
    this.currentLevelIdx = 0;

    $.ajax({
      url: "./xml/levels.xml",
      dataType: "xml",
      async: false,
      context: this,
      success: 
        function(data){
          this.levelsXML = $(data).find("levels")[0];
          this.numLevels = $(this.levelsXML).find("level").length;
        }
      });
  };

  this.loadNext = function(){
    this.currentLevelIdx++;
    return this.loadLevel();
  }
  
  this.reload = function(){
    return this.loadLevel();
  };
  
  this.loadLevel = function(){
    if (this.currentLevelIdx >= this.numLevels)
      return false;

    // deep copy the array so original is intact (DEPRECATED SOON)
    this.tiles = [];

    // parse this level from xml to 2dim array
    var level = $(this.levelsXML).children("level")[this.currentLevelIdx];
    var self = this;
    $(level)
      .children("rows")
      .children("row")
      .each(function (){
        var rowChars= this.textContent.split("");
        var row = [];
        
        for (var i = 0; i < rowChars.length; i+=2)
          row.push(rowChars[i]);
          
        self.tiles.push(row);
      });
      
    // "pivot" the rows and columns to match XML appearance
    for (var i = 0; i < this.tiles.length; i++)
      for (var j = i; j < this.tiles[i].length; j++){
        var temp = this.tiles[i][j];
        this.tiles[i][j] = this.tiles[j][i];
        this.tiles[j][i] = temp;
      }

    // turn the chars into tile objects  
    for (var i = 0; i < this.tiles.length; i++)
      for (var j = 0; j < this.tiles[i].length; j++)
        this.tiles[i][j] = this.makeTile( i, j, this.tiles[i][j] );

    
    this.minMoves = $(level).attr("minMoves");
    Game.playerPosn.x = $(level).attr("startX");
    Game.playerPosn.y = $(level).attr("startY");
    this.tiles[Game.playerPosn.x][Game.playerPosn.y].hasPlayer = true;
    
    return true;
  };
  
  this.makeTile = function(i,j, inChar){
    var self = this;
    var tile = new Object();
    tile.i = i;
    tile.j = j;
    tile.hasPlayer = false;
    
    switch (inChar){
      case 'R':
        tile.colour = self.ColourEnum.RED;
        tile.canMoveHere = true;
        break;
      case 'B':
        tile.colour = self.ColourEnum.BLUE;
        tile.canMoveHere = true;
        break;
      case ' ':
        tile.colour = self.ColourEnum.WHITE;
        tile.canMoveHere = true;
        break;
      case '#':
        tile.colour = self.ColourEnum.GREY;
        tile.canMoveHere = false;
        break;
    }
    
    tile.buffer = function(canvasBufferContext){ 
      var ctx = canvasBufferContext;
      ctx.fillStyle = self.fillStyleMap[tile.colour];
      ctx.fillRect(tile.i*50+2, tile.j*50+2, 46, 46);
      
      if (tile.hasPlayer){
        ctx.beginPath();
        ctx.arc(tile.i*50+25, tile.j*50+25, 20, 0, Math.PI*2, false); 
        ctx.fillStyle = "rgb(0,255,255)";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
      }
    };
    
    tile.movePlayerHere = function(oldTile){
      var oldPosn = Game.playerPosn;
      var oldTile = self.tiles[oldPosn.x][oldPosn.y];
      
      if (!tile.canMoveHere)
        return self.moveResultEnum.INVALID;
      
      oldTile.hasPlayer = false;
      tile.hasPlayer = true;
      
      switch(tile.colour){
        case self.ColourEnum.BLUE:
          tile.colour = self.ColourEnum.RED;
          break;
        case self.ColourEnum.RED:
          return self.moveResultEnum.GAMEOVER;
          break;
      }
      
      return self.moveResultEnum.VALID;

    };
    
    return tile;
  };
  
  this.buffer = function(canvasBufferContext){
    for (var i = 0; i < this.tiles.length; i++)
      for (var j = 0; j < this.tiles[i].length; j++)
        this.tiles[i][j].buffer(canvasBufferContext);
  }
  
  this.isComplete = function(){
    for (var i = 0; i < this.tiles.length; i++)
      for (var j = 0; j < this.tiles[i].length; j++)
        if (this.tiles[i][j].colour == this.ColourEnum.BLUE)
          return false;
          
    return true;
  };
};