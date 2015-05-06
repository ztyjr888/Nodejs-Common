/**
 * @author:zt
 * @date:2015-03-11
 */
(function(global){
    var Util = {};

    Util.Map = function(){
        if(!(this instanceof Util.Map)){
            return new Util.Map();
        }

        this.container = {};
    };

    Util.Map.prototype = function(){

        /*
         * put the key and value into container
         */
        put = function(key,value){
            try{
                var reg = /^[ ]+$/;
                if(key!=null && key!="" && !reg.test(key)){
                    this.container[key] = value;
                }
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * get the value from Map by key
         */
        get = function(key){
            try{
                var reg = /^[ ]+$/;
                if(key!=null && key!="" && !reg.test(key)){
                    return this.container[key] == undefined ? null : this.container[key];
                }
                return null;
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * judge Map is contains key
         */
        containsKey = function(key){
            try{
                if(this.container.length == 0)
                    return false;

                for(var p in this.container){
                    if(p == key){
                        return true;
                    }
                }

                return false;
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * judge Map is contains value
         */
        containsValue = function(value){
            try{
                for(var p in this.container){
                    if(this.container[p] == value){
                        return true;
                    }
                }

                return false;
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * remove from Map
         */
        remove = function(key){
            try{
                if(this.containsKey(key))
                    delete this.container[key];
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * clear Map
         */
        clear = function(){
            try{
                delete this.container;
                this.container = {};
            }catch(e){
                throw new Error("Map Error:"+e.message);
            }
        };

        /*
         * return all keys
         */
        keyArray = function(){
            var keys = new Array();
            for(var p in this.container){
                keys.push(p);
            }
            return keys;
        };

        /*
         * return all values
         */
        valueArray = function(){
            var values = new Array();
            var keys=this.keyArray();
            for(var i=0;i<keys.length;i++){
                values.push(this.container[keys[i]]);
            }
            return values;
        };

        /*
         * judge Map is empty
         */
        isEmpty = function(){
            if(this.keyArray().length == 0)
                return true;
            else
                return false;
        };

        /*
         * the size of Map
         */
        size = function(){
            return this.keyArray().length;
        };

        return{
            init:this.init,
            put:this.put,
            get:this.get,
            containsKey:this.containsKey,
            containsValue:this.containsValue,
            remove:this.remove,
            clear:this.clear,
            keyArray:this.keyArray,
            valueArray:this.valueArray,
            isEmpty:this.isEmpty,
            size:this.size
        }
    }();

    global.Map = Util.Map;
})(typeof exports === 'undefined' ? (window.SCPUtil = window.SCPUtil || {}) : exports);
