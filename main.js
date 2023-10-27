const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const moment = require('moment');
const port = 3000;


var day = undefined;
let id;
let get_id;
let memo_id;
let task_id;



//静的ファイル
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());




app.use(
    session({
        secret: 'mysecret_key',
        resave: false,
        saveUninitialized: false,
    })
);

//mysql接続
const connection = mysql.createConnection({
    host: '127.0.0.1',//localhostだとできない
    user: 'root',
    password: 'tkhs21_Koumei',
    database: 'task'
});



//mysqlへの接続確認
connection.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    }
    console.log('success');
});






app.get('/',(req,res) => {
    res.redirect('/login');
});



//ログイン画面
app.get("/login",(req,res) => {
    req.session.userId = undefined;
    connection.query(
        'SELECT * FROM users',
        (error,results) => {
            console.log(results);
            res.render('login.ejs',{error:[]});
        }
    );
    
});

//ログイン認証
app.post("/login",
    (req,res,next) => {
        const id = req.body.userId;
        const pass = req.body.password;
        const err = []
        if (id === '') {
            err.push('ユーザーIDが空です');
        }
        if (pass === '') {
            err.push('パスワードが空です');
        }
        if (err.length > 0) {
            console.log(err);
            res.render('login.ejs',{error:err});
        } else {
            next();
        }
    },
    (req,res) => {
        const id = req.body.userId;
        const pass = req.body.password;
        connection.query(
            'select * from users where user_id = ?',
            [id],
            (error,results) => {
                if (error) {
                    console.log(error);
                    res.redirect('/login');
                    return;
                }
                if(results.length > 0) {
                    if ( pass === results[0].password) {
                        req.session.userId = results[0].id;
                        console.log('認証に成功');
                        res.redirect('/index');
                    } else {
                        console.log('パスワードが違う');
                        res.redirect('/login');
                    }
                    
                } else {
                    console.log('ユーザーIDが違う');
                    res.redirect('/login');
                }
                
                
                
            }
        );
    }
);

//新規登録画面に遷移
app.get('/new_account',(req,res) => {
    res.render('new_acc.ejs',{error:[]});
})

//新規登録の処理
app.post('/new_acc',
    (req,res,next) => {
        const id = req.body.userId;
        const name = req.body.userName;
        const pass = req.body.password;
        const err = []
        if (id === '') {
            err.push('ユーザーIDが空です');
        }
        if (name === '') {
            err.push('ユーザーネームが空です');
        }
        if (pass === '') {
            err.push('パスワードが空です');
        }
        if (err.length > 0) {
            console.log(err);
            res.render('new_acc.ejs',{error:err});
        } else {
            next();
        }
    },
    (req,res,next) => {
        const id = req.body.userId;
        const err = []
        connection.query(
            'select * from users where user_id = ?',
            [id],
            (error,results) => {
                if(results.length > 0) {
                    err.push('このユーザーIDはすでに使われています');
                }
                if (err.length > 0) {
                    res.render('new_acc.ejs',{error:err});
                } else {
                    next();
                }
            }
        )
    },
    (req,res) => {
        const id = req.body.userId;
        const name = req.body.userName;
        const pass = req.body.password;
        connection.query(
            'insert into users (user_id,password,name) values (?, ?, ?)',
            [id, pass, name],
            (error,results) => {
                connection.query(
                    'select * from users where user_id = ?',
                    [id],
                    (error_l,results_l) => {
                        if(results_l.length > 0) {
                            console.log(results_l)
                            if ( pass === results_l[0].password) {
                                req.session.userId = results_l[0].id;
                                console.log('認証に成功');
                                res.redirect('/index');
                            } else {
                                console.log('パスワードが違う');
                                res.redirect('/login');
                            }
                            
                        } else {
                            res.redirect('/new_account');
                        }
                    }
                );
            }
        )
    }
);

