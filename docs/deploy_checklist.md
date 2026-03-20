# Neo-nav 本機部署 Checklist

照下面順序做，可以把本機專案整合成「GitHub Pages 真站 + Google Sheets 後端」的可測版本。

## A. 先確認本機檔案

1. 確認 [api.js](D:/Neo-nav/web/assets/api.js) 存在，而且 `SCRIPT_URL` 還是 placeholder。
2. 確認 [Code.gs](D:/Neo-nav/gas_backend/Code.gs) 存在，而且 `SPREADSHEET_ID` 已是：

```text
1UFaucXpyt_vKeP3ODQ2ukdvqjg4FML5WrjFVAtR25Lc
```

3. 確認 [deploy.yml](D:/Neo-nav/.github/workflows/deploy.yml) 存在。

## B. 先建 Apps Script，再推 GitHub

建議順序：

1. 先建 Google Sheet
2. 再建 Apps Script
3. 拿到 Web App URL 後，先填回本機 [api.js](D:/Neo-nav/web/assets/api.js)
4. 最後再 push GitHub

原因：

- GitHub Pages 第一次上線時，就會直接連到真實後端
- 可以少一次只為了補 `SCRIPT_URL` 的二次 push

## C. 建立 Google Sheet 與 Apps Script

1. 用 `everyrich@gmail.com` 登入 Google Drive。
2. 建立新的 Google Sheet，或確認目標 Sheet 的 ID 是：

```text
1UFaucXpyt_vKeP3ODQ2ukdvqjg4FML5WrjFVAtR25Lc
```

3. 如果你不是沿用這個 ID，就先停止，因為本機 [Code.gs](D:/Neo-nav/gas_backend/Code.gs) 目前已綁定這個值。
4. 到 [script.google.com](https://script.google.com/) 建新的 Apps Script 專案。
5. 貼上 [Code.gs](D:/Neo-nav/gas_backend/Code.gs) 內容。
6. 確認 `SPREADSHEET_ID` 是 `1UFaucXpyt_vKeP3ODQ2ukdvqjg4FML5WrjFVAtR25Lc`。
7. 部署成 `Web app`。
8. `Execute as` 選 `Me`。
9. `Who has access` 選 `Anyone`。
10. 複製部署完成後的 Web App URL。

## D. 把 URL 填回哪裡

1. 回到本機專案。
2. 打開 [api.js](D:/Neo-nav/web/assets/api.js)。
3. 把：

```javascript
var SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
```

改成真正的 Web App URL。

## E. 推 GitHub 與啟用 Pages

1. 使用既有 repo：`https://github.com/wegoliao/neo-nav`
2. 在 PowerShell 執行：

```powershell
Set-Location D:\Neo-nav
git status
git add .
git commit -m "feat: deployable Neo-nav v1"
git remote add origin https://github.com/wegoliao/neo-nav.git
git branch -M main
git push -u origin main
```

3. 打開 GitHub repo。
4. 進入 `Settings > Pages`。
5. 把 `Source` 設為 `GitHub Actions`。
6. 等待 `Actions` 裡的 `Deploy GitHub Pages` 成功。

## F. 怎麼測試家長頁送出

1. 打開 GitHub Pages 真網站。
2. 用密碼 `30203` 進入。
3. 進入家長頁。
4. 填最少必要欄位後送出。
5. 看頁面右上 API 狀態點是否變成正常狀態。

## G. 怎麼確認 Google Sheet 有新列

1. 回到 Google Sheet。
2. 切到 `daily_support_handoff` 工作表。
3. 確認最後一列新增了一筆今天的資料。
4. 確認 `角色` 欄位、`填報人` 欄位與其他欄位有值。

## H. 怎麼確認 GitHub Pages 真網站能打開

1. 在 GitHub repo 的 `Actions` 確認 workflow 成功。
2. 到 `Settings > Pages` 查看實際 site URL。
3. 用瀏覽器打開該 URL。
4. 確認首頁正常顯示，沒有 404。
5. 預期網址是：

```text
https://wegoliao.github.io/neo-nav/
```

## I. 怎麼測試老師看到今天與近 7 天資料

1. 先至少送出一筆家長資料與一筆老師資料。
2. 回到網站的縱覽模式。
3. 確認今天資料有顯示。
4. 確認近 7 天資料區塊不是空的。
5. 若縱覽 API 失敗，先直接用瀏覽器打開：

```text
WEB_APP_URL?action=today_summary
WEB_APP_URL?action=last_7_days
WEB_APP_URL?action=overview
```

6. 若這三個 URL 都能回 `{"result":"success"}`，代表 Apps Script 端正常。
