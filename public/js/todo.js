'use strict';
// const axios = require('axios');
const week = ['日','月','火','水','木','金','土'];
const today = new Date();
var total = 0;
let showDate = new Date(today.getFullYear(),today.getMonth(),1);
let checkboxBool = false;


//前の月表示
function prev() {
    showDate.setMonth(showDate.getMonth() -1);
    showProcess(showDate);
}
//次の月表示
function next() {
    showDate.setMonth(showDate.getMonth() + 1);
    showProcess(showDate);
}

//カレンダー表示
function showProcess(date) {
    let year = date.getFullYear();
    let month = date.getMonth();
    document.querySelector('#head_draw').innerHTML = year + '年 ' + (month + 1) + '月';
    let calendar = createProcess(year,month);
    document.querySelector('#calendar').innerHTML = calendar;
    cli(year,month);
}






// カレンダー作成
function createProcess(year, month) {
    // 曜日
    var calendar = "<table id='tdl'><tr class='dayOfWeek'>";
    for (var i = 0; i < week.length; i++) {
        calendar += "<th class='week_font'>" + week[i] + "</th>";
    }
    calendar += "</tr>";

    var count = 0;
    var startDayOfWeek = new Date(year, month, 1).getDay();
    var endDate = new Date(year, month + 1, 0).getDate();
    var lastMonthEndDate = new Date(year, month, 0).getDate();
    var row = Math.ceil((startDayOfWeek + endDate) / week.length);

    // 1行ずつ設定
    for (var i = 0; i < row; i++) {
        calendar += "<tr>";
        // 1colum単位で設定
        for (var j = 0; j < week.length; j++) {
            if (i == 0 && j < startDayOfWeek) {
                // 1行目で1日まで先月の日付を設定
                calendar += "<td class='disabled'>" + (lastMonthEndDate - startDayOfWeek + j + 1) + "</td>";
            } else if (count >= endDate) {
                // 最終行で最終日以降、翌月の日付を設定
                count++;
                calendar += "<td class='disabled'>" + (count - endDate) + "</td>";
            } else {
                // 当月の日付を曜日に照らし合わせて設定
                count++;
                if(year == today.getFullYear()
                  && month == (today.getMonth())
                  && count == today.getDate()){
                    calendar += "<td class='today'><a>" + count + "</a></td>";
                } else {
                    calendar += '<td><a>' + count + '</a></td>';
                }
            }
        }
        calendar += "</tr>";
    }

    return calendar;
}







//日付をクリックした時の処理
let cli = (year,month) => {
    //tableのIDを取得
    var mytable = document.getElementById("tdl");
    //monthの値を止める
    let mon = true;
    //javascriptの使用でmonth-1で表示されるので1を足しとく
    month += 1;
    for (var i=1; i < mytable.rows.length; i++) {
        for (var j=0; j < mytable.rows[i].cells.length; j++) {
          mytable.rows[i].cells[j].addEventListener('dblclick',(e) => {
            //クリックしたカレンダーの数字を取り出す
            let choise_click = e.target.innerHTML;
            //選択した日
            let choise_day;
            // 時々違う要素を取ることがあるのでそれを回避する
            if (choise_click >= 1 && choise_click <= 31) {
                console.log(choise_click);
                // 色々誤作動を回避するため選択した日を入れ替え
                choise_day = choise_click;
                // monthが10以下の場合01となるようにするand一度増やしたらもう増えないようにする
                if (month < 10 && mon == true) {
                    month = '0' + `${month}`;
                    //monthを01にしたのでこれ以上増やすと001となるので阻止
                    mon = false;
                }
                //dayが10以下の場合01となるようにする
                if (choise_day < 10) {
                    choise_day = '0' + `${choise_day}`;
                }
                // 年＋月＋日を連結されて保存するとき便利なようにする
                total = `${year}` + `${month}` + `${choise_day}`;
                console.log(total);
                const doc = document.getElementById('TextArea');
                
                // サーバーにデータを送信
                fetch('/sendId', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: total })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    const status = data.status;
                    const day_h2 = document.getElementById('day_h2');
                    const year = data.day.substring(0,4);
                    const month = data.day.substring(4,6);
                    const date = data.day.substring(6,8);
                    const day = `${year}年${month}月${date}日`
                    const checkboxContainer = document.getElementById('TodoList');
                    checkboxContainer.innerHTML = '';
                    const todo = data.todo;
                    let count = 0;    
                    for (const item of todo) {
                        const checkbox = document.createElement('input');
                        checkbox.type="checkbox";
                        checkbox.id = item.replace(/\s/g, '');
                        if(status[count] === 1) {
                            checkbox.checked = true;
                        }
                        const label = document.createElement('label');
                        label.setAttribute('for',checkbox.id);
                        label.appendChild(document.createTextNode(item));
                        
                        checkboxContainer.appendChild(checkbox);
                        checkboxContainer.appendChild(label);
                        checkboxContainer.appendChild(document.createElement('br'));
                        console.log(count);
                        count ++;

                    }          
                    
                    day_h2.innerHTML=day;
                    console.log(data.message);
                })
                .catch(error => {
                    console.log('Fetch error:', error);
                });
                
                
                
                
                
                
                
            }      
          });
        }
    }
    
    
}
document.getElementById('todoAdd').addEventListener('click',(e) => {
    const inputValue = document.getElementById('todoValue');
    const userInput = inputValue.value;
    console.log(userInput);
    fetch('/sendValue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value:userInput })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.value);
        const text = data.value;
        const checkboxContainer = document.getElementById('TodoList');
        const checkbox = document.createElement('input');
        checkbox.type="checkbox";
        checkbox.id = text.replace(/\s/g, '');
        const label = document.createElement('label');
        label.setAttribute('for',checkbox.id);
        label.appendChild(document.createTextNode(text));
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        checkboxContainer.appendChild(document.createElement('br'));
        inputValue.value = '';
        console.log(data.message);
    })
    .catch(error => {
        console.log('Fetch error:', error);
    });
})

const saveButton = document.getElementById('save');
saveButton.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log(checkboxes);
    const boxStatus = [];
    const checkboxStates = Array.from(checkboxes).map(checkbox => ({
      id: checkbox.id,
      isChecked: checkbox.checked
    }));
    // checkboxStates.forEach((box) => {
    //     if(box.isChecked === true) {
    //         boxStatus.push(box)
    //     }
    // })
    fetch('/statusSave',{
        method:"POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ check:checkboxStates })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(error => {
        console.log('Fetch error:', error);
    });
});

const liElements = document.querySelectorAll('.side_shareRoom li');
liElements.forEach(li => {
    li.addEventListener('dblclick', event => {
        const clickedLi = event.currentTarget;
        const id = clickedLi.id;
        console.log(`${id}`);
        fetch('/room_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            // リダイレクト先のURLを取得してリダイレクト
            window.location.href = data.redirectUrl;
        })
        .catch(error => {
            console.log(error);
        });
    });
});

function logout() {
    let logoutCheck = window.confirm('ログアウトしますか?');
    if(logoutCheck) {
        console.log('ログアウト');
        window.location.href = '/login';
    } else {
        console.log('キャンセル');
    }
}







