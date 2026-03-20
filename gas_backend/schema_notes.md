# Google Sheets Schema Notes

本後端會把資料寫入同一張 Google Sheet 的 `daily_support_handoff` 工作表。
目前 schema 為 44 欄。
其中 `probiotic_time` 是既有 `益生菌 / 保健品時間` 欄位的 API alias，不另外新增第二個試算表欄位。

## appendRow 固定欄位順序

1. 時間戳記
2. 日期
3. 角色
4. 填報人
5. 今日狀態
6. 有無服藥
7. 有無調節
8. 家長提醒
9. 昨晚睡眠
10. 調節動作
11. 喝水量
12. 吃飯量
13. 益生菌 / 保健品時間
14. 任務進入
15. 頻繁如廁
16. 興趣度
17. 導師備註
18. OT任務執行
19. 特教支持焦點
20. 有效工具
21. 卡住點
22. 可接時間
23. 作業完成度
24. 相對同儕
25. 安親興趣度
26. 中斷次數
27. 安親備註
28. Neo整體感覺
29. Neo身體感覺
30. Neo興趣度
31. Neo最難的事
32. 任務卡完成度
33. 老師建議工具
34. 家長收到回應
35. 今日課表重點
36. 今日建議工具
37. 今日預設接送規則
38. 幾分鐘後可接
39. 明確時間
40. 老師空白簡填
41. 特教空白簡填
42. 家長晨間快速交班摘要
43. AI整合回饋
44. 校外專家建議

## Script 期待的 payload key

Apps Script 會優先讀取 JSON body，也支援表單參數。建議前端使用以下 key：

- `role`
- `reporter`
- `todayStatus`
- `medication`
- `regulation`
- `parentReminder`
- `lastNightSleep`
- `regulationAction`
- `waterIntake`
- `mealIntake`
- `probioticSupplementTime`
- `taskInitiation`
- `frequentToilet`
- `interestLevel`
- `teacherNote`
- `otTaskExecution`
- `specialEdFocus`
- `effectiveTools`
- `stuckPoints`
- `handoffWindow`
- `homeworkCompletion`
- `peerComparison`
- `afterschoolInterest`
- `interruptions`
- `afterschoolNote`
- `neoOverallFeeling`
- `neoBodyFeeling`
- `neoInterestLevel`
- `neoHardestThing`
- `taskCardCompletion`
- `teacherSuggestedTools`
- `parentResponseReceived`
- `today_schedule_notes`
- `today_support_tools`
- `pickup_rule_default`
- `pickup_after_minutes`
- `pickup_time_exact`
- `teacher_free_note`
- `specialed_free_note`
- `parent_quick_handoff`
- `aiSummary`
- `expertSuggestion`

## Alias 相容

- `probiotic_time` 會寫入既有的 `益生菌 / 保健品時間` 欄位
- 舊 key `probioticSupplementTime` 仍持續支援

若前端直接送中文欄位名稱，後端也會依欄位名稱對應寫入。
