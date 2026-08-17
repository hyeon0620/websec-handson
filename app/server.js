// ===========================================================================
//  わざと脆弱なチャットアプリ（セキュリティ勉強会用）
//
//  このファイルの中に、直してもらう課題が3つ埋め込まれています。
//  「課題」で検索すると、直す場所にすぐ飛べます。
//
//    【課題1】 … SQLインジェクション（ログイン）
//    【課題2】 … XSS（メッセージ表示）… こちらは public/app.js 側
//    【課題3】 … CSRF（全メッセージ削除）
//
//  ※ このアプリは「攻撃が成功する状態」で配布しています。
//    localhost でだけ動かしてください。インターネットに公開しないこと。
// ===========================================================================
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const crypto = require('crypto');
const { db, resetMessages } = require('./db');

const app = express();
app.use(express.urlencoded({ extended: false })); // フォーム(POST)の本文を読む
app.use(express.json());
app.use(cookieParser());

// ---- ログインセッション（超簡易版）-----------------------------------------
// セッションID -> ユーザー名 の対応をメモリに持つだけ。本番はこんな作りにしない。
const sessions = new Map();

function currentUser(req) {
  const sid = req.cookies.session;
  return sid ? sessions.get(sid) : undefined;
}

// -------------------------------------------------------------------------
//  ログイン
//  【課題1】: SQLインジェクション
//
//  下の行は、ユーザーが入力した文字列をそのままSQL文に埋め込んでいる。
//  そのため username に  admin' --  と入れるだけで、
//  パスワードを知らなくても管理者としてログインできてしまう。
// -------------------------------------------------------------------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // ▼▼▼ 【課題1】: ここが脆弱。入力を文字列連結でSQLに埋め込んでいる ▼▼▼
  //   直し方：下の脆弱な2行をコメントアウトし、「正解」の3行のコメントを外す
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = db.prepare(sql).get();

  // 正解（プレースホルダ。? は必ず「値」として渡る＝SQL文の構造を壊せない）
  // const user = db
  //   .prepare('SELECT * FROM users WHERE username = ? AND password = ?')
  //   .get(username, password);
  // ▲▲▲ 【課題1】: ここまで ▲▲▲

  if (!user) {
    return res.status(401).json({ error: 'ユーザー名かパスワードが違います' });
  }

  // ログイン成功: セッションを発行してCookieに載せる
  const sid = crypto.randomUUID();
  sessions.set(sid, user.display_name);
  res.cookie('session', sid, {
    httpOnly: true,
    sameSite: 'lax', // ← CSRFの課題3に関係する。今は触らない
  });
  res.json({ display_name: user.display_name });
});

app.post('/api/logout', (req, res) => {
  sessions.delete(req.cookies.session);
  res.clearCookie('session');
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  res.json({ display_name: currentUser(req) || null });
});

// -------------------------------------------------------------------------
//  メッセージ一覧・投稿
//  （XSSの課題2は、表示する側 = public/app.js にあります）
// -------------------------------------------------------------------------
app.get('/api/messages', (req, res) => {
  const rows = db.prepare('SELECT username, content, created_at FROM messages ORDER BY id').all();
  res.json(rows);
});

app.post('/api/messages', (req, res) => {
  const name = currentUser(req);
  if (!name) return res.status(401).json({ error: 'ログインしてください' });

  const content = String(req.body.content || '');
  const now = new Date().toTimeString().slice(0, 5);
  db.prepare('INSERT INTO messages (username, content, created_at) VALUES (?, ?, ?)')
    .run(name, content, now);

  // AIアシスタントの返事（固定文のスタブ。本物のLLMは呼んでいない）
  const reply = 'なるほど、参考になります！（このAIの返事は固定文です）';
  db.prepare('INSERT INTO messages (username, content, created_at) VALUES (?, ?, ?)')
    .run('AIアシスタント', reply, now);

  res.json({ ok: true });
});

// -------------------------------------------------------------------------
//  全メッセージ削除
//  【課題3】: CSRF
//
//  問題点は2つ:
//   (1) 状態を変える操作なのに GET で受け付けている
//       → 攻撃者のページから <script>location=...</script> で呼べてしまう
//   (2) 「本当にこの画面から送られたリクエストか」を確認していない
//
//  攻撃者の罠ページ(attacker/index.html)を開くと、ログイン中のCookieが
//  一緒に飛んでいって、自分のメッセージが全部消える。
// -------------------------------------------------------------------------

// ▼▼▼ 【課題3】: ここが脆弱。状態変更なのに GET で受けている ▼▼▼
//   直し方：下の app.get の行をコメントアウトし、「正解」の app.post の行のコメントを外す
//   （app.js の削除fetch も POST にする）
app.get('/api/messages/delete-all', (req, res) => {
// app.post('/api/messages/delete-all', (req, res) => {   // ← 正解: このコメントを外す
  // ▲▲▲ 【課題3】: ここまで ▲▲▲
  const name = currentUser(req);
  if (!name) return res.status(401).send('ログインしていません');

  db.prepare('DELETE FROM messages').run();

  // 罠ページからの「ページごと移動」(Sec-Fetch-Mode: navigate)のときだけ、
  // 引っかかったことが分かる画面を出す。
  // アプリ自身の削除ボタン(fetch)から呼ばれたときはこの画面は出さない。
  if (req.get('Sec-Fetch-Mode') === 'navigate') {
    return res.send(`<!doctype html><meta charset="utf-8">
      <body style="font-family:sans-serif;text-align:center;margin-top:15vh">
        <h1>あなたのメッセージは全部消えました</h1>
        <p>あなたは「猫の画像」を見ようとしただけなのに。</p>
        <p>これが CSRF です。</p>
        <a href="http://localhost:3000/">チャットに戻る</a>
      </body>`);
  }
  res.json({ ok: true });
});

// リセット（壊れたら押して初期状態に戻す）
app.post('/api/reset', (req, res) => {
  resetMessages();
  res.json({ ok: true });
});

// ワークショップ復旧用：画面がXSSで乗っ取られても、アドレスバーに
// localhost:3000/reset と打てば初期状態に戻せる（保存された罠を消す）。
app.get('/reset', (req, res) => {
  resetMessages();
  res.redirect('/');
});

// 静的ファイル（画面）
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
  console.log('チャットアプリ:  http://localhost:3000');
});

// ===========================================================================
//  攻撃者の罠ページ用サーバー（別オリジン）
//  わざと 127.0.0.1:4000 で配信する。
//  localhost:3000 と 127.0.0.1:4000 はブラウザ的に「別サイト」扱いになるので、
//  これでCSRF（クロスサイト・リクエスト・フォージェリ）が再現できる。
// ===========================================================================
const attacker = express();
attacker.use(express.static(path.join(__dirname, '..', 'attacker')));
attacker.listen(4000, '127.0.0.1', () => {
  console.log('攻撃者の罠ページ: http://127.0.0.1:4000');
});
