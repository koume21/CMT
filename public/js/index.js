'use strict';
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
const taskList = document.querySelectorAll('.list');
console.log(taskList);
taskList.forEach(task => {
    task.addEventListener('dblclick',event => {
        const clickList = event.currentTarget;
        const id = clickList.id;
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
    })
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