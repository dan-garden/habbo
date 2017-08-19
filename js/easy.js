/**
 * Created by Daniel on 27/06/2017.
 */
let EasyID=-1;
let PERLIN_YWRAPB = 4;
let PERLIN_YWRAP = 1<<PERLIN_YWRAPB;
let PERLIN_ZWRAPB = 8;
let PERLIN_ZWRAP = 1<<PERLIN_ZWRAPB;
let PERLIN_SIZE = 4095;

let perlin_octaves = 4; // default to medium smooth
let perlin_amp_falloff = 0.5; // 50% reduction/octave

let scaled_cosine = function(i) {
    return 0.5*(1.0-Math.cos(i*Math.PI));
};

let perlin;


window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

Easy = class {
    constructor(){
        EasyID++;

    }
    random(min, max) {
        if(min===undefined){
            min=0;
        }
        if(max===undefined){
            max=min;
            min=0;
        }
        return Math.random() * (max - min + 1);
    }
    noise(x,y,z){
        y = y || 0;
        z = z || 0;


        if (perlin === undefined) {
            perlin = new Array(PERLIN_SIZE + 1);
            for (let i = 0; i < PERLIN_SIZE + 1; i++) {
                perlin[i] = Math.random();
            }
        }

        if (x<0) { x=-x; }
        if (y<0) { y=-y; }
        if (z<0) { z=-z; }

        let xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
        let xf = x - xi;
        let yf = y - yi;
        let zf = z - zi;
        let rxf, ryf;

        let r=0;
        let ampl=0.5;

        let n1,n2,n3;

        for (let o=0; o<perlin_octaves; o++) {
            let of=xi+(yi<<PERLIN_YWRAPB)+(zi<<PERLIN_ZWRAPB);

            rxf = scaled_cosine(xf);
            ryf = scaled_cosine(yf);
            n1  = perlin[of&PERLIN_SIZE];
            n1 += rxf*(perlin[(of+1)&PERLIN_SIZE]-n1);
            n2  = perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
            n2 += rxf*(perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n2);
            n1 += ryf*(n2-n1);

            of += PERLIN_ZWRAP;
            n2  = perlin[of&PERLIN_SIZE];
            n2 += rxf*(perlin[(of+1)&PERLIN_SIZE]-n2);
            n3  = perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
            n3 += rxf*(perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n3);
            n2 += ryf*(n3-n2);

            n1 += scaled_cosine(zf)*(n2-n1);

            r += n1*ampl;
            ampl *= perlin_amp_falloff;
            xi<<=1;
            xf*=2;
            yi<<=1;
            yf*=2;
            zi<<=1;
            zf*=2;

            if (xf>=1.0) { xi++; xf--; }
            if (yf>=1.0) { yi++; yf--; }
            if (zf>=1.0) { zi++; zf--; }
        }
        return r;
    };
    noiseDetail(lod, falloff) {
        if (lod>0)     { perlin_octaves=lod; }
        if (falloff>0) { perlin_amp_falloff=falloff; }
    };
    noiseSeed(seed) {
        // Linear Congruential Generator
        // Variant of a Lehman Generator
        let lcg = (function () {
            // Set to values from http://en.wikipedia.org/wiki/Numerical_Recipes
            // m is basically chosen to be large (as it is the max period)
            // and for its relationships to a and c
            let m = 4294967296,
                // a - 1 should be divisible by m's prime factors
                a = 1664525,
                // c and m should be co-prime
                c = 1013904223,
                seed, z;
            return {
                setSeed: function (val) {
                    // pick a random seed if val is undefined or null
                    // the >>> 0 casts the seed to an unsigned 32-bit integer
                    z = seed = (val === null ? Math.random() * m : val) >>> 0;
                },
                getSeed: function () {
                    return seed;
                },
                rand: function () {
                    // define the recurrence relationship
                    z = (a * z + c) % m;
                    // return a float in [0, 1)
                    // if z = m then z / m = 0 therefore (z % m) / m < 1 always
                    return z / m;
                }
            };
        }());

        lcg.setSeed(seed);
        perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = lcg.rand();
        }
    }

    radiansToDegrees(radians){
        return radians * (180/Math.PI);
    }
    degreesToRadians(degrees){
        return degrees * (Math.PI/180);
    }

    isMobile(){
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    isMobileOrTablet(){
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }
};


