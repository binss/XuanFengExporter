// http://[user:password@]host:port/jsonrpc
var ARIA2_RPC = "http://192.168.199.1:6800/jsonrpc";

var $ = window.jQuery;

function downloadSelected() {
    var selected = false;
    $.getJSON('/handler/lixian/get_lixian_status.php'
    ).done(function (res) {
        $.each(res.data, function(i, task) {
            if($('#task_sel_' + task.mid).is(':checked')) {
                selected = true;
                if(task.file_size == task.comp_size && task.dl_status == TASK_STATUS['ST_UL_OK']) {
                    console.log(task);
                    addTask(task);
                }
                else {
                    alert("任务未就绪！");
                }
            }
        });
        if(!selected) {
            alert("请选择要下载的任务！");
        }
    }).fail(function () {
        alert('获取文件列表失败！');
    });
}


function addTask(task) {
    $.post('/handler/lixian/get_http_url.php', {
                hash: task.hash,
                filename: task.file_name
        }, null, 'json'
    ).done(function (res) {
        if (res && res.ret === 0) {
            console.log(res.data);
            var url = res.data.com_url;
            // break speed limit
            url = url.replace('xflx.store.cd.qq.com:443', 'xfcd.ctfs.ftn.qq.com')
                     .replace('xflx.sz.ftn.qq.com:80', 'sz.disk.ftn.qq.com')
                     .replace('xflx.cd.ftn.qq.com:80', 'cd.ctfs.ftn.qq.com')
                     .replace('xflxsrc.store.qq.com:443', 'xfxa.ctfs.ftn.qq.com');

            aria2AddTask(url, res.data.com_cookie, task.file_name);
        }
    }).fail(function () {
        alert('获取任务URL失败！');
    });
}


function aria2AddTask(taskURL, cookie, filename) {
    var task_data = {
        jsonrpc: 2.0,
        id: "qwer",
        method: 'aria2.addUri',
        params: [[taskURL], {
                    out     : filename,
                    header  : 'Cookie: FTN5K=' + cookie,
                    continue: 'true',
                    split   : '10',
                    'max-connection-per-server' : '10'
                }
            ]
    };

    $.post(ARIA2_RPC, JSON.stringify(task_data)
    ).done(function (res) {
        console.log(res);
        alert('添加成功！');
    }).fail(function () {
        alert('Aria2 RPC接口调用失败。请检查aria2是否启动、是否配置了rpc-listen-port=6800、rpc-listen-all=true、rpc-allow-origin-all=true');
    });
}

downloadSelected();

