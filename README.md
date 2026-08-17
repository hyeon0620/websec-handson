# Webアプリのセキュリティ入門 ハンズオン

2026/08/17 輪講。わざと脆弱なチャットアプリで、**XSS / CSRF / SQLインジェクション** を手を動かして体験します。
**このファイル1枚で、当日の操作・攻撃・修正（解答）まで完結**します（同じ内容の単体版は `handson/` にもあります）。

---

## 1. 事前準備（当日まで）

- **Node.js v18 以上**（確認: `node -v`）
- **Google Chrome**（このハンズオンは Chrome 前提。Safari は挙動が違うので使わない）
- コードエディタ（VS Code など）
- 初回だけ、依存をインストール:
  ```
  cd app
  npm install
  ```

---

## 2. 立ち上げ方

```
cd app
npm start
```

こう表示されれば成功:

```
チャットアプリ:  http://localhost:3000
攻撃者の罠ページ: http://127.0.0.1:4000
```

Chrome で **http://localhost:3000** を開く。

- **ログイン:** ユーザー名 `alice` / パスワード `alice123`

---

## 3. ハンズオン（攻撃 → 直す → 再攻撃）

進める順番は **② XSS → ③ CSRF → ④ SQLインジェクション**。
各セクションは **① 攻撃して成功を体験 → ② 自分で直す → ③ もう一度攻撃して失敗を確認** の3ステップ。
直す場所は、コード内を **`課題`** で検索しても飛べます。詰まったらこのまま解答をコピペしてOK。

---

### ② XSS（投稿した「文字」がスクリプトとして動く）

XSSの怖さは「保存されて **他人の** ブラウザで動く」こと。今は自分の環境なので、
**攻撃者役で投稿 → 別の訪問者役で開いて発動**、の一人二役で確認します。

**① 攻撃する** — チャットの入力欄に、次を**丸ごとコピペして投稿**（偽のウイルス警告ポップアップが出る）:

```
<img src=x onerror="var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:sans-serif';var p=document.createElement('div');p.style.cssText='width:400px;background:#1b1b1b;border-radius:12px;padding:30px;text-align:center;box-shadow:0 12px 50px rgba(0,0,0,.6)';var ic=document.createElement('div');ic.textContent='×';ic.style.cssText='width:56px;height:56px;line-height:56px;border-radius:50%;background:#e2392b;color:#fff;font-size:34px;font-weight:bold;margin:0 auto 16px';var t=document.createElement('div');t.textContent='見つかったウイルス (5)';t.style.cssText='color:#fff;font-size:24px;font-weight:bold;margin-bottom:14px';var m=document.createElement('div');m.textContent='コンピューターが怪しいプログラムにより被害を受けています';m.style.cssText='color:#ddd;font-size:15px;line-height:1.6;margin-bottom:22px';var b=document.createElement('button');b.textContent='ウイルスを除去';b.style.cssText='background:#e2392b;color:#fff;border:0;border-radius:8px;padding:13px 30px;font-size:16px;cursor:pointer';p.appendChild(ic);p.appendChild(t);p.appendChild(m);p.appendChild(b);o.appendChild(p);document.body.appendChild(o)">
```

投稿後、**別タブ**で `http://localhost:3000` を開くと、別の訪問者としてポップアップが発動する。

> **なぜ成功する？** 投稿はDB（サーバー）に保存され、このページを開く人**全員**の画面で発動する。
> 攻撃者は投稿したらもういない。今回は脅し文句だけだが、本物なら Cookie を盗んでなりすましたり、
> 偽ログイン画面で入力を抜いたりできる。stored XSS はサーバー保存なので、
> **ブラウザのキャッシュを消しても消えない**（＝この怖さそのもの）。