Color = class extends Easy {
    constructor(r,g,b,a){
        super();

        if(r instanceof Color){
            this.r = r.r;
            this.g = r.g;
            this.b = r.b;
            this.a = r.a;
            return this;
        }

        if(typeof r!=="number"){r = 255;}
        if(typeof g!=="number"){g = r}
        if(typeof b!=="number"){b = r}
        if(typeof a!=="number"){a = 255;}
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;
    }


    set(r,g,b,a){
        if(typeof r!=="number"){r = 255;}
        if(typeof g!=="number"){g = r;}
        if(typeof b!=="number"){b = r;}
        if(typeof a!=="number"){a = 255;}
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;
    }

    randomize(){
        this.r = Math.floor(this.random(0,255));
        this.g = Math.floor(this.random(0,255));
        this.b = Math.floor(this.random(0,255));
    }

    invert(){
        this.r = 255-this.r;
        this.g = 255-this.g;
        this.b = 255-this.b;
        //this.a = 255-this.a;
        return this;
    }
};


const ezvectors = {};

Vector = class extends Easy {
    dist(p2){
        const dx = this.x - p2.x;
        const dy = this.y - p2.y;
        return Math.hypot(dx,dy);
    }
    constructor(x,y,z){
        super();
        this.val = 0;

        if(typeof x!=="number"){x = 0;}
        if(typeof y!=="number"){y = 0;}
        if(typeof z!=="number"){z = 0;}

        this.x = x;
        this.y = y;
        this.z = z;
    }


    set(point){
        let ks = Object.keys(point);
        for(let i = 0; i < ks.length; i++){
            let o = ks[i];
            this[o] = point[o];
        }
    }

    add(val){
        if(val instanceof Vector){
            this.x += val.x;
            this.y += val.y;
            return this;
        } else{
            this.x += val;
            this.y += val;
            return this;
        }
    }

    sub(val){
        if(val instanceof Vector){
            this.x -= val.x;
            this.y -= val.y;
            return this;
        } else{
            this.x -= val;
            this.y -= val;
            return this;
        }
    }

    mult(val){
        if(val instanceof Vector){
            this.x *= val.x;
            this.y *= val.y;
            return this;
        } else{
            this.x *= val;
            this.y *= val;
            return this;
        }
    }

    get(){
        return this.val;
    }


    fromAngle(angle){
        this.x = Math.cos(angle);
        this.y = Math.sin(angle);
        this.z = 0;
    }
};
Vertex = class extends Vector{
    constructor(x,y,z){
        super(x,y,z);
        delete this.val;
    }


    static transform(vertex, matrix){
        return Vertex.fromVector(matrix.mult(Vertex.toVector(vertex)))
    }

    static toVector(vertex){
        return new Vector(vertex.x, vertex.y, vertex.z);
    }

    static fromVector(vector){
        return new Vertex(vector.points[0], vector.points[1], vector.points[2]);
    }
};

