# GitHub Pages 設定說明

## 目標

把 `D:\Neo-nav\web` 發佈成真正可打開的 GitHub Pages 網站。

## 1. GitHub repo 資訊

目前 repo 已存在：

```text
https://github.com/wegoliao/neo-nav
```

本機只需要把 `origin` 指到這個 repo。

## 2. 本機初始化與首次推送

在 PowerShell 執行：

```powershell
Set-Location D:\Neo-nav
git init
git add .
git commit -m "feat: deployable Neo-nav v1"
git remote add origin https://github.com/wegoliao/neo-nav.git
git branch -M main
git push -u origin main
```

如果 repo 已經初始化過，就不要重跑 `git init`，直接從 `git add .` 開始。

## 3. GitHub Pages 怎麼設定

1. 打開 GitHub repo。
2. 進入 `Settings`。
3. 打開左側 `Pages`。
4. 在 `Build and deployment` 裡，把 `Source` 設成 `GitHub Actions`。
5. 本專案已提供 [deploy.yml](D:/Neo-nav/.github/workflows/deploy.yml)，之後只要 push 到 `main`，GitHub 會自動發佈 `./web`。

## 4. workflow 自動部署後，還需不需要手動選 branch

不用。

只要 `Pages > Source` 已經切到 `GitHub Actions`，之後由 workflow 接手，不需要再手動指定 `gh-pages` 或 `main` branch 當靜態來源。

## 5. 網址會長什麼樣子

本專案 repo 是 `neo-nav`，網址一般會是：

```text
https://wegoliao.github.io/neo-nav/
```

## 6. 怎麼確認已成功發佈

1. push 到 `main` 後，進入 GitHub repo 的 `Actions`。
2. 確認 `Deploy GitHub Pages` workflow 成功。
3. 回到 `Settings > Pages`，GitHub 會顯示實際 site URL。
4. 打開 site URL，確認首頁可正常載入。
