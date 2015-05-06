/**
 * Created by tlzhang on 2015/4/24.
 */
var index = require('./../index');
var fs = require('fs');
(function(){

    var properties = {
        format:{
            'JSON':{
                'Content-Type':'application/json',
                'charset':'utf-8'
            },

            'HTML':{
                'Content-Type':'text/html',
                'charset':'utf-8'
            },

            'JS':{
                'Content-Type':'text/javascript',
                'charset':'utf-8'
            },

            'CSS':{
                'Content-Type':'text/css',
                'charset':'utf-8'
            },

            'TEXT':{
                'Content-Type':'text/plain',
                'charset':'utf-8'
            },

            'GIF':{
                'Content-Type':'image/gif',
                'charset':'utf-8'
            },

            'JPEG':{
                'Content-Type':'image/jpeg',
                'charset':'utf-8'
            },

            'JPG':{
                'Content-Type':'image/jpeg',
                'charset':'utf-8'
            },

            'PNG':{
                'Content-Type':'image/png',
                'charset':'utf-8'
            },

            'MPEG':{
                'Content-Type':'video/mpeg',
                'charset':'utf-8'
            },

            'FORM':{
                'Content-Type':'multipart/form-data',
                'charset':'utf-8'
            }
        },

        views:'/'

    };

    function connection(request,response){
        this.url = request.url;
        this.request = request;
        this.response = response;
    }

    connection.prototype = function(){
        write = function(type,url){
            if(!type){
                var suffix = getFileSuffix(url);
                return;
            }

            switch(type){
                case 'html':
                    sendHtml.call(this,url);
                    break;
            }
        };

        sendHtml = function(path){
            var contentType = properties.format['HTML'];
            var self = this;
            path = pathParser(path);
            if(!exists(path)){
                self.response.writeHead(404);
                return self.response.end('File Not Found.');
            }

            readFile.call(this,path,contentType);
        };

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


        writeResources = function(viewPath,path){
            if(!path)
                return;

            if(path.indexOf(properties.views) == 0){
                path = "." + path;
            }
            console.log("path:"+path);
            if(!exists(path)){
                if(path.indexOf(".") == 0){
                    path = path.substr(1,path.length);
                    var str = viewPath.substring(viewPath.length-1,viewPath.length);
                    if(str != "/"){
                        viewPath = viewPath + '/';
                    }

                    if(path.indexOf('/') == 0){
                        path = path.substring(1,path.length);
                    }

                    if(viewPath.indexOf('/') == 0){
                        path = '.' + viewPath  + path;
                    }else{
                        path = '.' + viewPath  + path;
                    }

                    console.log("new path:"+path);
                    if(!exists(path)){
                        this.response.writeHead(404);
                        return this.response.end('File Not Found.');
                    }

                }else{
                    this.response.writeHead(404);
                    return this.response.end('File Not Found.');
                }
            }

            var suffix = getFileSuffix(path);
            if(!suffix)
                return;

            if(suffix.indexOf(".") == 0){
                suffix = suffix.substr(1,suffix.length);
            }

            suffix = suffix.toUpperCase();
            var contentType = properties.format[suffix];
            if(!contentType){
                return;
            }
            readFile.call(this,path,contentType);
        };

        exists = function(path,callback){
            if(callback){
               return fs.exists(path,callback);
            }else{
               return fs.existsSync(path);
            }
        };

        readFile = function(path,contentType){
            var self = this;
            console.log("path",path);
            fs.readFile(path,function (err, data) {
                    if (err) {
                        self.response.writeHead(500);
                        return self.response.end('Error loading page.');
                    }

                    self.response.statusCode = 200;
                    for(var i in contentType){
                        self.response.setHeader(i,contentType[i]);
                    }
                    self.response.end(data);
            });
        };

        getFileSuffix = function (url) {
            var suffix = /\.[^\.]+$/.exec(url);
            return suffix.toString().toLowerCase();
        };

        return{
            write:this.write,
            writeResources:this.writeResources
        }
    }();

    module.exports = connection;
})();