Matrix = class extends Easy {
    dist (p1, p2){
        return p1.dist(p2);
    }

    constructor(rows,cols,depth){
        super();
        this.rows=rows||3;
        this.cols=cols||this.rows;
        if(depth!==undefined){
            this.depth = depth || 1;
        } else{
            this.depth = 1;
        }
        this.points = [];

        for(let z = 0; z < this.depth; z++){
            for(let y = 0; y < this.cols; y++){
                for(let x = 0; x < this.rows; x++){
                    let p;


                    if(depth!==undefined){
                        p = new Vector(x,y,z);
                    } else{
                        p = new Vector(x,y);
                    }

                    //p.index = this.points.length;
                    this.points.push(p);
                }
            }
        }

        if(this.depth!==undefined){
            delete this.depth;
        }
    }


    mult(a,n){
        let arr = (a.length && a) || this.points || this.pixels;
        for(let i = 0; i  < arr.length; i++){
            arr[i].val *= (n || a);
        }
        return this;
    }

    add(a,n){
        let arr = (a.length && a) || this.points || this.pixels;
        for(let i = 0; i  < arr.length; i++){
            arr[i].val += (n || a);
        }
        return this;
    }

    sub(a,n){
        let arr = (a.length && a) || this.points || this.pixels;
        for(let i = 0; i  < arr.length; i++){
            arr[i].val -= (n || a);
        }
        return this;
    }

    setFrom(m){
        if(this.points){this.points = m.points || m.pixels;}
        if(this.pixels){this.pixels = m.points || m.pixels;}
    }

    point(x,y,z){
        let array = this.points || this.pixels;
        let rows = this.rows || this.width;
        let cols = this.cols || this.height;
        const m = x + rows*y;
        return array[m];
    }

    col(x){
        const rows = [];
        for(let i = 0; i < this.cols; i++){
            rows.push(this.point(x,i));
        }
        return rows;
    }

    row(x){
        const cols = [];
        for(let i = 0; i < this.rows; i++){
            cols.push(this.point(i,x));
        }
        return cols;
    }

    surroundings(point){
        const x=point.x,y=point.y;
        return {
            up:        this.point(x,   y-1),
            upRight:   this.point(x+1, y-1),
            right:     this.point(x+1, y),
            downRight: this.point(x+1, y+1),
            down:      this.point(x,   y+1),
            downLeft:  this.point(x-1, y+1),
            left:      this.point(x-1, y),
            upLeft:    this.point(x-1, y-1)
        }
    }

    shuffle() {
        let array = this.points || this.pixels;

        let m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        if(this.points){this.points = array.slice();}
        if(this.pixels){this.pixels = array.slice();}
        return this.points || this.pixels;
    }


    fill(arr,val){
        let processarr;
        if(arr!==undefined){
            if(val!==undefined){
                //theres an array and val
                processarr = arr;
            } else{
                //theres just a val
                val = arr;
                processarr = this.points || this.pixels;
            }


            if(processarr){
                for(let i = 0; i < processarr.length; i++){
                    processarr[i].val = val;
                }
            }
        }
        return this;
    }




    sum(arr){
        let processarr,sum=0;
        if(arr){
            processarr = arr;
        }
        if(!arr){
            processarr = this.points || this.pixels;
        }

        if(processarr){
            for(let i = 0; i < processarr.length; i++){
                sum += processarr[i].val
            }
            return sum;
        }
    }



    isometric(angle){
        let a = Math.cos(angle);
        let b = Math.sin(angle);
        let m = [
            a, 0, a,
            -b, 1, b,
            0, 0, 0
        ];
        for(let i = 0; i < m.length; i++){
            this.points[i].val = m[i];
        }
        return this.points;
    }

    rotateX(angle){
        let a = Math.cos(angle);
        let b = Math.sin(angle);
        let m = [
            1.0, 0.0, 0.0,
            0.0,   a,  -b,
            0.0,   b,   a
        ];
        for(let i = 0; i < m.length; i++){
            this.points[i].val = m[i];
        }
        return this.points;
    }

    rotateY(angle){
        let a = Math.cos(angle);
        let b = Math.sin(angle);
        let m = [
            a, 0.0,   b,
            0.0, 1.0, 0.0,
            -b, 0.0,   a
        ];
        for(let i = 0; i < m.length; i++){
            this.points[i].val = m[i];
        }
        return this.points;
    }

    rotateZ(angle){
        let a = Math.cos(angle);
        let b = Math.sin(angle);
        let m = [
            a,  -b, 0.0,
            b,   a, 0.0,
            0.0, 0.0, 1.0
        ];
        for(let i = 0; i < m.length; i++){
            this.points[i].val = m[i];
        }
        return this.points;
    }

};
Canvas = class extends Matrix{
    constructor(id,w,h){
        id=id||EasyID;
        w = w || 100;
        h = h || w;
        super(w,h);

        this.width = w;
        this.height = h;
        this.frame = 0;

        this.rendering = true;
        this.pixels = this.points;
        this.renderScale = 1;
        this.hasScaled = false;
        this.originalScale = 1;

        this.backgroundColor = new Color(255);

        delete this.points;
        delete this.rows;
        delete this.cols;
        this.c = document.createElement('canvas');
        this.c.id     = id;
        this.c.width = this.width;
        this.c.height = this.height;

        document.body.appendChild(this.c);
        this.ctx = this.c.getContext('2d');

        this.updated = {x:0,y:0,w:this.width,h:this.height};
        this.loop = false;
        this.clearMode = true;
        this.loopBinds = [];


        //this.bindResize();

        this.clear();
        //this.updatePixels();
        this.render();
    }
    pixel(x,y){
        return this.point(x,y);
    }

    bindResize(){
        window.onresize = function(event) {

        };
    }

    add(shape, x, y){
        if(x instanceof Vector){
            x = x.x;
            y = x.y;
        }
        x=x||0;
        y=y||0;

        x = Math.round(x);
        y = Math.round(y);
        if(!this.shapes){
            this.shapes = [];
        }
        shape.calc(this.width,this.height,x,y);
        this.shapes.push(shape);
        shape.render(this.ctx);
    }

    background(color){
        if(typeof color!==undefined){
            this.backgroundColor = new Color(color);
            this.setAllPixels(this.backgroundColor);
        }
        return this.backgroundColor;
    }


    scale(n){

        n =  parseFloat((Math.ceil(n*20)/20).toFixed(2));

        this.originalScale *= n;


        this.renderScale = n;

        this.hasScaled = false;
    }

    clear(){
        if(this.clearMode){
            this.ctx.translate(0, 0);
            //this.ctx.clearRect(0, 0, this.width, this.height);
            this.background(this.backgroundColor);
        }



    }

    makeHitArray(img){
        let a = [];

    }

    setAllPixels(color){
        if(!color){color=new Color(0);}
        this.ctx.beginPath();
        this.ctx.rect(0,0, this.width / this.originalScale, this.height / this.originalScale);
        this.ctx.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + (color.a / 255) + ")";
        this.ctx.fill();
        this.ctx.closePath();
        //this.fill(this,color);
    }

    setPixel(x,y,c) {
        //console.log(c);
        this.ctx.beginPath();
        this.ctx.rect(x, y, 1, 1);
        this.ctx.fillStyle = "rgba(" + c.r + ", " + c.g + ", " + c.b + ", " + (c.a / 255) + ")";
        this.ctx.fill();
        this.ctx.closePath();
    }


    updateImgData(){
        this.imgData = this.ctx.getImageData(0,0,this.width,this.height);
        return this;
    }

    getPixel(index) {
        let i = index*4, d = this.imgData.data;
        return new Color(d[i],d[i+1],d[i+2],d[i+3]);
    }


    getPixelXY(x, y) {
        return this.getPixel(y*this.imgData.width+x);
    }

    updatePixels(shapePixels){
        this.updateImgData();





        shapePixels = shapePixels || {x:0,y:0,w:this.width,h:this.height};


        for(let x = shapePixels.x; x < shapePixels.w; x++){
            for(let y = shapePixels.y; y < shapePixels.h; y++){

                let px = this.pixel(x,y);
                if(px){
                    px.val = this.getPixelXY(px.x,px.y);
                }
            }
        }



        this.updated = shapePixels;
    }

    invert(){
        this.updatePixels();
        for(let i = 0; i < this.pixels.length; i++){
            this.pixels[i].val.invert();
        }
        this.updated = {x:0,y:0,w:this.width,h:this.height};
        this.render();
    }

    randomize(){
        this.updatePixels();
        for(let i = 0; i < this.pixels.length; i++){
            this.pixels[i].val.randomize();
        }
        this.updated = {x:0,y:0,w:this.width,h:this.height};
        this.render();
    }

    noClear(){
        this.clearMode = false;
    }

    bindEvent(type,fn){
        this.c.addEventListener(type,function(event){
            event.preventDefault();
            if(type==="wheel"){
                fn(event.wheelDelta);
            } else{
                fn(event.pageX - this.c.offsetLeft, event.pageY - this.c.offsetTop);
            }
        }.bind(this), true);
    }


    bindLoop(fn,interval){
        //fn.bind(this).call();
        let i = this.loopBinds.push(fn.bind(this));
        if(interval){
            this.startLoop(interval);
        }

        return i-1;



    }

    unbindLoop(i){
        if (this.loopBinds[i]) {
            this.loopBinds.splice(i, 1);
        }
        return this;
    }

    startLoop(interval){
        if(this.loop){
            this.stopLoop();
        }
        if(!this.loop){
            interval = interval || 60;
            this.loop = setInterval(function(){
                this.frame++;
                if(!this.hasScaled){
                    this.ctx.scale(1/this.renderScale, 1/this.renderScale);
                }
                this.clear();



                for(let i = 0; i < this.loopBinds.length; i++){
                    this.loopBinds[i]();
                }



                this.render();
                if(!this.hasScaled){
                    this.ctx.scale(this.renderScale, this.renderScale);
                    this.hasScaled = true;

                }

            }.bind(this),interval);
        }
        return this.loop;
    }

    stopLoop(){
        if(this.loop){
            clearInterval(this.loop);
            this.loop = false;
        }
        return this;
    }


    render(){
        if(!this.rendering) {
            if (this.updated) {
                for (let x = this.updated.x; x < this.updated.w; x++) {
                    for (let y = this.updated.y; y < this.updated.h; y++) {

                        let px = this.pixel(x, y);
                        if (px) {
                            this.setPixel(px.x, px.y, px.val);
                        }
                    }
                }
                this.updated = false;
            }
            return this;
        }
    }


};

