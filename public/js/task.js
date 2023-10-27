'use strict';
const opener = document.getElementById("open");
const modal = document.getElementById("modal");
const closer = document.getElementById("closer");
opener.addEventListener("click", () => {
    modal.classList.add("inview");
}, false);

closer.addEventListener("click", () => {
    modal.classList.remove("inview");
}, false);

function taskClick(id) {
    console.log(id);
    fetch('/taskDetail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const detailName = document.getElementById('detailName');
        const detailpriority = document.getElementById('detailPriority');
        const detailStatus = document.getElementById('detailStatus');
        const detailDeadline = document.getElementById('detailDeadline');
        detailName.value = data.name;
        detailDeadline.value = data.deadline;
        detailpriority.selectedIndex = data.priority - 1;
        detailStatus.selectedIndex = data.status - 1;
        console.log(data.message);
    })
    .catch(error => {
        console.log('Fetch error:', error);
    });
}
function update() {
    console.log('ボタンクリック');
}

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