

'use strict';
var id = 0;
var mytable = document.querySelectorAll('td');

console.log(mytable);
mytable.forEach(td => {
    td.addEventListener('dblclick', () => {
      console.log('Cell clicked:', td.id);
      let result = td.id.substring(5);
      console.log(result);
      fetch('/send_memo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: result })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(response);
            return response.json();
        })
        .then(data => {
            const memo_title = document.getElementById('memo_title');
            const textarea = document.getElementById('textarea');
            

            memo_title.value = data.title;
            textarea.value = data.contents;
            
            console.log(data.message);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
        
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