//SHAPE
Shape = class extends Easy{
    constructor(){
        super();
        this.setColor(new Color(255));
        this.stroke = false;
    }

    calc(w,h,x,y){
        this.x = x;
        this.y = y;
    }

    setColor(c){
        this.color = c;
        return this;
    }

    setStroke(c){
        this.stroke = c;
        return this;
    }

    background(color){
        if(typeof color!==undefined){
            this.setColor(new Color(color));
        }
        return this;
    }

    transferStyle(shape){
        this.stroke = shape.stroke;
        this.color = shape.color;
        return this;
    }


    render(ctx){
        return this;
    }

    grow(n){
        if(this.radius){
            this.radius += n;
        } else{
            this.width += n;
            this.height += n;
        }
    }

    shrink(n){
        if(this.radius){
            this.radius -= n;
        } else{
            this.width -= n;
            this.height -= n;
        }
    }


    replacer(key,value){
        if (key==="asset") return undefined;
        else return value;
    }

};


//SHAPES

Circle = class extends Shape {
    constructor(r) {
        super();
        this.radius = Math.floor(r/2);

    }

    readPixels() {
        return {
            x: this.x - (this.radius/2) + this.radius,
            y: this.y - (this.radius/2) + this.radius,
            w: this.radius*2 - this.radius,
            h: this.radius*2 - this.radius
        };
    }

    render(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        if(this.stroke){
            ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
            ctx.stroke();
        }
        if(this.color){
            const cr = "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + (this.color.a / 255) + ")";
            ctx.fillStyle = cr;
            ctx.fill();
        }
        ctx.closePath();
    }

};
Rect = class extends Shape {
    constructor(w,h) {
        super();
        this.width = w;
        this.height = h || this.width;
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
        ctx.beginPath();
        ctx.rect(this.x,this.y,this.width,this.height);
        if(this.stroke){
            ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
            ctx.stroke();
        }
        if(this.color){
            ctx.fillStyle = "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + (this.color.a / 255) + ")";
            ctx.fill();
        }
        ctx.closePath();
    }
};
Square = class extends Shape {
    constructor(size) {
        super();
        this.width = size;
        this.height = size;
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
        ctx.beginPath();
        ctx.rect(this.x,this.y,this.width,this.height);
        if(this.stroke){
            ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
            ctx.stroke();
        }
        if(this.color){
            ctx.fillStyle = "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + (this.color.a / 255) + ")";
            ctx.fill();
        }
        ctx.closePath();
    }
};
Grid = class extends Shape {
    constructor(w,h,rows,cols) {
        super();
        this.width = w;
        this.height = h;
        this.rows = rows;
        this.cols = cols;
        this.cellw = this.width/rows;
        this.cellh = this.width/cols;

        this.setStroke(new Color(0));
    }

    readPixels() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }


    calc(w,h,x,y){
        this.x = x;
        this.y = y;
        this.cellw = this.width/this.rows;
        this.cellh = this.width/this.cols;
    }

    render(ctx){



        for(let y = 0; y < this.rows; y++){
            for(let x = 0; x < this.cols; x++){

                ctx.beginPath();
                ctx.rect(this.x + x * this.cellw,this.y + y * this.cellh,this.cellw,this.cellh);

                if(this.stroke){
                    ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
                    ctx.stroke();
                }
                if(this.color){
                    ctx.fillStyle = "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + (this.color.a / 255) + ")";
                    ctx.fill();
                }
                ctx.closePath();

            }
        }









    }
};
Line = class extends Shape {
    constructor(x1,y1,x2,y2) {
        super();
        this.setStroke(new Color(0));
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
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
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        if(this.stroke){
            ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
        }
        ctx.moveTo(this.x2, this.y2);
    }
};
Polygon = class extends Shape {
    constructor(vertices){
        super();
        this.vertices = vertices;
    }





    count() {
        return this.vertices.length;
    };
    vertex(i) {
        if (i < 0) {
            throw new Error('Vertex index must be a positive integer')
        }
        if (i >= this.vertices.length) {
            throw new Error('Vertex index out of bounds');
        }
        return this.vertices[i];
    };


    readPixels() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }


    render(ctx){

        ctx.beginPath();
        let vertex = Vertex.transform(this.vertex(0), this.transform);
        ctx.moveTo(this.x(vertex), -1 * this.y(vertex));
        for (let i = 1; i < this.count(); ++i) {
            vertex = Vertex.transform(this.vertex(i), this.transform);
            ctx.lineTo(this.x(vertex), -1 * this.y(vertex));
        }
        ctx.closePath();
        ctx.stroke();




            // The -1 * is used to flip the y coordinate as y value increases
            // as you move down the canvas.
            ctx.moveTo(this.x(this.vertex(0)), -1 * this.y(this.vertex(0)));

            for (let i = 0; i < this.count(); ++i) {
                ctx.lineTo(this.x(this.vertex(i)), -1 * this.y(this.vertex(i)));
            }
        }
};
Cuboid = class extends Shape {
    constructor(size,angle){
        super();
        this.size = size;
        this.width = size;
        this.height = size;
        this.depth = size;
        this.x = 0;
        this.y = 0;


        this.angle = Math.PI / angle;
        this.transform = new Matrix(3);


        this.transform.isometric(this.angle);



        this.vertices = [
            new Vertex(-1.0, -1.0, -1.0), // Front-Bottom-Left
            new Vertex( 1.0, -1.0, -1.0), // Front-Bottom-Right
            new Vertex(-1.0, -1.0,  1.0), // Rear-Bottom-Left
            new Vertex( 1.0, -1.0,  1.0), // Rear-Bottom-Right
            new Vertex(-1.0,  1.0, -1.0), // Front-Top-Left
            new Vertex( 1.0,  1.0, -1.0), // Front-Top-Right
            new Vertex(-1.0,  1.0,  1.0), // Rear-Top-Left
            new Vertex( 1.0,  1.0,  1.0)  // Rear-Top-Right
        ];



        this.faces = [
            new Polygon([this.vertices[0], this.vertices[1], this.vertices[5], this.vertices[4]]), // Front
            new Polygon([this.vertices[2], this.vertices[3], this.vertices[7], this.vertices[6]]), // Rear
            new Polygon([this.vertices[0], this.vertices[1], this.vertices[3], this.vertices[2]]), // Bottom
            new Polygon([this.vertices[4], this.vertices[5], this.vertices[7], this.vertices[6]]), // Top
            new Polygon([this.vertices[0], this.vertices[2], this.vertices[6], this.vertices[4]]), // Left
            new Polygon([this.vertices[1], this.vertices[3], this.vertices[7], this.vertices[5]])  // Right
        ];





    }


    calc(w,h,x,y){
        this.x = x;
        this.y = y;
    }

    readPixels() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }

    fx(vertex) {
        return vertex.x * (this.size / 2);
    }
    fy(vertex) {
        return vertex.y * (this.size / 2);
    }

    render(ctx){
        // Makes 0 the center of the canvas
        ctx.translate(this.x, this.y);




        for (let i = 0; i < this.faces.length; ++i) {


            this.faces[i].calc(0, 0, this.fx.bind(this), this.fy.bind(this));
            this.faces[i].transform = this.transform;
            this.faces[i].render(ctx);


            // if(this.stroke){
            //     ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
            //     ctx.stroke();
            // }
            // if(this.color){
            //     ctx.fillStyle = "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + (this.color.a / 255) + ")";
            //     ctx.fill();
            // }
        }


    }

};
Text = class extends Shape {
    constructor(str,fontSize) {
        super();
        if(str===undefined){
            str = "Lorem Ipsum";
        }
        this.string = str;
        this.fontSize = fontSize || 12;
        this.fontFamily = "Arial";
        this.textAlign = "center";
        this.setColor(new Color(0));

    }


    calc(w,h,x,y){
        this.x = x;
        this.y = y;


        this.font = this.fontSize+"px "+this.fontFamily;
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
        ctx.beginPath();
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        if(this.stroke){
            ctx.strokeStyle = "rgba(" + this.stroke.r + ", " + this.stroke.g + ", " + this.stroke.b + ", " + (this.stroke.a / 255) + ")";
            ctx.strokeText(this.string,this.x,this.y);
        }
        if(this.color){
            ctx.fillStyle = "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + (this.color.a / 255) + ")";
            ctx.fillText(this.string,this.x,this.y);
        }
        ctx.closePath();
    }
};

const __ezlimgs = {};

Img = class extends Shape {
    constructor(path,w,h,callback) {
        super();

        if(__ezlimgs.hasOwnProperty(path)){
            this.img = __ezlimgs[path];
            this.width = w || this.img.naturalWidth;
            this.height = h || this.img.naturalHeight;
            if(typeof callback==="function"){
                callback.bind(this).call();
            }
        } else{
            this.img = new Image();
            this.img.onload = function () {
                this.width = w || this.img.naturalWidth;
                this.height = h || this.img.naturalHeight;
                if(typeof callback==="function"){
                    callback.bind(this).call();
                }
            }.bind(this);
            this.path = path;
            this.img.src = this.path;
            __ezlimgs[path] =  this.img;
        }
    }


    flipX(){
        this.flippedX = !this.flippedX;
    }

    flipY(){
        this.flippedY = !this.flippedY;
    }


    calc(w,h,x,y){
        this.x = x;
        this.y = y;
    }

    readPixels() {
        return {
            x: this.x,
            y: this.y,
            w: this.img.width,
            h: this.img.height
        };
    }

    render(ctx){
        ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
    }
};
const ez = new Easy();