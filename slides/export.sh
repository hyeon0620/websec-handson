#!/bin/bash
# スライドを編集したあと、これを実行すると PPTX と PDF を再生成します。
#   cd slides && ./export.sh
# （初回は marp-cli の取得で少し時間がかかります。Chrome を利用するので追加DLは不要）
# 注：PPTX は各スライドが画像として入る（Googleスライド等で文字の再編集は不可）。
set -e
cd "$(dirname "$0")"
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "PPTX を書き出し中…"
npx -y @marp-team/marp-cli@latest slides.md --pptx --html --allow-local-files -o slides.pptx

echo "PDF を書き出し中…"
npx -y @marp-team/marp-cli@latest slides.md --pdf --html --allow-local-files -o slides.pdf

echo "✅ 完了: slides.pptx / slides.pdf"
