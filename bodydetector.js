
var videoElement;
var _callback;
const video = document.querySelector('video');
class CamBodyDetector{

    static async start(v_width=640,v_height=480,callback){
        
        const constraints = {
            audio: false,
            video: {
              height: v_height,
              width: v_width,
              
            }
        };
                
        navigator.mediaDevices.getUserMedia(constraints).
            then((stream) => {
                video.srcObject = stream});
        
        videoElement = document.getElementById(video.id);
        videoElement.width = v_width;
        videoElement.height = v_height;
        var body = await Body.startDetection();
        var getBody = function Bestimate(){
          body.estimate(CamBodyDetector.getVideoElement(),CamBodyDetector.getCallBack());
        }
        
        _callback = function call(bd){
            callback(bd);
            CamBodyDetector.requestAnimationFrame(getBody);
        }
        CamBodyDetector.requestAnimationFrame(getBody);
    }
    static requestAnimationFrame(callback) {
        setTimeout(callback, 1000 / 60);
    }
    static getVideoElement(){
        return videoElement;
    }
    static getCallBack(){
        return _callback;
    }
}



let _instance = null;
class Body{
    constructor(net){
        this.net = net;
        this.imageScaleFactor = 0.5;
        this.outputStride = 16;
        this.flipHorizontal = false;
    }
    
    static async startDetection(){
        if(_instance != null){
            return _instance;
        }
        await posenet.load().then(function(net){
            _instance = new Body(net)
        });
        
        return _instance;
    }

    static getInstance(){
        return _instance;
    }

    estimate(Element,callback){
        this.net.estimateSinglePose(Element, this.imageScaleFactor, this.flipHorizontal, this.outputStride).then(function(pose){
            console.log(pose);
            var bd = Body.getInstance();
            bd.setParts(pose);
            callback(bd);
          });
    }

    setParts(parts){
        this.nose = parts.keypoints[0];
        this.Leye = parts.keypoints[1];
        this.Reye = parts.keypoints[2];
        this.Lear = parts.keypoints[3];
        this.Rear = parts.keypoints[4];
        this.Lshoulder = parts.keypoints[5];
        this.Rshoulder = parts.keypoints[6];
        this.Lhand = parts.keypoints[9];
        this.Rhand = parts.keypoints[10];
    }

    calculateFaceAngle(){
        return Math.atan(Math.abs(this.Lear.position.y - this.Rear.position.y)/Math.abs(this.Lear.position.x - this.Rear.position.x)) * (this.Lear.position.y - this.Rear.position.y) / Math.abs(this.Lear.position.y - this.Rear.position.y);
    }

    calculateHeadPosition(){
        return [this.Rear.position.x,
                this.Reye.position.y-Math.abs(this.Reye.position.y-this.Rear.position.y)*4,
                Math.abs(this.Rear.position.x-this.Lear.position.x),
                Math.abs(this.Rear.position.y-this.Rshoulder.position.y)
                ]
    }

}