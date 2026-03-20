# Google Apps Script 與 Google Sheets 設定說明

## 目標

把 [Code.gs](D:/Neo-nav/gas_backend/Code.gs) 部署成可供 GitHub Pages 前端呼叫的 Web App，資料寫入 Google Sheet。

## 建議使用順序

先完成 Google Sheet 和 Apps Script，再把 Web App URL 填回 [api.js](D:/Neo-nav/web/assets/api.js)。
這樣 GitHub Pages 第一次上線時，就已經是可測的完整版本。

## 1. 用 `everyrich@gmail.com` 建 Google Sheet

1. 使用 `everyrich@gmail.com` 登入 Google Drive。
2. 建立一份新的 Google 試算表，或確認你要使用的目標試算表就是這一份。
3. 目前這個專案要接的 Spreadsheet ID 已固定為：

```text
1UFaucXpyt_vKeP3ODQ2ukdvqjg4FML5WrjFVAtR25Lc
```

4. 這份 Sheet 會作為目前正式寫入資料的後端資料表。

## 2. 從 URL 取得 Spreadsheet ID

1. 打開剛建立的 Google Sheet。
2. 從瀏覽器網址列複製 Spreadsheet ID。

本次專案使用的值如下：

```text
https://docs.google.com/spreadsheets/d/1UFaucXpyt_vKeP3ODQ2ukdvqjg4FML5WrjFVAtR25Lc/edit#gid=0
```

其中 `1UFaucXpyt_vKeP3ODQ2ukdvqjg4FML5WrjFVAtR25Lc` 就是 `Spreadsheet ID`。

## 3. 把 ID 填進 `Code.gs`

1. 到 [script.google.com](https://script.google.com/)。
2. 建立新的 Apps Script 專案。
3. 把本機 [Code.gs](D:/Neo-nav/gas_backend/Code.gs) 的內容完整貼進 Apps Script 專案。
4. 在 Apps Script 編輯器裡，確認：

```javascript
SPREADSHEET_ID: '1UFaucXpyt_vKeP3ODQ2ukdvqjg4FML5WrjFVAtR25Lc'
```

如果你是直接從本機目前版本複製 [Code.gs](D:/Neo-nav/gas_backend/Code.gs)，這個值已經填好，不需要再改。

## 4. 部署成 Web App

1. 在 Apps Script 編輯器右上角選 `Deploy`。
2. 選 `New deployment`。
3. 類型選 `Web app`。
4. `Execute as` 選 `Me`。
5. `Who has access`：
   如果 GitHub Pages 網站要直接從瀏覽器呼叫，選 `Anyone` 最直接。
6. 完成授權流程。
7. 記下部署完成後的 Web App URL。

## 5. 拿到 Web App URL 後，填回 `api.js`

1. 回到本機專案。
2. 打開 [api.js](D:/Neo-nav/web/assets/api.js)。
3. 找到：

```javascript
var SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
```

4. 把 placeholder 改成真正的 Apps Script Web App URL。
5. 之後再 commit / push 到 GitHub。

## 6. 權限怎麼選

- `Execute as`: `Me`
- `Who has access`: `Anyone`

原因：
- GitHub Pages 是公開靜態網站，瀏覽器端不會帶 Google 身分
- 如果限制為特定 Google 帳號，前端公開頁面通常無法直接提交

## 7. 如何測試

### 健康檢查

在瀏覽器打開：

```text
WEB_APP_URL?action=health
```

應回傳：

```json
{"result":"success"}
```

### 最近 7 天資料

在瀏覽器或 PowerShell 測試：

```text
WEB_APP_URL?action=last_7_days
```

```powershell
Invoke-WebRequest -Uri "WEB_APP_URL?action=last_7_days" | Select-Object -ExpandProperty Content
```

### 寫入測試

把 `SCRIPT_URL` 填回 [api.js](D:/Neo-nav/web/assets/api.js) 之後，從家長頁送出一筆資料，再確認 Google Sheet 是否新增一列。

## 8. 一個月後切回 `wegoliao@gmail.com` 時，要改哪幾個地方

如果之後要把後端切回 `wegoliao@gmail.com`，請改這些地方：

1. 用 `wegoliao@gmail.com` 建立新的 Google Sheet，或讓該帳號可存取新的目標 Sheet。
2. 從新的 Sheet URL 取得新的 Spreadsheet ID。
3. 用 `wegoliao@gmail.com` 建新的 Apps Script 專案，貼上同一份 [Code.gs](D:/Neo-nav/gas_backend/Code.gs)。
4. 在新的 Apps Script 專案中，填入新的 Spreadsheet ID。
5. 重新部署成新的 Web App。
6. 把新的 Web App URL 填回 [api.js](D:/Neo-nav/web/assets/api.js) 的 `SCRIPT_URL`。
7. commit 並 push 到 GitHub，讓 GitHub Pages 使用新的後端 URL。

真正需要手動替換的值只有兩個：

- 新的 Spreadsheet ID
- 新的 Apps Script Web App URL
