// ===========================================================================
//  画面側のJavaScript。
//  【課題2】（XSS）はこのファイルの renderMessages の中にあります。
// ===========================================================================

const $ = (sel) => document.querySelector(sel);

// ---- 表示の出し分け --------------------------------------------------------
async function refresh() {
  const me = await fetch('/api/me').then((r) => r.json());
  const loggedIn = !!me.display_name;

  $('#loginView').hidden = loggedIn;
  $('#chatView').hidden = !loggedIn;
  $('#logoutBtn').hidden = !loggedIn;
  $('#whoami').textContent = loggedIn ? `${me.display_name} でログイン中` : '未ログイン';

  if (loggedIn) renderMessages();
}

// ---- メッセージ描画 --------------------------------------------------------
async function renderMessages() {
  const messages = await fetch('/api/messages').then((r) => r.json());
  const box = $('#messages');
  box.innerHTML = '';

  for (const m of messages) {
    const row = document.createElement('div');
    row.className = 'msg';

    // ▼▼▼ 【課題2】: ここが脆弱。ユーザーの入力を innerHTML でHTMLとして描画している ▼▼▼
    //     直し方：下の row.innerHTML の3行をコメントアウトし、「正解」の4行のコメントを外す
    row.innerHTML = `<span class="time">${m.created_at}</span>
                     <span class="name">${m.username}</span>
                     <span class="body">${m.content}</span>`;

    // 正解（textContent は「ただの文字」として表示＝スクリプトが動かない）
    // const time = document.createElement('span'); time.className = 'time'; time.textContent = m.created_at;
    // const name = document.createElement('span'); name.className = 'name'; name.textContent = m.username;
    // const body = document.createElement('span'); body.className = 'body'; body.textContent = m.content;
    // row.append(time, name, body);
    // ▲▲▲ 【課題2】: ここまで ▲▲▲

    box.appendChild(row);
  }
  box.scrollTop = box.scrollHeight;
}

// ---- ログイン --------------------------------------------------------------
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: form.get('username'),
      password: form.get('password'),
    }),
  });
  if (res.ok) {
    $('#loginError').textContent = '';
    e.target.reset();
    refresh();
  } else {
    const { error } = await res.json();
    $('#loginError').textContent = error;
  }
});

$('#logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  refresh();
});

// ---- メッセージ送信 --------------------------------------------------------
$('#messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: form.get('content') }),
  });
  e.target.reset();
  renderMessages();
});

// ---- 全削除ボタン ----------------------------------------------------------
// アプリ自身の削除は fetch で呼ぶ（ページ遷移しないので「騙された」画面は出ない）。
// いまは GET。これが罠ページからも呼べてしまうのが【課題3】(CSRF)。
// 直すときは、この fetch を method:'POST' にし、server.js も app.post に変える。
$('#deleteAllLink').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/messages/delete-all'); // ← 課題3 脆弱(GET)。この行をコメントアウト
  // await fetch('/api/messages/delete-all', { method: 'POST' }); // ← 正解: このコメントを外す
  renderMessages();
});

// ---- リセット --------------------------------------------------------------
$('#resetBtn').addEventListener('click', async () => {
  await fetch('/api/reset', { method: 'POST' });
  renderMessages();
});

refresh();
