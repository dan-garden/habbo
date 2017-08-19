/**
 * Created by Daniel on 22/07/2017.
 */
class Habbo{
    constructor(user_data){
        Habbo.Preload(user_data);
    }


    static Preload(user_data){
        Habbo.prototype.api = new Habbo.prototype._API();
        Habbo.prototype._canv = Habbo.API.Client.Canvas;
        this._r = (Habbo.API.User.Preload(user_data, function(ud){
            Habbo.prototype._me = ud;
        }.bind(this)));
        delete this._r;






        Habbo.Canvas.background(0);


        Habbo.API.Binds();


    }



    static get Canvas(){
        return Habbo.prototype._canv;
    }

    static get User(){
        return Habbo.prototype._me;
    }


    static get API(){
        return Habbo.prototype.api;
    }
}
Habbo.prototype._API = function(){

    this.loadedFurni = {};

    this.assetsDir = "assets/furni/";

    this.Settings = {
        DraggingAllowed: true,
        ScalingAllowed: false,

        isMobile: ez.isMobile(),
        Scaled: false,
        ClientScale: 1,
        DragSpeed: 0.02,


        FurniLimit: 100000
    };


    if(this.Settings.isMobile){
        this.Settings.DragSpeed = 0.005;
    }


    this.clicks = 0;
    this.currentRoom = false;
};
Habbo.prototype._API.prototype.Binds = function(){
    document.ontouchmove = function(event){
        event.preventDefault();
    };


    Habbo.Canvas.clear();



    Habbo.API.Client.drag = {start: new Vector(), finish: new Vector()};


    Habbo.API.Client.Dragging = false;

    Habbo.API.Settings.mouseDownEvent = "mousedown";
    Habbo.API.Settings.mouseUpEvent = "mouseup";
    Habbo.API.Settings.mouseMoveEvent = "mousemove";
    Habbo.API.Settings.doubleClickEvent = "dblclick";
    if(Habbo.API.Settings.isMobile){
        Habbo.API.Settings.mouseDownEvent = "touchstart";
        Habbo.API.Settings.mouseUpEvent = "touchend";
        Habbo.API.Settings.mouseMoveEvent = "touchmove";
        Habbo.API.Settings.doubleClickEvent = "dblclick";
    }



    Habbo.Canvas.bindEvent(Habbo.API.Settings.mouseDownEvent, function(x, y){
        if(Habbo.API.Client.hover && (Habbo.API.Client.hover.tile || Habbo.API.Client.hover.furni)){
            Habbo.API.Client.Dragging = false;
        } else{
            if(Habbo.API.Settings.DraggingAllowed){
                Habbo.API.Client.Dragging = true;
                    Habbo.API.Client.drag.start.x = x;
                    Habbo.API.Client.drag.start.y = y;
            }
        }
    });
    Habbo.Canvas.bindEvent(Habbo.API.Settings.mouseUpEvent, function(x, y){

        Habbo.API.fn.clickAction(x, y);

        Habbo.API.Client.drag.finish.x = x;
        Habbo.API.Client.drag.finish.y = y;
        Habbo.API.Client.Dragging = false;


    });
    // Habbo.Canvas.bindEvent(Habbo.API.Settings.doubleClickEvent, function(x, y){
    //     Habbo.API.currentRoom.x = (Habbo.Canvas.width/2) - (Habbo.API.currentRoom.totalwidth/2);
    //     Habbo.API.currentRoom.y = (Habbo.Canvas.height/2)
    // });
    Habbo.Canvas.bindEvent("wheel", function(w){
        if(Habbo.API.Settings.ScalingAllowed){
            Habbo.API.Client.Zoom( 1 / (1 - ((w / 60) * 0.1)) );
        }
    });
    Habbo.Canvas.bindEvent(Habbo.API.Settings.mouseMoveEvent, function(x, y){

        if(Habbo.API.currentRoom){

            if(Habbo.API.Client.hover && (Habbo.API.Client.hover.tile || Habbo.API.Client.hover.furni)){
                Habbo.API.Client.Dragging = false;
            }

            Habbo.API.Client.pos.x = x;
            Habbo.API.Client.pos.y = y;
            Habbo.API.currentRoom.mouse = Habbo.API.Client.pos;
            if(x!==Habbo.API.Client.drag.finish.x && y!==Habbo.API.Client.drag.finish.y){
                Habbo.API.Client.drag.finish.x = x;
                Habbo.API.Client.drag.finish.y = y;

            }



        }

    });





    Habbo.Canvas.bindLoop(function(){
        // if(Habbo.API.currentRoom){
        //     if(Habbo.Canvas.frame % 10 === 0){
        //         for(let i = 0; i < Habbo.API.currentRoom.tiles.length; i++){
        //             Habbo.API.currentRoom.tiles[i].val.color.randomize();
        //         }
        //     }
        // }

        Habbo.API.Client.Render();
    }, 1);
};
Habbo.prototype._API.prototype.fn = {

    loadingBox: new Img("assets/furni/loading/ph_box.png", null, null, function(){

    }),

    loadFurni: function(x){
        if(x.length > 0){
            for(let i = 0; i < x.length; i++){
                let obj = x[i];
                if(!Habbo.API.loadedFurni[obj.label_id]){
                    Habbo.API.loadedFurni[obj.label_id] = new Habbo.API.Furni(obj);
                    Habbo.API.loadedFurni[obj.label_id].loadAssets(function(){

                    });
                }
            }
            return this;
        }
        return false;
    },



    furniAsset: function(x){
        return Habbo.API.loadedFurni[x];
    },

    clickAction: function(x, y){
        if(Habbo.API.Client.hover.tile){
                let tx = Habbo.API.Client.hover.tile.truex;
                let ty = Habbo.API.Client.hover.tile.truey;

                Habbo.API.fn.placeFurni(gb, tx,ty);
        }
        if(Habbo.API.Client.hover.furni){
            let furni = Habbo.API.Client.hover.furni;
            console.log(furni);
        }
    },

    enterRoom: function(room){
        Habbo.API.currentRoom = room || new Habbo.API.Room();
        this.loadRoom();
    },

    leaveRoom: function(){
        Habbo.API.currentRoom = false;
    },

    loadRoom: function(){

        let room = Habbo.API.currentRoom;

        Habbo.Canvas.add(
            room,
            (Habbo.Canvas.width/2) - (room.totalwidth/2),
            (Habbo.Canvas.height/2)
        );

        Habbo.API.Client.pos = new Vector(room.x, room.y);

    },

    placeFurni(furni, x, y){
        const a = Habbo.API.currentRoom.furnis.length < Habbo.API.Settings.FurniLimit;
        if(a){
            x = x || 0;
            y = y || 0;
            let f = furni.clone();
            let t = Habbo.API.currentRoom.tile(x, y);
            f.pos = new Vector(x, y);

            Habbo.API.currentRoom.furnis.push(f);
            return f;
        } else{
            return false;
        }

    }
};
Habbo.prototype._API.prototype.Assets = class{
    constructor(){

    }
};
Habbo.prototype._API.prototype.Client = class{
    constructor(){

    }


    static get Canvas(){
        if(Habbo.API.Settings.isMobile){
            return new Canvas("habbo-client", window.innerWidth, window.innerHeight);
        } else{
            return new Canvas("habbo-client", window.innerWidth - 4, window.innerHeight - 4);
        }
    }


    static Zoom(x){
        Habbo.API.Settings.ClientScale = x;
        Habbo.API.Settings.Scaled = false;
    }


    static Render(){
        Habbo.Canvas.clear();

        if(Habbo.API.currentRoom){

            if(Habbo.API.Settings.Scaled === false){
                Habbo.Canvas.scale(Habbo.API.Settings.ClientScale);
                Habbo.API.Settings.Scaled = true;
            }



            const room = Habbo.API.currentRoom;
            const drag = Habbo.API.Client.drag;

            if(    (Habbo.API.Client.Dragging && Habbo.Canvas.frame % 1 === 0)     ) {

                let xdiff = (drag.start.x - drag.finish.x);
                let ydiff = (drag.start.y - drag.finish.y);



                let xpos = (room.x - xdiff*Habbo.API.Settings.DragSpeed);
                let ypos = (room.y - ydiff*Habbo.API.Settings.DragSpeed);

                Habbo.Canvas.add(room,xpos,ypos);
                Habbo.API.Client.olddrag = Habbo.API.Client.pos;
            } else{
                Habbo.Canvas.add(room, room.x, room.y);
            }



        }
    }
};
Habbo.prototype._API.prototype.Furni = class extends Shape{
    constructor(obj) {
        super();

        delete this.color;
        delete this.stroke;


        obj = obj || {};

        this.label_id = obj.label_id || null;
        this.parts = obj.parts || null;
        this.states = obj.states || null;
        this.rotation = "north";

        this.width = 64;
        this.height = 32;

        this.stackHeight = obj.stackHeight || 10;

        this.owner = false;
        this.allow_inventory_stack = true;
        this.allow_gift = true;
        this.allow_trade = true;

        this.offset = new Vector();
        this.mouse = new Vector();

    }


    loadAssets(fn){
        let d = Habbo.API.assetsDir+this.label_id;
        let a = {};

        for(let i = 0; i < this.parts.length; i++){
            let p = this.parts[i];
            a[p] = new Img(d+"/"+p+".png", null, null, function(){
                if(typeof fn==="function" && (this.parts.length-1===i)){
                    fn(this);
                }
            }.bind(this));
        }


        this.assets = a;
        return this.assets;
    }



    clone(){
        const clone = new Habbo.API.Furni();
        const keys  = Object.keys(this);

        for(let i = 0; i < keys.length; i++){
            let key = keys[i];
            clone[key] = this[key];
        }




        return clone;
    }

    mouseOver(x, y){
        this.mouse.x = x;
        this.mouse.y = y;
    }

    readPixels() {

        return {
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.width,
            h: this.height
        };
    }
    rotate(n){
        if(n===undefined){n=1;}
        if(n < 1){
            return this;
        }

        if(this.rotation === "north"){
            this.rotation = "east";
            return this.rotate(n-1);
        }
        if(this.rotation === "east"){
            this.rotation = "south";
            return this.rotate(n-1);
        }
        if(this.rotation === "south"){
            this.rotation = "west";
            return this.rotate(n-1);
        }
        if(this.rotation === "west"){
            this.rotation = "north";
            return this.rotate(n-1);
        }
    }


    translateRotation(ctx, asset, x, y, a, b){
        const rx = x + this.offset.x;
        const ry = y + this.offset.y;
        if(ctx){
            ctx.translate(rx,ry);
            ctx.scale(a, b);
            Habbo.Canvas.add(asset, 0, 0);
            this.hasMouse = ctx.isPointInPath(this.mouse.x, this.mouse.y);
            ctx.setTransform(1,0,0,1,0,0);
        } else{
            Habbo.Canvas.add(asset, rx, ry);
        }
    }

    renderRotation(ctx){


        let r = this.states.rotations[this.rotation];
        for(let i = 0; i < r.length; i++){
            let p = r[i];
            let pr = p[0].split("-");
            let al = p[3];
            if(al===undefined){al=1;}
            if(pr[0]==="shadow"){al=0.2;}

            let s = pr[1];
            let a = this.assets[pr[0]];

            ctx.save();
            ctx.globalAlpha = al;


            if(s===undefined){
                this.translateRotation(false, a, (this.x)+p[1], (this.y)+p[2])
            } else if(s==="x"){
                this.translateRotation(ctx, a, (this.x+a.width)+p[1], (this.y)+p[2], -1, 1);
            } else if(s==="y"){
                this.translateRotation(ctx, a, (this.x)+p[1], (this.y+a.height)+p[2], 1, -1);
            } else if(s==="xy"){
                this.translateRotation(ctx, a, (this.x+a.width)+p[1], (this.y)+p[2], -1, -1);
            }

            ctx.restore();

        }


    }

    render(ctx){

        ctx.beginPath();



        this.renderRotation(ctx);




        ctx.closePath();

    }
};
Habbo.prototype._API.prototype.User = class{
    constructor(user_data){
        this.id = user_data.id;
        this.user = user_data.user;
        this.inventory = {furni: []};
    }
    static Preload(user_data, fn){
        if(typeof fn==="function"){
            let u = new Habbo.API.User(user_data);
            fn(u);
        }
    }
};
Habbo.prototype._API.prototype.RoomTile = class extends Shape{
    constructor() {
        super();
        this.void = false;
        this.width = 64;
        this.height = 32;
        this.color = new Color(152, 152, 101);
        this.stroke = new Color(142, 142, 94);
        this.layers = 1;
        this.mouse = new Vector();
    }
    readPixels() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.width,
            h: this.height
        };
    }
    mouseOver(x, y){
        this.mouse.x = x;
        this.mouse.y = y;
    }
    sub_render(ctx){
        ctx.closePath();
        if(this.stroke){
            ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
            ctx.stroke();
        }
        if(this.color){
            ctx.fillStyle = "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + (this.color.a / 255) + ")";
            ctx.fill();

        }
    }
    render(ctx){
        if(!this.void){

            const lines = [
            [32, 0],
            [64, 16],
            [32, 32],
            [0, 16]
        ];

        ctx.beginPath();
        ctx.moveTo(this.x + lines[0][0], this.y + lines[0][1]);

        for(let i = 0; i < lines.length; i++){
            let ps = lines[i];
            ctx.lineTo(this.x + ps[0], this.y + ps[1]);
        }

            if(ctx.isPointInPath(this.mouse.x, this.mouse.y)){
                this.stroke = new Color(255, 255, 255);
                ctx.lineWidth=5;
                this.hasMouse = true;
                this.sub_render(ctx, 1);
            } else{
                this.stroke = new Color(142, 142, 94);
                ctx.lineWidth=1;
                this.hasMouse = false;
                this.sub_render(ctx, 0);
            }


        }
    }
};
Habbo.prototype._API.prototype.RoomWall = class extends Shape{
    constructor(tiles, w, h) {
        super();
        this.void = false;
        this.color = new Color(152, 152, 101);
        this.stroke = new Color(142, 142, 94);
        this.mouse = new Vector();
git

        this.points = [];

    }
    readPixels() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
        };
    }
    mouseOver(x, y){
        this.mouse.x = x;
        this.mouse.y = y;
    }
    sub_render(ctx){
        ctx.closePath();
        if(this.stroke){
            ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
            ctx.stroke();
        }
        if(this.color){
            ctx.fillStyle = "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + (this.color.a / 255) + ")";
            ctx.fill();

        }
    }
    render(ctx){
        if(!this.void){

            const lines = [
            [32, 0],
            [64, 16],
            [32, 32],
            [0, 16]
        ];

        ctx.beginPath();
        ctx.moveTo(this.x + lines[0][0], this.y + lines[0][1]);

        for(let i = 0; i < lines.length; i++){
            let ps = lines[i];
            ctx.lineTo(this.x + ps[0], this.y + ps[1]);
        }

            if(ctx.isPointInPath(this.mouse.x, this.mouse.y)){
                this.stroke = new Color(255, 255, 255);
                ctx.lineWidth=5;
                this.hasMouse = true;
                this.sub_render(ctx, 1);
            } else{
                this.stroke = new Color(142, 142, 94);
                ctx.lineWidth=1;
                this.hasMouse = false;
                this.sub_render(ctx, 0);
            }


        }
    }
};
Habbo.prototype._API.prototype.Room = class extends Shape{
    constructor(dimension) {
        super();
        this.width = 2;
        this.height = 2;
        this.twidth = 64;
        this.theight = 32;

        this.totalwidth = this.width * this.twidth;
        this.totalheight = this.height * this.theight;

        this.floorheight = 10;
        this.camera = new Vector(0, 0);

        this.dimension = this.buildDimension(this.width, this.height);

        this.furnis = [];


        this.mouse = new Vector();
    }
    buildDimension(w, h){
        let string = "";
        string += w+","+h+"&";
        for(let x = 0; x < w; x++){
            for(let y = 0; y < h; y++){
                let posx = (x * this.twidth/2) + (y * this.twidth/2);
                let posy = (x * this.theight/2) + (y * -this.theight/2);
                string += posx+","+posy+":";
            }
            string += ";";
        }
        return string;
    }
    dimensions(){
        let r = [];

        let s = this.dimension.split("&");

        let size = s[0].split(",");
        this.width = parseInt(size[0]);
        this.height = parseInt(size[1]);


        this.totalwidth = this.width * this.twidth;
        this.totalheight = this.height * this.theight;


        let a = s[1].split(";");
        a.pop();
        for(let y = 0; y < a.length; y++){
            r[y] = [];
            let b = a[y].split(":");
            b.pop();
            for(let x = 0; x < b.length; x++){
                let c = b[x].split(",");
                let posx = parseInt(c[0]);
                let posy = parseInt(c[1]);
                let p = new Vector(posx,posy);
                r[y].push(p);
            }
        }

        return r;
    }
    calc(w,h,x,y){
        this.x = x;
        this.y = y;

        this.totalwidth = this.width * this.twidth;
        this.totalheight = this.height * this.theight;
    }
    tile(x, y){
        let ret = false;
        if(this.tiles){
            for(let i = 0; i < this.tiles.length; i++){
                let t = this.tiles[i];

                if(t.truex===x && t.truey===y){
                    ret = t;
                }
            }
        }
        return ret;
    }
    furni(t, x, y){
        let fs = [];
        if(t==="floor"){
            for(let i = 0; i < this.furnis.length; i++){
                let f = this.furnis[i];
                if(f.pos.x===x && f.pos.y===y){
                    fs.push(f);
                }
            }
        }
        if(t==="wall"){
            for(let i = 0; i < this.furnis.length; i++){
                let f = this.furnis[i];

                if(f.posType==="wall"){
                    fs.push(f);
                }
            }
        }

        return fs;

    }

    renderFloor(d, fh){
        if(!this.tiles){
            this.tiles = [];
            for(let x = 0; x < d.length; x++){
                let a = d[x];
                for(let y = 0; y < a.length; y++){
                    let b = a[y];
                    let tile = new Habbo.API.RoomTile();


                    let o = new Vector(b.x, b.y);
                    o.val = tile;

                    o.truex = x;
                    o.truey = y;

                    this.tiles.push(o);
                }
            }
        } else{
            Habbo.API.Client.hover = {tile: false, furni: false};

            for(let i = 0; i < this.tiles.length; i++){
                let tile = this.tiles[i];

                tile.val.mouseOver(this.mouse.x, this.mouse.y);


                if(tile.val.hasMouse){
                    Habbo.API.Client.hover.tile = tile;
                }



                for(let layer = 0; layer < tile.val.layers; layer++){
                    Habbo.Canvas.add(tile.val, tile.x + this.x, tile.y + this.y - layer);
                }

            }


            if(Habbo.API.Client.hover.tile){
                let o = Habbo.API.Client.hover.tile;
                if(o.val.layers > 0){
                    Habbo.Canvas.add(o.val, o.x + this.x, o.y + this.y);
                }
            }


            for(let y = this.height - 1; y >=0; y--) {
                for (let x = 0; x < this.width; x++) {
                    let fs = this.furni("floor",x, y);
                    let tile = this.tile(x,y);

                    if(fs.length > 0) {
                        let stackHeight = 0;
                        for (let j = 0; j < fs.length; j++) {
                            let f = fs[j];

                            f.mouseOver(this.mouse.x, this.mouse.y);

                            if (f.hasMouse) {
                                Habbo.API.Client.hover.furni = f;
                                console.log(f);
                            }

                            Habbo.Canvas.add(f, tile.val.x + 1, tile.val.y - f.height + tile.val.height - (stackHeight));

                            stackHeight += f.stackHeight;

                        }
                    }
                }


            }
        }
    }
    renderWall(d,fh){
        if(!this.wall){

            let tilewalls;

            this.wall = new Habbo.API.RoomWall(this.tiles);


        } else{
            //Habbo.API.Client.hover = {tile: false, furni: false};



            for(let i = 0; i < this.tiles.length; i++){
                let tile = this.tiles[i];

                tile.val.mouseOver(this.mouse.x, this.mouse.y);


                if(tile.val.hasMouse){
                    Habbo.API.Client.hover.tile = tile;
                }



                for(let layer = 0; layer < tile.val.layers; layer++){
                    Habbo.Canvas.add(tile.val, tile.x + this.x, tile.y + this.y - layer);
                }

            }



        }
    }

    readPixels() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }
    render(ctx){
        const d = this.dimensions();
        const fh = this.floorheight;
        this.renderFloor(d, fh);
        //this.renderWall(d, fh);

    }
};