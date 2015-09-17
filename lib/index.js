var core = './core/';
var plugin = './plugin/';

var mapName = 'scp.map';
var listName = 'scp.list';
var routeName = 'route';
var sessionName = 'session';

exports.map = require(plugin + mapName);
exports.list = require(plugin + listName);
exports.route = require(core + routeName);
exports.http = require('http');
exports.fs = require('fs');
exports.session = require(core + sessionName);
