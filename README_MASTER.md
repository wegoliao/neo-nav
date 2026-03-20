# Neo-nav

## 專案資訊

- 專案定位：每日支持交班系統
- 公開顯示名稱：河堤國小 3年2班 3號 · Neo
- 核心目標：讓下一個接手的大人不用猜
- 密碼：30203
- 前端由 Claude 主導
- 後端與基建由 Codex 主導

## 專案結構

- 前端主頁：[index.html](D:/Neo-nav/web/index.html)
- 前端 API 串接：[api.js](D:/Neo-nav/web/assets/api.js)
- Apps Script 後端：[Code.gs](D:/Neo-nav/gas_backend/Code.gs)
- GitHub Pages workflow：[deploy.yml](D:/Neo-nav/.github/workflows/deploy.yml)

## 發佈摘要

1. 先完成 Google Sheets 與 Apps Script Web App，拿到真正的 Web App URL。
2. 把 Web App URL 填回 [api.js](D:/Neo-nav/web/assets/api.js) 的 `SCRIPT_URL`。
3. 推送到 GitHub 的 `main` 分支。
4. GitHub Pages 會自動發佈 `./web`。

## Git 快速指令

```powershell
Set-Location D:\Neo-nav
git init
git status
git add .
git commit -m "feat: deployable Neo-nav v1"
git remote add origin https://github.com/<github-username>/Neo-nav.git
git branch -M main
git push -u origin main
```

## GitHub Pages 摘要

- GitHub Pages 使用 [deploy.yml](D:/Neo-nav/.github/workflows/deploy.yml) 自動發布 `./web`
- `Settings > Pages > Source` 請選 `GitHub Actions`
- 啟用 workflow 後，不需要再手動選 branch 當 Pages 來源
- 網址通常會是：`https://<github-username>.github.io/Neo-nav/`

## 參考文件

- GitHub Pages：[setup_github_pages.md](D:/Neo-nav/docs/setup_github_pages.md)
- Google Apps Script：[setup_google_apps_script.md](D:/Neo-nav/docs/setup_google_apps_script.md)
- 部署 checklist：[deploy_checklist.md](D:/Neo-nav/docs/deploy_checklist.md)
