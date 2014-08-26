var spidex = require("spidex");
var async = require("async");
var TaskQueue = require("../");
var taskQueue = new TaskQueue(10);

function getItem(list, taskObject) {
    var url = taskObject.task.url;

    if(!list || !list.length) {
        return;
    }

    var reg = /<div class="item-inner gray">\s*<a.* href=".*">(\d*:\d*).*<\/a>\s*<\/div>[\s\S]*?<a class="block" href="http:\/\/moe.fm\/song\/(.*)">(.*)<\/a>/;
    for(var i = 0; i < list.length; i++) {
        var cur = i;
        var result = reg.exec(list[cur]);
        
        if(!result || result.length !== 4) {
            continue;
        }

        console.log("  [" + result[2] + "] - 「" + result[3] + "」(" + result[1] + ")")
    }
}

function parseAlbum(taskObject) {
    var url = taskObject.task.url;

    spidex.get(url, function(html, status) {
        var reg = /<div class="item-inner gray">\s*<a.* href=".*">(\d*:\d*).*<\/a>\s*<\/div>[\s\S]*?<a class="block" href="http:\/\/moe.fm\/song\/(.*)">(.*)<\/a>/g;
        var result = html.match(reg);

        getItem(result, taskObject);

        taskQueue.taskDone(taskObject, true);
    }).on("error", function(err) {
        parseAlbum(taskObject);
    });
}

function parseIndex(taskObject) {
    var url = taskObject.task.url;
    async.waterfall([
        function(callback) {
            spidex.get(url, function(html, status) {
                var reg = /<h3 class="browse-title">\s*<a title=".*" href=".*">.*<\/a>\s*<\/h3>/g;
                var result = html.match(reg);

                if(null === result) result = [];

                callback(null, result);
            });
        }
    ], function(err, result) {
        var reg = /<h3 class="browse-title">\s*<a title=".*" href="(.*)">.*<\/a>\s*<\/h3>/;

        for(var i = 0; i < result.length; i++) {
            var res = reg.exec(result[i]);
            if(res.length !== 2) continue;

            taskQueue.push({ url: res[1], page: taskObject.task.page }, parseAlbum/**, true*/);
        }

        taskQueue.taskDone(taskObject, true);
    });
}

for(var i = 1; i <= 33; i++) {
    var url = "http://moe.fm/albums/page/" + i + "?tag=%E6%9D%B1%E6%96%B9";
    taskQueue.push({ url: url, page: i }, parseIndex, true);
}
