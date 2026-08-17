---
marp: true
paginate: true
size: 16:9
style: |
  section {
    background:#ffffff; color:#1f2933;
    font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif;
    font-size:24px; padding:46px 60px; justify-content:flex-start;
  }
  /* パンくず＋メッセージ（左に青バー） */
  .head { border-left:6px solid #1f5c8b; padding-left:16px; margin-bottom:26px; }
  .bc  { color:#2e7db5; font-size:17px; margin-bottom:8px; }
  .msg { font-size:29px; font-weight:600; line-height:1.42; }
  .k  { color:#2e7db5; }
  .ka { color:#e2792b; }
  code { background:#eef0f4; padding:1px 7px; border-radius:4px; font-size:0.92em; }
  /* 目次 */
  .ptitle { border-left:8px solid #1f5c8b; padding-left:14px; font-size:28px; color:#1f5c8b; font-weight:600; margin-bottom:26px; }
  .agenda { font-size:23px; line-height:2.05; margin-left:24px; }
  .agenda .num { color:#2e7db5; font-weight:700; margin-right:14px; }
  .dim { color:#c2c8ce; }
  .cur { color:#1f2933; font-weight:700; }
  /* 全体像マップ（現在地ハイライト） */
  .map { display:flex; gap:14px; justify-content:center; margin-top:14px; }
  .map .m { flex:1; text-align:center; padding:12px 0; border:2px solid #dfe3e7; border-radius:8px; color:#aeb4ba; font-size:21px; }
  .map .on { border-color:#e2792b; color:#b4600f; font-weight:700; background:#fbe7d5; }
  /* NG / OK 比較 */
  .ngok { display:flex; gap:28px; }
  .ngok .col { flex:1; }
  .hd { text-align:center; font-weight:600; padding:8px; font-size:20px; }
  .hd.ng { background:#cdd1d6; color:#1f2933; }
  .hd.ok { background:#bcd6ec; color:#123a5a; }
  .panel { border:1px solid #d8dee3; border-top:none; padding:16px; min-height:150px; }
  /* コード */
  .code { font-family:"SFMono-Regular",Consolas,monospace; background:#f4f6f8; border-left:4px solid #2e7db5; padding:12px 16px; font-size:19px; white-space:pre-wrap; line-height:1.55; }
  .code.bad { border-left-color:#e2792b; }
  /* ハンズオン枠（アクセント） */
  .hands { background:#fbe7d5; border-left:6px solid #e2792b; padding:14px 22px; border-radius:0 6px 6px 0; font-size:23px; margin-top:6px; }
  .hands b { color:#b4600f; }
  .note { color:#6b7785; font-size:19px; margin-top:12px; }
  /* ゴール */
  .goal { display:flex; flex-direction:column; gap:18px; margin-top:14px; }
  .goal .g { display:flex; gap:18px; align-items:flex-start; font-size:23px; }
  .goal .gn { flex:none; width:40px; height:40px; border-radius:50%; background:#2e7db5; color:#fff; font-weight:700; text-align:center; line-height:40px; font-size:21px; }
  .goal .g b { color:#1f2933; }
  .goal .s { display:block; color:#5a626b; font-size:18px; margin-top:2px; }
  /* センター系 */
  section.title, section.lead { justify-content:center; align-items:center; text-align:center; }
  .big { font-size:52px; color:#1f5c8b; font-weight:700; line-height:1.3; }
  .subtitle { font-size:24px; color:#4a525a; margin-top:22px; }
  .date { font-size:22px; color:#4a525a; margin-top:44px; }
  .qbox { max-width:840px; margin:70px auto 0; text-align:center; border:2px solid #1f5c8b; border-radius:6px; padding:46px 40px; font-size:34px; line-height:1.5; }
  img { display:block; margin:4px auto 0; }
  table { font-size:21px; border-collapse:collapse; margin-top:8px; }
  th { background:#e6f0f8; color:#1f5c8b; font-weight:700; }
  th,td { border:1px solid #d8dee3; padding:8px 14px; text-align:left; }
---

<!-- _class: title -->

<div class="big">Webアプリのセキュリティ入門</div>
<div class="subtitle">SQLインジェクション / XSS / CSRF を、手を動かして体験する</div>
<div class="date">2026/08/17</div>

---

<div class="head">
<div class="bc">この輪講のゴール</div>
<div class="msg">3つの攻撃を <span class="k">自分の手で成功させ</span>、<span class="k">自分で直して防ぐ</span>。そして <span class="ka">明日から使う視点</span> を持ち帰る。</div>
</div>

<div class="goal">
<div class="g"><span class="gn">1</span><div><b>3つの攻撃を "自分の手" で成功させる</b><span class="s">「本当に動いてしまう」を体験する</span></div></div>
<div class="g"><span class="gn">2</span><div><b>自分で直して、攻撃が防げることを確認する</b><span class="s">なぜ防げるのかを自分の言葉で説明できる</span></div></div>
<div class="g"><span class="gn">3</span><div><b>明日の PR で使う 3つのチェックポイントを持ち帰る</b><span class="s">SQL・画面描画・状態変更の見かた（詳細は最後に）</span></div></div>
</div>

---

<div class="ptitle">目次</div>

<div class="agenda">
<span class="num">1.</span> 導入 ― なぜ他人事じゃないのか<br>
<span class="num">2.</span> XSS（クロスサイト・スクリプティング）<br>
<span class="num">3.</span> CSRF（クロスサイト・リクエスト・フォージェリ）<br>
<span class="num">4.</span> SQLインジェクション<br>
<span class="num">5.</span> まとめ ― 明日から使うチェックリスト
</div>

---

<!-- _class: q -->

<div class="head">
<div class="bc">1. 導入</div>
</div>

<div class="qbox">
その入力・リクエスト、<br>あなたは <b>信じすぎ</b> ていませんか？
</div>

---

<div class="head">
<div class="bc">1. 導入 ＞ 実際に起きた事件（パソコン遠隔操作事件）</div>
<div class="msg">サイトの脆弱性を突いた <span class="ka">CSRF攻撃</span> で、<span class="k">無実の人が次々と誤認逮捕</span>された（2012年）。</div>
</div>

- **2012年6〜9月**：何者かが他人のPCを操り、殺害・爆破予告など **13件の犯罪予告** を書き込む
- 著名人を含む **複数の容疑者が逮捕** される
- だが調査で、PCに **マルウェアが仕込まれ遠隔操作** されていたと判明 → **全員が誤認逮捕**
- 真相は **予告サイトの脆弱性を突いた CSRF 攻撃**。真犯人の逮捕は 2013年2月

<div class="note">たった一つの "仕込まれたリクエスト" が、無実の人の人生を変えた。攻撃は入力やリクエストを通じて入ってくる——だから軽視できない。まず "どんな被害になるか" を見てみる。</div>

---

<div class="head">
<div class="bc">1. 導入 ＞ なぜ自分ごとなのか</div>
<div class="msg">Webアプリの穴は <span class="ka">なりすまし・改ざん・認証突破</span> に直結する。今日の3つで、その代表例を自分の手で体験する。</div>
</div>

| 代表的な被害 | それを主に起こす攻撃 |
|---|---|
| **なりすまし**（Cookie・セッションを奪われる） | XSS |
| **改ざん・不正操作**（本人として勝手に実行される） | CSRF |
| **認証突破**（パスワードを知らずにログイン） | SQLインジェクション |

<div class="note">特別な道具は要らない。ブラウザに文字を打つだけで起きることもある。今日はそれを自分の手で確かめる。</div>

---

<div class="head">
<div class="bc">1. 導入 ＞ そもそも Web アプリはどう動く？</div>
<div class="msg">Webアプリは <span class="k">ブラウザ・サーバー・データベース</span> のやり取りで動き、ログイン状態は <span class="ka">Cookie</span> で覚えている。</div>
</div>

![w:860](diagrams/normal-flow.svg)

---

<div class="head">
<div class="bc">1. 導入 ＞ 認証（ログイン）はこう動く</div>
<div class="msg">ログインに成功すると、サーバーは <span class="ka">"合言葉"（セッションID）を Cookie で発行</span>。以降ブラウザは<span class="k">毎回そのCookieを自動で送る</span>。</div>
</div>

<div class="code">// ① ログイン成功時：サーバーが "合言葉" を Cookie に載せて返す
res.cookie('session', 合言葉)

// ② 以降のリクエスト：ブラウザが自動で Cookie を付ける
//    → サーバーは Cookie を見て「これは アリス だ」と分かる（＝ログイン状態）
</div>

<div class="note">この「自動で付く」性質が、あとで <span class="k">CSRF</span> に悪用される。ここでは「Cookie＝ログイン状態の合言葉」とだけ押さえればOK。</div>

---

<div class="head">
<div class="bc">1. 導入 ＞ 脆弱性とは</div>
<div class="msg">脆弱性とは、この正常な流れの<span class="ka">どこかが破られる</span>こと。原因はどれも<span class="k">入力を信じすぎる／出どころを確認しない</span>のどちらか。</div>
</div>

![w:900](diagrams/flow-attacks.svg)

---

<div class="head">
<div class="bc">1. 導入 ＞ 本日の進め方</div>
<div class="msg">自作の脆弱チャットで、<span class="k">攻撃 → 自分で修正 → 再攻撃</span>を自分の手で体験する。</div>
</div>

- **① 攻撃する** … 用意したペイロードを貼って、成功を体験
- **② 自分で直す** … コード内の `課題` を検索して1〜2行を修正
- **③ もう一度攻撃する** … さっきの攻撃が失敗することを確認

---

<div class="ptitle">目次</div>

<div class="agenda">
<span class="num">1.</span> <span class="dim">導入 ― なぜ他人事じゃないのか</span><br>
<span class="num">2.</span> <span class="cur">XSS（クロスサイト・スクリプティング）</span><br>
<span class="num">3.</span> <span class="dim">CSRF（クロスサイト・リクエスト・フォージェリ）</span><br>
<span class="num">4.</span> <span class="dim">SQLインジェクション</span><br>
<span class="num">5.</span> <span class="dim">まとめ ― 明日から使うチェックリスト</span>
</div>

---

<!-- _class: q -->

<div class="head">
<div class="bc">2. XSS</div>
</div>

<div class="qbox">
掲示板に投稿した「文字」が、<br><b>プログラムとして動く</b>としたら？
</div>

---

<div class="head">
<div class="bc">2. XSS ＞ 仕組み</div>
<div class="msg">入力を<span class="k">HTMLとして描画</span>すると、投稿が<span class="ka">閲覧者全員のブラウザ</span>でスクリプトとして実行される。</div>
</div>

![w:900](diagrams/xss.svg)

---

<div class="head">
<div class="bc">2. XSS ＞ ハンズオン①</div>
<div class="msg">投稿は<span class="k">保存</span>され、<span class="ka">このページを開いた人全員</span>のブラウザで発動する。"自分で自分に" ではない。</div>
</div>

<div class="hands"><b>① 攻撃者役</b> &nbsp; チャットにこのペイロードを投稿（全文は手順書からコピペ）</div>

<div class="code bad">&lt;img src=x onerror="…偽のウイルス警告ポップアップを出すJS…"&gt;</div>

<div class="hands"><b>② 被害者役</b> &nbsp; 別タブで <code>localhost:3000</code> を開く（＝別の訪問者）→ <b>偽のウイルス警告ポップアップが勝手に出る</b></div>

<div class="note">攻撃者は投稿したらもういない。<b>保存された罠</b>は、そのページを開く人すべてに発動する——これが stored XSS。<b>ブラウザのキャッシュを消しても消えない</b>（サーバーに保存されているから）。戻すにはアドレスバーに <code>localhost:3000/reset</code> と入れる。</div>

---

<div class="head">
<div class="bc">2. XSS ＞ 対策</div>
<div class="msg">入力をHTMLにせず、<span class="k">textContent</span>で「ただの文字」として表示すれば実行されない。</div>
</div>

<div class="ngok">
<div class="col">
<div class="hd ng">NG：HTMLとして解釈させる</div>
<div class="panel"><div class="code bad">row.innerHTML = m.content;</div></div>
</div>
<div class="col">
<div class="hd ok">OK：ただの文字として表示</div>
<div class="panel"><div class="code">row.textContent = m.content;</div></div>
</div>
</div>

<div class="note"><code>textContent</code> なら <code>&lt;img ...&gt;</code> はタグにならず、そのままの文字として表示される。（Reactが比較的安全なのは、これを既定で自動でやるから）</div>

---

<div class="head">
<div class="bc">2. XSS ＞ ハンズオン②</div>
<div class="msg">自分で直し、同じ投稿が<span class="k">文字列のまま</span>表示されることを確認する。</div>
</div>

<div class="hands"><b>やってみる</b> &nbsp; <code>public/app.js</code> の <code>【課題2】</code> を <code>textContent</code> に直して保存</div>

- 同じ `<img ...>` をもう一度投稿 → **アラートは出ず、文字がそのまま表示される**

---

<div class="ptitle">目次</div>

<div class="agenda">
<span class="num">1.</span> <span class="dim">導入 ― なぜ他人事じゃないのか</span><br>
<span class="num">2.</span> <span class="dim">XSS（クロスサイト・スクリプティング）</span><br>
<span class="num">3.</span> <span class="cur">CSRF（クロスサイト・リクエスト・フォージェリ）</span><br>
<span class="num">4.</span> <span class="dim">SQLインジェクション</span><br>
<span class="num">5.</span> <span class="dim">まとめ ― 明日から使うチェックリスト</span>
</div>

---

<!-- _class: q -->

<div class="head">
<div class="bc">3. CSRF</div>
</div>

<div class="qbox">
「猫の画像」を開いただけで、<br>なぜ自分のデータが<b>消える</b>？
</div>

---

<div class="head">
<div class="bc">3. CSRF ＞ 仕組み</div>
<div class="msg">罠ページが裏で<span class="k">削除API</span>を叩く。そのとき<span class="ka">ログイン中のCookieが自動で付く</span>ので、サーバーは本人だと信じて実行する。</div>
</div>

![w:880](diagrams/csrf.svg)

<div class="note"><b>Cookieは"盗まれて"いない。</b> 攻撃者は中身を見ておらず、ブラウザが localhost:3000 宛だから勝手に付けているだけ。XSSの「Cookie奪取」とはここが違う。</div>

---

<div class="head">
<div class="bc">3. CSRF ＞ ハンズオン①</div>
<div class="msg">ログイン中に「猫の画像」リンクを踏むと、<span class="ka">全メッセージが消える</span>。</div>
</div>

<div class="hands"><b>やってみる</b> &nbsp; 画面の「知らない人からのDM：猫の画像まとめ」リンクをクリック</div>

- 見た目は猫の画像ページ。なのに開いた瞬間、チャットが**全消去**される
- 現実でも、CSRFは**メール・DM・広告のリンク**を踏ませて始まる

---

<div class="head">
<div class="bc">3. CSRF ＞ 対策</div>
<div class="msg">状態変更を<span class="k">POST</span>にし、<span class="k">SameSite Cookie ＋ トークン</span>で出どころを確認する。</div>
</div>

<div class="ngok">
<div class="col">
<div class="hd ng">NG：GETで状態を変える</div>
<div class="panel"><div class="code bad">app.get(
 '/messages/delete-all', ...)</div></div>
</div>
<div class="col">
<div class="hd ok">OK：POST＋出どころ確認</div>
<div class="panel"><div class="code">app.post(
 '/messages/delete-all', ...)
// SameSite=Lax ＋ CSRFトークン</div></div>
</div>
</div>

<div class="note">POSTにすれば罠のGETナビゲーションでは呼べない。別サイトからのPOSTは <code>SameSite=Lax</code> がCookieを落とすため、未ログイン扱いで弾かれる。</div>

---

<div class="head">
<div class="bc">3. CSRF ＞ Tips：認証Cookieの付け方</div>
<div class="msg">ログイン成功時に発行する <span class="k">Cookie のフラグ</span> が、そのまま <span class="ka">XSS・CSRF の防御</span> になっている。</div>
</div>

<div class="code">// ログイン成功時、サーバーがセッションCookieを発行（server.js）
res.cookie('session', id, {
  httpOnly: true,   // JSから読めない       → XSSで盗まれにくい
  sameSite: 'lax',  // 別サイトの送信では付かない → CSRF対策
  secure: true,     // HTTPSでのみ送信
})</div>

<div class="note">たった3つのフラグ。<code>httpOnly</code> がXSS、<code>sameSite</code> がCSRFの効きどころ。付け忘れが事故に直結する。</div>

---

<div class="head">
<div class="bc">3. CSRF ＞ ハンズオン②</div>
<div class="msg">自分で直し、同じ罠リンクを踏んでも<span class="k">何も起きない</span>ことを確認する。</div>
</div>

<div class="hands"><b>やってみる</b> &nbsp; <code>server.js</code> と <code>app.js</code> の <code>【課題3】</code> を POST に直して保存</div>

- もう一度「猫の画像」リンクを踏む → **今度はメッセージが消えない**

---

<div class="ptitle">目次</div>

<div class="agenda">
<span class="num">1.</span> <span class="dim">導入 ― なぜ他人事じゃないのか</span><br>
<span class="num">2.</span> <span class="dim">XSS（クロスサイト・スクリプティング）</span><br>
<span class="num">3.</span> <span class="dim">CSRF（クロスサイト・リクエスト・フォージェリ）</span><br>
<span class="num">4.</span> <span class="cur">SQLインジェクション</span><br>
<span class="num">5.</span> <span class="dim">まとめ ― 明日から使うチェックリスト</span>
</div>

---

<!-- _class: q -->

<div class="head">
<div class="bc">4. SQLインジェクション</div>
</div>

<div class="qbox">
ユーザー名に<br><code>admin' --</code><br>と入れると、何が起きる？
</div>

---

<div class="head">
<div class="bc">4. SQLインジェクション ＞ 仕組み① 照合はこう動く</div>
<div class="msg">ログインは、入力を<span class="k">文字列連結</span>で作ったSQL文で「<span class="k">ユーザー名とパスワードが両方一致する行</span>」を探しているだけ。</div>
</div>

<div class="code">// アプリは "文字列連結" でSQL文を組み立てている（server.js）
const sql = "... WHERE username = '" + username + "' AND password = '" + password + "'"

// 正常  alice / alice123 → username='alice' AND password='alice123'  両方一致 → 成功
// 空欄  admin / (空欄)   → username='admin' AND password=''          照合が残る → 失敗
// 攻撃  admin' --        → 照合の条件ごと "--" で消す（次ページ）      → 誰でも成功
</div>

<div class="note">「文字列連結」＝入力を "文字" としてSQL文にそのまま貼り付けること。空欄パスワードは照合が <b>残る</b> ので失敗、注入は照合ごと <b>消す</b> ので成功——ここが決定的に違う。</div>

---

<div class="head">
<div class="bc">4. SQLインジェクション ＞ 仕組み② admin' -- で照合が消える</div>
<div class="msg">入力を<span class="k">文字列連結</span>でSQLに埋め込むと、入力が<span class="ka">「命令」</span>として解釈されてしまう。</div>
</div>

![w:940](diagrams/sqli.svg)

---

<div class="head">
<div class="bc">4. SQLインジェクション ＞ ハンズオン①</div>
<div class="msg">ユーザー名に <code>admin' --</code> を入れるだけで、<span class="ka">パスワードなし</span>で管理者にログインできる。</div>
</div>

<div class="hands"><b>やってみる</b> &nbsp; ログイン画面のユーザー名にこれを貼る（パスワードは適当）</div>

<div class="code bad">admin' --</div>

<div class="note">出来上がるSQL: <code>... WHERE username = 'admin' --' AND password = '...'</code> → <code>--</code> 以降がコメント化し、パスワード条件が消える。<br><b>補足</b>：同じ穴で <code>' UNION SELECT ...</code> を使えばDBの中身を吸い出す<b>情報漏洩</b>にもつながる。今日は分かりやすい「認証突破」を体験する。</div>

---

<div class="head">
<div class="bc">4. SQLインジェクション ＞ 対策</div>
<div class="msg"><span class="k">プレースホルダ</span>を使い、入力を必ず<span class="k">「値」</span>として渡せば防げる。</div>
</div>

<div class="ngok">
<div class="col">
<div class="hd ng">NG：文字列を連結してSQLを作る</div>
<div class="panel"><div class="code bad">const sql =
 `... WHERE username='${username}'`;
db.prepare(sql).get();</div></div>
</div>
<div class="col">
<div class="hd ok">OK：プレースホルダで値を渡す</div>
<div class="panel"><div class="code">db.prepare(
 '... WHERE username=? AND pw=?'
).get(username, password);</div></div>
</div>
</div>

<div class="note"><code>?</code> なら <code>admin' --</code> は「そういう名前のユーザーを探す」だけになり、文の構造を壊せない。</div>

---

<div class="head">
<div class="bc">4. SQLインジェクション ＞ ハンズオン②</div>
<div class="msg">自分で直し、同じ <code>admin' --</code> が<span class="k">弾かれる</span>ことを確認する。</div>
</div>

<div class="hands"><b>やってみる</b> &nbsp; <code>server.js</code> の <code>【課題1】</code> をプレースホルダに直して保存</div>

- もう一度 `admin' --` でログイン → **今度は「違います」で弾かれる**
- `alice` / `alice123` では今まで通りログインできることも確認

---

<div class="ptitle">目次</div>

<div class="agenda">
<span class="num">1.</span> <span class="dim">導入 ― なぜ他人事じゃないのか</span><br>
<span class="num">2.</span> <span class="dim">XSS（クロスサイト・スクリプティング）</span><br>
<span class="num">3.</span> <span class="dim">CSRF（クロスサイト・リクエスト・フォージェリ）</span><br>
<span class="num">4.</span> <span class="dim">SQLインジェクション</span><br>
<span class="num">5.</span> <span class="cur">まとめ ― 明日から使うチェックリスト</span>
</div>

---

<div class="head">
<div class="bc">5. まとめ ＞ 明日から使うチェックリスト</div>
<div class="msg">持ち帰るのは<span class="k">「入力を信じない」</span>と<span class="k">「出どころを確認する」</span>の2つだけ。</div>
</div>

| 攻撃 | 見るところ | まずい書き方 | こう直す |
|---|---|---|---|
| **XSS** | 画面表示 | `innerHTML` | **`textContent`** |
| **CSRF** | 状態変更 | `GET` で変更 | **`POST` ＋ SameSite ＋ トークン** |
| **SQLi** | SQL | 文字列連結 | **プレースホルダ `?`** |

---

<div class="head">
<div class="bc">最後に</div>
<div class="msg">ここで学んだ攻撃は、<span class="ka">自分が権限を持つ環境でのみ</span>試すこと。</div>
</div>

- 他人のサイトやサービスで試すと、**不正アクセス禁止法などに触れる犯罪**です
- 守る側の武器として使ってください

---

<!-- _class: lead -->

<div class="big">おわり</div>
<div class="subtitle">質問タイム</div>
