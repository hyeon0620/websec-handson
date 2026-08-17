// ---------------------------------------------------------------------------
// データベースの初期化まわり。
// SQLite を「メモリ上」に作る（ファイルを使わない）。
// → 起動のたびにまっさらな初期データから始まる。ファイルの権限エラーや、
//    前回の残骸（＝消えない罠メッセージ）で詰まることがない。
//    サーバーを再起動（Ctrl+C → npm start）すれば必ずリセットされる。
// ここは脆弱性とは関係ないので触らなくてOK。
// ---------------------------------------------------------------------------
const Database = require('better-sqlite3');

const db = new Database(':memory:');

// テーブル作成（初回のみ）
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY,
    username     TEXT UNIQUE,
    password     TEXT,          -- 本来は平文で保存しないこと。今回は説明のため平文
    display_name TEXT
  );
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY,
    username   TEXT,
    content    TEXT,
    created_at TEXT
  );
`);

// ダミーデータの投入。すでにユーザーがいれば何もしない。
function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (count > 0) return;

  const insertUser = db.prepare(
    'INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)'
  );
  insertUser.run('alice', 'alice123', 'アリス');
  insertUser.run('bob', 'bobpass', 'ボブ');
  // admin のパスワードは参加者には教えない。SQLインジェクションで突破してもらう。
  insertUser.run('admin', 'S3cr3t-Adm1n-Pw!', '管理者');

  resetMessages();
}

// メッセージを初期状態に戻す（「リセット」ボタン用）
function resetMessages() {
  db.prepare('DELETE FROM messages').run();
  const insertMsg = db.prepare(
    'INSERT INTO messages (username, content, created_at) VALUES (?, ?, ?)'
  );
  insertMsg.run('アリス', 'おはよう！今日の輪講よろしくね', '09:00');
  insertMsg.run('ボブ', 'セキュリティの話たのしみ', '09:01');
  insertMsg.run('AIアシスタント', 'なんでも聞いてくださいね（このAIの返事は固定文です）', '09:02');
}

seed();

module.exports = { db, resetMessages };
