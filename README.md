# Webアプリのセキュリティ入門 ハンズオン

2026/08/17 輪講。わざと脆弱なチャットアプリで、**XSS / CSRF / SQLインジェクション** を手を動かして体験します。
このファイルは当日の「操作カンペ」です（立ち上げ方・各セクションで入力するもの・戻し方）。

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

## 3. 各セクションで入力するもの

進める順番は **② XSS → ③ CSRF → ④ SQLインジェクション**。

### ② XSS
チャットの入力欄に、次を**丸ごとコピペして投稿**（偽のウイルス警告ポップアップが出る）:

```
<img src=x onerror="var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:sans-serif';var p=document.createElement('div');p.style.cssText='width:400px;background:#1b1b1b;border-radius:12px;padding:30px;text-align:center;box-shadow:0 12px 50px rgba(0,0,0,.6)';var ic=document.createElement('div');ic.textContent='×';ic.style.cssText='width:56px;height:56px;line-height:56px;border-radius:50%;background:#e2392b;color:#fff;font-size:34px;font-weight:bold;margin:0 auto 16px';var t=document.createElement('div');t.textContent='見つかったウイルス (5)';t.style.cssText='color:#fff;font-size:24px;font-weight:bold;margin-bottom:14px';var m=document.createElement('div');m.textContent='コンピューターが怪しいプログラムにより被害を受けています';m.style.cssText='color:#ddd;font-size:15px;line-height:1.6;margin-bottom:22px';var b=document.createElement('button');b.textContent='ウイルスを除去';b.style.cssText='background:#e2392b;color:#fff;border:0;border-radius:8px;padding:13px 30px;font-size:16px;cursor:pointer';p.appendChild(ic);p.appendChild(t);p.appendChild(m);p.appendChild(b);o.appendChild(p);document.body.appendChild(o)">
```

- 投稿後、**別タブ**で `http://localhost:3000` を開くと、別の訪問者としてポップアップが発動する
- 直す場所（クリックで該当行へ）: [app/public/app.js の 【課題2】](app/public/app.js#L31)（`innerHTML` → `textContent`）

### ③ CSRF
チャット画面上部の **「知らない人からのDM：かわいい猫の画像まとめ、見てみて！」リンクをクリック**（または別タブで `http://127.0.0.1:4000` を開く）。

- ログイン中なら、開いた瞬間に全メッセージが消える
- 直す場所（クリックで該当行へ）: [app/server.js の 【課題3】](app/server.js#L113) と [app/public/app.js の削除fetch](app/public/app.js#L85)（`GET` → `POST`）

### ④ SQLインジェクション
一度ログアウトし、ログイン画面の **ユーザー名** に次を貼る:

```
admin' --
```

- **パスワードは何でもOK**（空でも適当でも）。管理者としてログインできてしまう
- 直す場所（クリックで該当行へ）: [app/server.js の 【課題1】](app/server.js#L45)（文字列連結 → プレースホルダ）

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

## 5. 詳しい流れ

攻撃 → 自分で修正 → 再攻撃 の詳しい手順は [handson/手順書.md](handson/手順書.md)、
修正後のコードと解説は [handson/解答.md](handson/解答.md) にあります。

---

## 注意

- このアプリは**わざと攻撃できる**作りです。**localhost（自分のPC）でだけ**動かし、インターネットに公開しないこと。
- ここで学ぶ攻撃は、**自分が権限を持つ環境でのみ**試すこと。他人のサイトやサービスで試すと**不正アクセス禁止法などに触れる犯罪**です。

---

## フォルダ構成

```
260817/
├── README.md   このファイル（操作カンペ）
├── app/        脆弱なチャットアプリ（localhost:3000 と 127.0.0.1:4000）
├── attacker/   CSRF用の罠ページ
├── handson/    詳しい手順書と解答
└── slides/     発表スライド
```
