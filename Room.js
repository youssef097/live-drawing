

const Room =  class Room{
    constructor(id,name){
        this.id = id;
        this.name = name;
        this.actions = []     
        this.canvasData = null;   
        this.currentUsers = [];
        this.messages = [];        
    }
    connect(){
        
    }
}
module.exports = Room;