**② 直す** — [app/public/app.js の 【課題2】](app/public/app.js#L31)

修正前（脆弱）: ユーザー入力を `innerHTML`（＝HTMLとして解釈）で描画している。

```js
row.innerHTML = `<span class="time">${m.created_at}</span>
                 <span class="name">${m.username}</span>
                 <span class="body">${m.content}</span>`;
```

修正後（安全）: `textContent`（＝ただの文字）で組み立てる。

```js
const time = document.createElement('span');
time.className = 'time';
time.textContent = m.created_at;

const name = document.createElement('span');
name.className = 'name';
name.textContent = m.username;

const body = document.createElement('span');
body.className = 'body';
body.textContent = m.content;   // ← ここが肝。文字は文字のまま表示される

row.append(time, name, body);
```

> **なぜ防げる？** `textContent` は渡した文字列を **100%ただの文字として表示**する。
> `<img src=x onerror=...>` と投稿されても `<` `>` が記号として画面に出るだけで、
> **HTMLタグやスクリプトとしては解釈されない**。
> （React などが比較的安全なのは既定でこのエスケープを自動でやるから。ただし `dangerouslySetInnerHTML` を使うと同じ穴が空く）

**③ 再攻撃** — 同じペイロードをもう一度投稿し、別タブで開く。
→ 今度はポップアップにならず、`<img src=x ...>` という**文字がそのまま表示される**＝安全。

---

### ③ CSRF（罠ページを開いただけでデータが消える）

**① 攻撃する** — ログイン中に、チャット画面上部の
**「知らない人からのDM：かわいい猫の画像まとめ、見てみて！」リンクをクリック**（または別タブで `http://127.0.0.1:4000` を開く）。
→ 見た目は猫の画像まとめ。でも開いた瞬間、**全メッセージが消える**。

> **なぜ成功する？** 罠ページが裏で `localhost:3000` の削除URLへアクセスし、
> そのとき**あなたのログインCookieが一緒に送られる**から。サーバーからは「本人からの正規のリクエスト」に見える。
> `localhost:3000`（アプリ）と `127.0.0.1:4000`（罠）はブラウザ的に**別サイト**なので、ローカルでもCSRFが成立する。

**② 直す** — 原因は「状態を変える操作なのに **GET** で受けている」こと。**2か所**を POST にする。

[app/server.js の 【課題3】](app/server.js#L113)（`app.get` → `app.post`）:

```js
// 修正前
app.get('/api/messages/delete-all', (req, res) => {
// 修正後
app.post('/api/messages/delete-all', (req, res) => {
```

[app/public/app.js の削除fetch](app/public/app.js#L85)（`fetch` に `{ method: 'POST' }` を足す）:

```js
$('#deleteAllLink').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/messages/delete-all', { method: 'POST' }); // ← POST にする
  renderMessages();
});
```

> **なぜ防げる？**
> - 罠ページは `location.href` で**トップレベルのGET**を送ってくる。削除を **POST 限定**にすれば、このGETは届かなくなる。
> - では攻撃者がPOSTを送ってきたら？ → ブラウザ既定の **`SameSite=Lax`** が、**別サイトからのPOSTにはログインCookieを付けない**。だからサーバーは未ログイン扱いで弾く（このアプリは `server.js` で `sameSite: 'lax'` を明示済み）。
> - **本番の定石**は、これに加えて **CSRFトークン**（ログイン時に発行し、状態変更リクエストに必ず添付・サーバーで照合）。罠ページはトークンを知りようがないので成立しない。

**③ 再確認** — もう一度 `http://127.0.0.1:4000`（罠ページ）を開く。
→ 今度は**メッセージが消えない**。罠ページからの削除リクエストが弾かれた。

---

### ④ SQLインジェクション（パスワードを知らずにログイン）

**① 攻撃する** — 一度ログアウトし、ログイン画面の **ユーザー名** に次を貼る（**パスワードは何でもOK**）:

```
admin' --
```

→ パスワードを知らないのに **管理者としてログイン**できてしまう。

> **なぜ成功する？** サーバーは入力を**文字列連結**でSQL文に埋め込んでいる。すると:
> ```
> SELECT * FROM users WHERE username = 'admin' --' AND password = '何でも'
> ```
> `--` から後ろは SQL のコメント。**パスワードの条件がまるごと消える**。
> 入力が「データ」ではなく「SQL文の一部（コード）」として解釈された。
> （補足：同じ穴で `' UNION SELECT username, password FROM users --` を使えば、
> DBの中身を吸い出す**情報漏洩**にもつながる。今日は分かりやすい「認証突破」を体験する）

**② 直す** — [app/server.js の 【課題1】](app/server.js#L45)

修正前（脆弱）: 入力を文字列連結でSQLに貼り付けている。

```js
const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
const user = db.prepare(sql).get();
```

修正後（安全）: **プレースホルダ（`?`）** で「値」として渡す。

```js
const user = db
  .prepare('SELECT * FROM users WHERE username = ? AND password = ?')
  .get(username, password);
```

> **なぜ防げる？** `?` を使うと `username` の中身は**必ず「ただの値」として扱われる**。
> `admin' --` と入れても「`admin' --` という名前のユーザーを探す」だけになり、
> SQL文の構造（`--` でコメントアウトする、など）には**絶対に影響しない**。

**③ 再攻撃** — いったんログアウトし、また `admin' --` を試す。
→ 今度は **「ユーザー名かパスワードが違います」で弾かれる**。正規の `alice` / `alice123` はちゃんとログインできる。

---

## まとめ：明日から自分のPRで見る3つ

| 攻撃 | チェックポイント |
|---|---|
| XSS | ユーザー入力を**HTMLとして描画していないか** → `textContent` / エスケープ |
| CSRF | 状態を変えるのに**GETを使っていないか / 出どころを確認しているか** → POST + SameSite Cookie + CSRFトークン |
| SQLi | SQL文を**文字列連結していないか** → プレースホルダ(`?`)を使う |

共通する考え方は2つだけ:

- **入力を「コード」として解釈させない**（XSS・SQLi）
- **そのリクエスト、本当にウチの画面から来た？を確認する**（CSRF）

---

## 4. 戻し方・再起動

- **画面が乗っ取られた / データを初期状態に戻したい:**
  - アドレスバーに `http://localhost:3000/reset` と入れて Enter（画面が覆われていてもアドレスバーは操作できる）
  - または画面右下の **「リセット」ボタン**
- **完全に作り直す（ログイン状態も消す）:**
  ```
  Ctrl + C       # サーバーを止める
  rm -f data.db  # 古い版のDBファイルが残っていれば消す（今の版はメモリ上なので通常は無い）
  npm start      # もう一度起動
  ```
  データはメモリ上にあるので、**再起動すれば毎回まっさら**になる（ファイルの後片付けは基本不要）。

---

## 注意

- このアプリは**わざと攻撃できる**作りです。**localhost（自分のPC）でだけ**動かし、インターネットに公開しないこと。
- ここで学ぶ攻撃は、**自分が権限を持つ環境でのみ**試すこと。他人のサイトやサービスで試すと**不正アクセス禁止法などに触れる犯罪**です。

---

## フォルダ構成

```
260817/
├── README.md   このファイル（操作 + 攻撃 + 解答の全部入り）
├── app/        脆弱なチャットアプリ（localhost:3000 と 127.0.0.1:4000）
├── attacker/   CSRF用の罠ページ
├── handson/    手順書・解答（README と同じ内容の単体版）
└── slides/     発表スライド
```
