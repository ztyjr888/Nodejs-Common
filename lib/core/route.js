/**
 * Created by tlzhang on 2015/4/24.
 */

var index = require('./../index');
var http = require('http');
var querystring = require("querystring");
var connection = require("./connection");
(function () {
    var mapUrls;
    function route(urls,port,viewPath){
        this.map = {};
        mapUrls = urls;
        this.port = port;
        this.viewPath = viewPath;
        this.instance.call(this);
    }

    route.prototype = function(){
        init = function(){
            if(!mapUrls){
                throw new Error('Please input urls.');
            }
            var self = this;
            var server = http.createServer(function(req,res){
                var connect = new connection(req,res);
                /*var content_type = req['headers']['content-type'] || '';
                content_type = content_type.split(';')[0];
                console.log(content_type);*/

                var requestType = req.method;
                console.log("request type:"+requestType);

                var path = connect.url;
                var _path = pathParser(path);

                var value = findUrlInMap(_path);
                if(!value){
                    console.log(self.viewPath);
                    connect.writeResources(self.viewPath,path);
                    return;
                }

                var type = value.type;
                var url;
                if(type.toLowerCase() == 'json')
                  url = path;
                else
                  url = value.url;

                //connect.write(type,path);
                write.call(self,type,url,connect,requestType);
            });
            server.listen(this.port);
            console.log("Listening For Port:"+this.port);
        };

        get = function(url,callback){
            if(!url ||!callback)
                return;

            if(typeof(callback) != 'function'){
                return;
            }

            if(typeof(url) !='string')
                return;

            this.map[url] = callback;
        };

        write = function(type,url,connect,requestType){
            switch(type){
                case 'json':
                    if(requestType == "POST"){
                        var path = pathParser(url);
                        var callback = this.map[path];
                        getRequestData.call(this,url,requestType,connect,callback);
                    }else if(requestType == "GET"){
                        var data = getRequestData.call(this,url,requestType,connect);
                        var path = pathParser(url);
                        var callback = this.map[path];
                        console.log("callback",callback);
                        if(callback){
                            callback.call(this,data,connect);
                        }
                    }

                    break;

                case 'html':
                    connect.write(type,url);
                    break;
            }
        };

        getRequestData = function(url,requestType,connect,callback){
            if(requestType == "GET"){
                var data = getParams(url,requestType,connect);
                return formateData(data);
            }else if(requestType == "POST"){
                getParams(url,requestType,connect,callback);
            }
        };

        formateData = function(data){
            var str = '';
            if(typeof(data) == 'string'){
                str = data;
            }else{
                str = JSON.stringify(data);
            }
            return str;
        }

        getParams = function(url,requestType,connect,callback){
            var data = [];
            if(requestType.toUpperCase() == "GET"){
                if(url.indexOf('?') != -1){
                    var urls = url.split('?');
                    if(urls.length <= 1)
                        return;

                    var _url = urls[1];
                    if(_url.indexOf('&') != -1){
                        data.push(querystring.parse(_url));
                    }else{
                        data.push(_url);
                    }
                }
                return data;

            }else if(requestType.toUpperCase() == "POST"){
                var result = '';
                connect.request.addListener("data",function(ret){
                    result += ret;
                });

                connect.request.addListener("end",function(){
                    data.push(querystring.parse(result));
                    data = formateData(data);
                    callback.call(this,data,connect);
                });
            }
        }

        pathParser = function(url){
            if(!url)
                return;

            var path = '';
            if(url.indexOf('?') != -1){
                var urls = url.split('?');
                path = urls[0];
                return path;
            }

            return url;
        };

        findUrlInMap = function(path){
            if(mapUrls.size() == 0)
                return false;

            return mapUrls.get(path);
        };

        return {
            get: this.get,
            instance: this.init
        }
    }();


    module.exports = route;
})();