//ログイン後の画面
app.get('/index',(req,res) => {
    console.log(req.session.userId);
    if(req.session.userId === undefined) {
        console.log('ログインしていない');
        res.redirect('/login');
    } else {
        connection.query(
            'select * from room_member where user_id=?',
            [req.session.userId],
            (error,results) => {
                console.log(results);
                
                const get_today = new Date();
                const year = get_today.getFullYear();
                const month = (get_today.getMonth() + 1).toString().padStart(2,"0");
                const day = (get_today.getDate()).toString().padStart(2,"0");               
                const today = `${year}${month}${day}`;
                connection.query(
                    'select * from todo where day=? && todo_usr_id=?',
                    [today,req.session.userId],
                    (error1,results1) => {
                        const now_day = new Date();
                        const dayOfWeek = now_day.getDay(); // 曜日を取得
                        const daysUntilSunday = 7 - dayOfWeek; // 今日から日曜日までの日数を計算
                        let sun_year;
                        let sun_month;
                        let sun_day;
                        if (daysUntilSunday != 7) {
                            const sundayDate = new Date();
                            sundayDate.setDate(now_day.getDate() + daysUntilSunday)
                            sun_year = sundayDate.getFullYear();
                            sun_month = (sundayDate.getMonth() + 1).toString().padStart(2,"0"); // 月は0から11で表現されるため、1を足して正確な月を取得
                            sun_day = (sundayDate.getDate()).toString().padStart(2,"0");
                            
                        } else {
                            const sundayDate = new Date();
                            sun_year = sundayDate.getFullYear();
                            sun_month = (get_today.getMonth() + 1).toString().padStart(2,"0");
                            sun_day = (get_today.getDate()).toString().padStart(2,"0");
                        }
                        const today_ver2 = `${year}-${month}-${day}`
                        const sunday = `${sun_year}-${sun_month}-${sun_day}`

                        connection.query(
                            'select * from task_content where user_id=? && ? <= Deadline && Deadline <= ?',
                            [req.session.userId,today_ver2,sunday],
                            (error2,results2) => {
                                const room = {};
                                if(results.length > 0 ) {
                                    res.render('index.ejs',{room:results,todo:results1,task:results2,moment:moment});
                                } else {
                                    res.render('index.ejs',{room:[],todo:results1,task:results2,moment:moment});
                                }
                            }
                        )                       
                    }
                )
                
                
            }
        )
        
    }
    
});
app.post('/room_url',(req,res) => {
    const teamID = req.body.id;
    get_id = teamID;
    const url = `/redirected-endpoint?id=${teamID}`;
    const returnData = {
        redirectUrl: url
    }
    res.json(returnData);
})

//タスク管理
app.get("/task",(req,res) => {
    if(req.session.userId === undefined) {
        console.log('ログインしていない');
        res.redirect('/login');
    } else {
        connection.query(
            'select * from users where id=?',
            [req.session.userId],
            (error_1,results) => {
                console.log(error_1)
                console.log(results);
                connection.query(
                    'select * from task_content where user_id=?',
                    [req.session.userId],
                    (error_2,results_2) => {
                        connection.query(
                            'select * from room_member where user_id=?',
                            [req.session.userId],
                            (error,results3) => {
                                const room = {};
                                if(results3.length > 0 ) {
                                    res.render('task.ejs',{items:results_2,info:results,moment:moment,room:results3});
                                } else {
                                    res.render('task.ejs',{items:results_2,info:results,moment:moment,room:[]});
                                }
                                
                            }
                        );
                    }
                    //,items: results_2
                );
                
            }
        );
        
        
    }
    
});

//タスクを追加処理
app.post('/add',(req,res) => {
    const inputData = req.body.task;
    const status = req.body.status;
    const deadline = req.body.deadline;
    const priority = req.body.priority;
    console.log(inputData);
    console.log(status);
    console.log(deadline);
    console.log(priority);
    connection.query(
        'INSERT INTO task_content (user_id,taskName,status,Deadline,priority) VALUES(?, ?, ?, ?, ?)',
        [req.session.userId,inputData,status,deadline,priority],
        (error,results) => {
            res.redirect('/task');
        }
    );
});

