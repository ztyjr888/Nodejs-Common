(function(){
   var Exception = {
        ERROR_MAX_SESSION : -1, //同一账号超过最大绑定SESSION
        valueOf : function(msg,code){
            return {msg : msg , code : code};
        }
    };

    var Sessionkey = {
        lastTime : '',  //最后访问时间
        bind : '',      //绑定对象
        state : 1       //会话状态
    };

    var SessionContext = {
        injectionType : 'config',
        gcTime : 1000*60 *15,//回收会话时间
        hbTime : 1000*2,//心跳保持时间
        msgMaxLength : 50,//每个会话消息保存长度
        maxSession : 5//当超过上限时把一个提下来 支持同一账号多个会话
    };

    var session = {};
    session.auto_sessionContext = null;
    session.injectionType = 'core';
    session._data = {};
    session._bind = {};
    session.awakeTime = 56565;

    session.awake = function(){
        this.initSessionGCProcessor();
        this.intiSessionHeartbeatProcessor();
        //test
        try{
            this.createSession(session.awakeTime);
            this.createSession(session.awakeTime);
            this.createSession(session.awakeTime);
            this.createSession(session.awakeTime);
            this.createSession(session.awakeTime);
            this.createSession(session.awakeTime);
            this.createSession(session.awakeTime);
        }catch(er){
            console.log(er);
        }
        console.log("createSession =====",this._data);
    }

    session.getSession = function(sid){
        return this._data[sid];
    }

    session.createSession = function(bid,config){
        var context = session.extend(SessionContext,config);
        session.auto_sessionContext = context;
        var _bind_array = this._bind[bid];
        if(_bind_array == null){
            this._bind[bid] = [];
        }else if(_bind_array.length> this.auto_sessionContext.maxSession ){
            throw Exception.valueOf('max bind session :'+bid,  Exception.ERROR_MAX_SESSION);
        }

        var uuid = this.getUUID().replace(/-/mg,'');
        this._bind[bid].push(uuid);
        var $this = this;

        var _session = {
            id:uuid,
            //state : 1, //会话状态
            //bid : bid, //绑定ID
            //lastTime : new Date(), //最后访问时间
            _attr :{}, //属性
            _msg : [], //保存推送消息
            getAllAttr : function(){ return this._attr; },
            getAttr : function(key){ return this._attr[key]; },                         //获取属性
            removeAttr : function(key){ this._attr[key]=null ; },                       //删除属性
            setAttr : function(key,value){  this._attr[key] = value; return this; },    //设置属性
            write : function(msg){ this._msg.push(msg); },                              //输入准备推送的消息
            getAndPushMsg : function(){ var result = this._msg; this._msg = []; return  result; }, //获取并且推送消息
            close : function(){ this.setAttr(Sessionkey.state,0); },                    //关闭会话
            destory : function(){ this.setAttr(Sessionkey.state,-1); },                 //销毁会话
            replace : function(session){ var allAttr =session.getAllAttr() ;
                for(var key in allAttr){
                    if(this._attr[key] !=null){
                        this._attr[key]=allAttr[key];
                    }
                }
            }, //替换会话
            refreshLastTime : function(){                                               //刷新最后访问时间
                this.setAttr(Sessionkey.lastTime,new Date())
                    .setAttr(Sessionkey.state,1);
            },
            init : function(bid){ //初始化
                this
                    .setAttr(Sessionkey.lastTime,new Date())
                    .setAttr(Sessionkey.bind,bid)
                    .setAttr(Sessionkey.state,1);
            }
        };

        _session.init(bid);
        this._data[_session.id] = _session;
        return _session;
    }


    session.extend = function(target,source){
        if(!target && source)
            return source;

        if(target && !source){
            return target;
        }

        for(var src in source){
            if(source.hasOwnProperty(src)){
                if(typeof source[src]==="object"){
                    session.extend(target[src],source[src])
                }else{
                    target[src] = source[src];
                }
            }
        }
        return target;
    }

    session.replaceSession = function(source,target){
        var newSession = this.getSession(source),
            oldSession = this.getSession(target);

        if(newSession !=null && oldSession!=null){
            newSession.replace(oldSession);
            this.destorySession(oldSession.id);
        }
    }

    session.destorySession = function(id){
        var _session = this.getSession(id);
        if(_session !=null){
            _session.destory();
            delete this._data[id];
            //删除绑定
            var bid = _session.getAttr(Sessionkey.bind);
            if(this._bind[bid]!=null){
                var index = this._bind[bid].indexOf(id);
                console.log("remove bid: ================",bid ," index : ",index);
                if(index >-1){
                    this._bind[bid].splice(index, 1);
                    console.log("remove : ================",id);
                }
            }
        }
    }

    session.sharedSession = function(){}

    //初始化会话回收处理器
    session.initSessionGCProcessor = function(){
        var $this = this,
            time = this.auto_sessionContext.gcTime;
        setInterval(function(){
            var now = new Date().getTime();
            var removeSessions = [];
            //find remove
            for(var i in $this._data){
                var _session = $this._data[i],
                    state = _session.getAttr(Sessionkey.state),
                    lastTime = _session.getAttr(Sessionkey.lastTime);
                if( (lastTime.getTime()+time ) < now ){
                    removeSessions.push( _session.id );
                }
            }
            console.log("remove session bind: ",this._bind);

            //console.log("run gc :",removeSessions);
            //now remove
            for(var i in removeSessions){
                $this.destorySession(removeSessions[i]);
            }
        },time);
    }

    //初始化会话心跳检测处理器
    session.intiSessionHeartbeatProcessor = function(){}

    //推送消息处理器
    session.pushMessageProcessor = function(id){
        var _session = this.getSession(id);
        if(_session ==null) return null;
        return _session.getAndPushMsg();
    }

    session.getUUID = function(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    module.exports = session;
})();