app.post('/taskDetail',(req,res) => {
    task_id = req.body.id;
    connection.query(
        'select * from task_content where user_id=? && taskNumber=?',
        [req.session.userId,task_id],
        (error,results) => {
            console.log(results);
            const task_name = results[0].taskName;
            const task_deadline = results[0].Deadline;
            const task_status = results[0].status;
            const task_priority = results[0].priority;
            const dateObj = new Date(task_deadline);
            console.log(task_deadline);
            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth()+1).toString().padStart(2,"0")
            const day = dateObj.getDate().toString().padStart(2,"0");
            const format = `${year}-${month}-${day}`;
            console.log(format);
            const data = {
                message: 'Data received successfully',
                name: task_name,
                deadline: format,
                status: task_status,
                priority: task_priority,
            }
            res.json(data);
        }
    );

});

app.post('/task_update',(req,res) => {
    const action = req.body.action;
    const task_name = req.body.detail_name;
    const task_deadline = req.body.detail_deadline;
    const task_status = req.body.detail_status;      
    const task_priority = req.body.detail_priority;
    if(action==='更新') {
        console.log('更新');
        if(task_id != undefined) {
            connection.query(
                'update task_content set taskName=?, status=?, Deadline=?,priority=? where user_id=? && taskNumber=?',
                [task_name,task_status,task_deadline,task_priority,req.session.userId,task_id],
                (error,result) => {
                    console.log(result);
                    task_id = undefined;
                    res.redirect('/task');
                }
            )
        }
    } else if (action==='削除') {
        console.log('削除');
        if(task_id != undefined) {
            connection.query(
                'delete from task_content where user_id=? && taskNumber=?',
                [req.session.userId,task_id],
                (error,reuslt) => {
                    task_id = undefined;
                    res.redirect('/task')                   
                }
            )
        }
    }
});
//メモ画面
app.get('/memo',(req,res) => {
    if(req.session.userId === undefined) {
        console.log('ログインしていない');
        res.redirect('/login');
    } else {
        connection.query(
            'select * from memo where memo_usr_id = ?',
            [req.session.userId],
            (error,results) => {
                connection.query(
                    'select * from room_member where user_id=?',
                    [req.session.userId],
                    (error1,results1) => {
                        const room = {};
                        if(results1.length > 0 ) {
                            res.render('memo.ejs',{info:results,room:results1});
                        } else {
                            res.render('memo.ejs',{info:results,room:[]});
                        }
                        
                    }
                )
            }
        );

    }
    
    
});
app.post('/memo',(req,res) => {
    const action = req.body.action;
    const topic = req.body.topic;
    const sentence = req.body.memo_content;
    console.log(action);
    if(action === '追加') {
        if ((topic === '' && sentence === '') || sentence === '') {
            res.redirect('/memo');
        } else {
            connection.query(
                'insert into memo (memo_usr_id,title,memo_cont) values(?, ?, ?)',
                [req.session.userId,topic,sentence],
                (error,results) => {
                    res.redirect('/memo');
                }
            );
        }
    } else if(action==='削除'){
        if((topic === '' && sentence === '') || sentence === '') {
            res.redirect('/memo');
        } else {
            connection.query(
                'delete from memo where id=? && memo_usr_id=?',
                [memo_id,req.session.userId],
                (error,results) => {
                    res.redirect('/memo');
                }
            )
        }
    } else if(action==='更新') {
        if((topic === '' && sentence === '') || sentence === '' || memo_id === undefined) {
            res.redirect('/memo');
        } else {
            connection.query(
                'update memo set title = ?,memo_cont = ? where id=? && memo_usr_id=?',
                [topic,sentence,memo_id,req.session.userId],
                (error,results) => {
                    res.redirect('/memo');
                }
            )
        }
    }
});

app.post('/send_memo',(req,res) => {
    const sendId = req.body.id;
    memo_id = sendId;
    connection.query(
        'select * from memo where id=? and memo_usr_id=?',
        [sendId,req.session.userId],
        (error,results) => {
            const reData = {
                title: results[0].title,
                contents: results[0].memo_cont,
                message: 'Data updated successfully'
            }
            res.json(reData)
        }
    )
})

app.get('/todo',(req,res) => {
    if(req.session.userId === undefined) {
        console.log('ログインしていない');
        res.redirect('/login');
    } else {
        connection.query(
            'select * from room_member where user_id=?',
            [req.session.userId],
            (error,results) => {
                const room = {};
                if(results.length > 0 ) {
                    res.render('todo.ejs',{room:results});
                } else {
                    res.render('todo.ejs',{room:[]});
                }
                
            }
        );
    }
    
})

app.post('/sendId', (req, res) => {
    const receivedId = req.body.id;
    console.log('Received ID:', receivedId);
    day = receivedId;
    connection.query(
        'select * from todo where day=? and todo_usr_id=?',
        [day,req.session.userId],
        (error,results) => {
            let todoList = {}
            let todo = [];
            let status = [];
            results.forEach((result) => {
                todo.push(result.contents);
                status.push(result.checkStatus);
            });
            console.log(todo);
            console.log(status);
            const responseData = {
                day: receivedId,
                todo: todo,
                status: status,
                message: 'Data updated successfully'
            }
            res.json(responseData);
        }
    )
});

app.post('/sendValue',(req,res) => {
    const sentence = req.body.value;
    console.log(sentence);
    if(sentence === '' || day === undefined) {
        res.redirect('/todo');
    } else {
        connection.query(
            'insert into todo values(?, ?, ?,false)',
            [day,req.session.userId,sentence],
            (error,results) => {
                console.log(error);
                const responseData = {
                    value : sentence,
                    message: 'Data updated successfully'
                }
                res.json(responseData);
            }
        )
    }
});
app.post('/statusSave',(req,res) => {
    const status = req.body.check;
    console.log(status);
    status.forEach((item) => {
        console.log(item.isChecked);
        connection.query(
            'update todo set checkStatus = ? where day=? && todo_usr_id=? && contents=?',
            [item.isChecked,day,req.session.userId,item.id],
            (error,results) => {
                console.log(error);
                console.log(results);
            }
        )
    })
    
})


//タスク共有
app.get('/share',(req,res) => {
    if(req.session.userId === undefined) {
        console.log('ログインしていない');
        res.redirect('/login');
    } else {
        try {

            connection.query(
                'select * from room_member where user_id=?',
                [req.session.userId],
                (error,results) => {
                    console.log(results)
                    connection.query(
                        'select * from room_member where user_id=?',
                        [req.session.userId],
                        (err,resl) => {
                            if(results.length > 0) {
                                async function processRooms() {
                                    const rooms = [];
                                  
                                    for (const room of results) {
                                        const project = room.room;
                                    
                                        try {
                                            const queryResult = await new Promise((resolve, reject) => {
                                            connection.query(
                                                'select room_id,roomName from share_room where room_id=?',
                                                [project],
                                                (error, results) => {
                                                if (error) {
                                                    reject(error);
                                                } else {
                                                    resolve(results);
                                                }
                                                }
                                            );
                                            });
                                    
                                            if (queryResult.length > 0) {
                                            rooms.push(queryResult[0]);
                                            }
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }
                                    
                                    res.render('share.ejs', { rooms: rooms,team:resl });
                                }
                                  
                                if (results.length > 0) {
                                    processRooms();
                                }
                                  
                            } else {
                                res.render('share.ejs',{rooms:[],team:resl});
                            }
                        }
                    )                  
                }
            );
        } catch (error) {
            console.error(error)
        }
    }
});

app.post('/share/team',(req,res) => {
    const teamName = req.body.teamName;
    const teamID = req.body.teamID;
    const teamPW = req.body.teamPW;
    if(teamName==='' || teamID==='' || teamPW==='') {
        console.log('チーム追加に失敗');
        res.redirect('/share');
        
    } else {
        connection.query(
            'insert into share_room values(?, ?, ?)',
            [teamID,teamPW,teamName],
            (error,results) => {
                console.log(teamID);
                connection.query(
                    'insert into room_member values(?, ?)',
                    [teamID,req.session.userId],
                    (error,results) => {
                        res.redirect('/share');
                    }
                )
                
            }
        )
    }
    
});
app.post('/share/join',(req,res) => {
    const teamID = req.body.teamID;
    const teamPW = req.body.teamPW;
    if(teamID==='' || teamPW==='') {
        res.redirect('/share');
    } else {
        connection.query(
            'select (room_id) from share_room where room_id=? and password=?',
            [teamID,teamPW],
            (error,results) => {
                console.log(results)
                if(results.length >= 2) {
                    console.log('すでに参加している')
                    res.redirect('/share');
                } else {
                    const room_id = results[0].room_id;
                    console.log(room_id);
                    connection.query(
                        'insert into room_member values(?, ?)',
                        [room_id,req.session.userId],
                        (error,results) => {
                            res.redirect('/share');
                        }
                    )                  
                }
                
            }
        )
    }
});
app.post('/send_share',(req,res) => {
    console.log(req.body.id);
    get_id = req.body.id;
    const getData = {
        message: 'Data received successfully',
        id: get_id,
        redirectUrl: `/redirected-endpoint?id=${get_id}`
    }
    res.json(getData);
});
app.get('/redirected-endpoint',(req,res) => {
    id = req.query.id;

    if(req.session.userId === undefined) {
        console.log('ログインしていない');
        res.redirect('/login');
    } else {
        connection.query(
            'select * from share_task where room=?',
            [id],
            (error,results) => {
                connection.query(
                    'select * from room_member where user_id=?',
                    [req.session.userId],
                    (err,rest) => {
                        res.render('room.ejs',{items:results,moment:moment,rooms:rest});
                    }
                )
                              
            }
        )
        
    }
    
});

app.post('/share_add',(req,res) => {
    console.log(get_id);
    const inputData = req.body.task;
    const manager = req.body.manager;
    const status = req.body.status;
    const deadline = req.body.deadline;
    const priority = req.body.priority;
    console.log(inputData);
    console.log(status);
    console.log(deadline);
    console.log(priority);
    connection.query(
        'INSERT INTO share_task (usr,room,taskName,manager,Deadline,priority,status) VALUES(?, ?, ?, ?, ?, ?, ?)',
        [req.session.userId,id,inputData,manager,deadline,priority,status],
        (error,results) => {
            console.log(error);
            res.redirect(`/redirected-endpoint?id=${get_id}`);
        }
    )
});
app.post('/room_update',(res,req) => {
    console.log(req.body);
});
app.post('/room_taskDetail',(req,res) => {
    task_id = req.body.id;
    connection.query(
        'select * from share_task where usr=? && taskNumber=? && room=?',
        [req.session.userId,task_id,get_id],
        (error,results) => {
            console.log(results);
            const task_name = results[0].taskName;
            const task_deadline = results[0].Deadline;
            const task_status = results[0].status;
            const task_priority = results[0].priority;
            const task_manager = results[0].manager;
            const dateObj = new Date(task_deadline);
            console.log(task_deadline);
            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth()+1).toString().padStart(2,"0")
            const day = dateObj.getDate().toString().padStart(2,"0");
            const format = `${year}-${month}-${day}`;
            console.log(format);
            const data = {
                message: 'Data received successfully',
                name: task_name,
                deadline: format,
                status: task_status,
                priority: task_priority,
                manager: task_manager
            }
            res.json(data);
        }
    );

});
app.post('/room_up',(req,res) => {
    const action = req.body.action;
    const task_name = req.body.detail_name;
    const task_deadline = req.body.detail_deadline;
    const task_status = req.body.detail_status;      
    const task_priority = req.body.detail_priority;
    const task_manager = req.body.detailManager;
    console.log(req.body);
    if(action==='更新') {
        console.log('更新');
        if(task_id != undefined) {
            connection.query(
                'update share_task set taskName=?,manager=?, Deadline=?, priority=?, status=? where usr=? && taskNumber=? && room=?',
                [task_name,task_manager,task_deadline,task_priority ,task_status,req.session.userId,task_id,get_id],
                (error,result) => {
                    console.log(result);
                    console.log(error);
                    task_id = undefined;
                    res.redirect(`/redirected-endpoint?id=${get_id}`);
                }
            )
        }
    } else if (action==='削除') {
        console.log('削除');
        if(task_id != undefined) {
            connection.query(
                'delete from share_task where usr=? && taskNumber=? && room=?',
                [req.session.userId,task_id,get_id],
                (error,reuslt) => {
                    task_id = undefined;
                    res.redirect(`/redirected-endpoint?id=${get_id}`);                
                }
            )
        }
    } else {
        console.log('エラー');
        res.redirect(`/redirected-endpoint?id=${get_id}`)
    }
});
//サーバー起動
app.listen(port,() => {
  console.log('サーバーが起動しました');
});