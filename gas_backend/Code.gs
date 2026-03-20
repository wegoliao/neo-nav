const CONFIG = {
  SPREADSHEET_ID: '1UFaucXpyt_vKeP3ODQ2ukdvqjg4FML5WrjFVAtR25Lc',
  SHEET_NAME: 'daily_support_handoff',
};

const ACTIONS = {
  HEALTH: 'health',
  TODAY_SUMMARY: 'today_summary',
  LAST_7_DAYS: 'last_7_days',
  OVERVIEW: 'overview',
};

const FIELD_DEFINITIONS = [
  { header: '角色', key: 'role' },
  { header: '填報人', key: 'reporter' },
  { header: '今日狀態', key: 'todayStatus', aliases: ['status'] },
  { header: '有無服藥', key: 'medication', aliases: ['medTaken'] },
  { header: '有無調節', key: 'regulation', aliases: ['regulated'] },
  { header: '家長提醒', key: 'parentReminder', aliases: ['reminder'] },
  { header: '昨晚睡眠', key: 'lastNightSleep', aliases: ['sleep'] },
  {
    header: '調節動作',
    key: 'regulationAction',
    aliases: ['regulationActions'],
  },
  { header: '喝水量', key: 'waterIntake', aliases: ['water'] },
  { header: '吃飯量', key: 'mealIntake', aliases: ['meal', 'food'] },
  {
    header: '益生菌 / 保健品時間',
    key: 'probioticSupplementTime',
    aliases: ['probiotic_time', 'supplements', 'probioticTime'],
  },
  { header: '任務進入', key: 'taskInitiation', aliases: ['taskEntry'] },
  { header: '頻繁如廁', key: 'frequentToilet', aliases: ['toiletFreq'] },
  { header: '興趣度', key: 'interestLevel' },
  { header: '導師備註', key: 'teacherNote' },
  {
    header: 'OT任務執行',
    key: 'otTaskExecution',
    aliases: ['otTask', 'sp-otTask'],
  },
  { header: '特教支持焦點', key: 'specialEdFocus', aliases: ['supportFocus'] },
  { header: '有效工具', key: 'effectiveTools', aliases: ['effectiveTool'] },
  { header: '卡住點', key: 'stuckPoints', aliases: ['stuckPoint'] },
  { header: '可接時間', key: 'handoffWindow', aliases: ['pickupLabel'] },
  { header: '作業完成度', key: 'homeworkCompletion', aliases: ['homework'] },
  { header: '相對同儕', key: 'peerComparison', aliases: ['peer'] },
  { header: '安親興趣度', key: 'afterschoolInterest' },
  { header: '中斷次數', key: 'interruptions', aliases: ['interrupt'] },
  { header: '安親備註', key: 'afterschoolNote' },
  { header: 'Neo整體感覺', key: 'neoOverallFeeling', aliases: ['mood'] },
  { header: 'Neo身體感覺', key: 'neoBodyFeeling', aliases: ['body'] },
  { header: 'Neo興趣度', key: 'neoInterestLevel' },
  { header: 'Neo最難的事', key: 'neoHardestThing', aliases: ['hardest'] },
  { header: '任務卡完成度', key: 'taskCardCompletion', aliases: ['taskCard'] },
  { header: '老師建議工具', key: 'teacherSuggestedTools' },
  { header: '家長收到回應', key: 'parentResponseReceived' },
  {
    header: '今日課表重點',
    key: 'today_schedule_notes',
    aliases: ['todayScheduleNotes'],
  },
  {
    header: '今日建議工具',
    key: 'today_support_tools',
    aliases: ['todaySupportTools'],
  },
  {
    header: '今日預設接送規則',
    key: 'pickup_rule_default',
    aliases: ['pickupRuleDefault'],
  },
  {
    header: '幾分鐘後可接',
    key: 'pickup_after_minutes',
    aliases: ['pickupAfterMinutes'],
  },
  {
    header: '明確時間',
    key: 'pickup_time_exact',
    aliases: ['pickupTimeExact', 'pickupCustomTime'],
  },
  {
    header: '老師空白簡填',
    key: 'teacher_free_note',
    aliases: ['teacherFreeNote'],
  },
  {
    header: '特教空白簡填',
    key: 'specialed_free_note',
    aliases: ['specialedFreeNote'],
  },
  {
    header: '家長晨間快速交班摘要',
    key: 'parent_quick_handoff',
    aliases: ['parentQuickHandoff'],
  },
  {
    header: 'AI整合回饋',
    key: 'aiSummary',
    aliases: ['ai_summary', 'aiFeedback', 'ai_feedback'],
  },
  {
    header: '校外專家建議',
    key: 'expertSuggestion',
    aliases: ['expert_suggestion', 'expertAdvice'],
  },
];

const APPENDED_FIELD_KEYS = [
  'today_schedule_notes',
  'today_support_tools',
  'pickup_rule_default',
  'pickup_after_minutes',
  'pickup_time_exact',
  'teacher_free_note',
  'specialed_free_note',
  'parent_quick_handoff',
  'aiSummary',
  'expertSuggestion',
];

const SHEET_HEADERS = ['時間戳記', '日期'].concat(
  FIELD_DEFINITIONS.map(function (field) {
    return field.header;
  })
);

const PREVIOUS_SHEET_HEADERS = ['時間戳記', '日期'].concat(
  FIELD_DEFINITIONS.filter(function (field) {
    return APPENDED_FIELD_KEYS.indexOf(field.key) === -1;
  }).map(function (field) {
    return field.header;
  })
);

const LEGACY_SHEET_HEADERS = ['時間戳記', '日期'].concat(
  FIELD_DEFINITIONS.filter(function (field) {
    return (
      APPENDED_FIELD_KEYS.indexOf(field.key) === -1 &&
      field.key !== 'probioticSupplementTime'
    );
  }).map(function (field) {
    return field.header;
  })
);

const PROBIOTIC_COLUMN_INDEX = SHEET_HEADERS.indexOf('益生菌 / 保健品時間') + 1;

function doGet(e) {
  try {
    const action = getAction_(e);

    if (action === ACTIONS.HEALTH) {
      return jsonResponse_({ result: 'success' });
    }

    if (action === ACTIONS.TODAY_SUMMARY) {
      return jsonResponse_({
        result: 'success',
        data: getTodaySummaryData_(),
      });
    }

    if (action === ACTIONS.LAST_7_DAYS) {
      return jsonResponse_({
        result: 'success',
        data: getLast7DaysData_(),
      });
    }

    if (action === ACTIONS.OVERVIEW) {
      return jsonResponse_({
        result: 'success',
        data: getOverviewData_(),
      });
    }

    throw new Error('Unsupported action: ' + action);
  } catch (error) {
    return errorResponse_(error);
  }
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const sheet = getOrCreateSheet_();
    const row = buildRow_(payload);

    sheet.appendRow(row);

    return jsonResponse_({ result: 'success' });
  } catch (error) {
    return errorResponse_(error);
  }
}

function getAction_(e) {
  const action =
    e && e.parameter && e.parameter.action
      ? String(e.parameter.action).trim()
      : '';

  return action || ACTIONS.HEALTH;
}

function parsePayload_(e) {
  if (!e) {
    throw new Error('Missing request event.');
  }

  const contents =
    e.postData && e.postData.contents ? String(e.postData.contents).trim() : '';

  if (contents) {
    try {
      const parsed = JSON.parse(contents);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // Fall back to form/query parameters below.
    }
  }

  const params = e.parameter || {};
  if (Object.keys(params).length > 0) {
    return params;
  }

  throw new Error('Request payload is empty.');
}

function buildRow_(payload) {
  const now = new Date();
  const timestamp = formatDateTime_(now);
  const dateValue = formatDate_(now);

  const values = FIELD_DEFINITIONS.map(function (field) {
    return normalizeCellValue_(firstDefinedValue_(payload, getFieldLookupKeys_(field)));
  });

  return [timestamp, dateValue].concat(values);
}

function getTodaySummaryData_() {
  const today = formatDate_(new Date());
  const records = getRecordsInRange_(today, today);

  return {
    date: today,
    totalRecords: records.length,
    latestRecord: records.length > 0 ? records[records.length - 1] : null,
    records: records,
  };
}

function getLast7DaysData_() {
  const range = getDateRangeForDays_(7);
  const records = getRecordsInRange_(range.startDate, range.endDate);

  return {
    startDate: range.startDate,
    endDate: range.endDate,
    totalRecords: records.length,
    records: records,
  };
}

function getOverviewData_() {
  const last7Days = getLast7DaysData_();
  const todaySummary = getTodaySummaryData_();

  return {
    generatedAt: formatDateTime_(new Date()),
    records: last7Days.records,
    todaySummary: todaySummary,
    last7Days: last7Days,
  };
}

function getOrCreateSheet_() {
  const spreadsheetId = String(CONFIG.SPREADSHEET_ID || '').trim();
  if (!spreadsheetId || spreadsheetId === 'PUT_SPREADSHEET_ID_HERE') {
    throw new Error('SPREADSHEET_ID is not configured.');
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  ensureSheetSchema_(sheet);

  return sheet;
}

function ensureSheetSchema_(sheet) {
  if (sheet.getLastRow() === 0) {
    ensureColumnCapacity_(sheet, SHEET_HEADERS.length);
    writeHeaders_(sheet, SHEET_HEADERS);
    return;
  }

  const existingHeaders = getExistingHeaders_(sheet);

  if (headersMatch_(existingHeaders, SHEET_HEADERS)) {
    ensureColumnCapacity_(sheet, SHEET_HEADERS.length);
    return;
  }

  if (headersMatch_(existingHeaders, PREVIOUS_SHEET_HEADERS)) {
    ensureColumnCapacity_(sheet, SHEET_HEADERS.length);
    writeHeaders_(sheet, SHEET_HEADERS);
    return;
  }

  if (headersMatch_(existingHeaders, LEGACY_SHEET_HEADERS)) {
    sheet.insertColumnBefore(PROBIOTIC_COLUMN_INDEX);
    ensureColumnCapacity_(sheet, SHEET_HEADERS.length);
    writeHeaders_(sheet, SHEET_HEADERS);
    return;
  }

  throw new Error('Sheet schema does not match expected headers.');
}

function ensureColumnCapacity_(sheet, requiredColumns) {
  const currentColumns = sheet.getMaxColumns();

  if (currentColumns < requiredColumns) {
    sheet.insertColumnsAfter(currentColumns, requiredColumns - currentColumns);
  }
}

function writeHeaders_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function getExistingHeaders_(sheet) {
  const width = sheet.getLastColumn();

  if (width === 0) {
    return [];
  }

  return trimTrailingEmpty_(
    sheet.getRange(1, 1, 1, width).getValues()[0].map(function (value) {
      return normalizeCellValue_(value);
    })
  );
}

function headersMatch_(left, right) {
  const normalizedLeft = trimTrailingEmpty_(left);
  const normalizedRight = trimTrailingEmpty_(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  for (var i = 0; i < normalizedLeft.length; i += 1) {
    if (normalizedLeft[i] !== normalizedRight[i]) {
      return false;
    }
  }

  return true;
}

function trimTrailingEmpty_(values) {
  const copy = values.slice();

  while (copy.length > 0 && !copy[copy.length - 1]) {
    copy.pop();
  }

  return copy;
}

function getRecordsInRange_(startDate, endDate) {
  const records = getAllRecords_();

  return records.filter(function (record) {
    return record.date >= startDate && record.date <= endDate;
  });
}

function getAllRecords_() {
  const sheet = getOrCreateSheet_();
  const lastRow = sheet.getLastRow();
  const lastColumn = SHEET_HEADERS.length;

  if (lastRow <= 1) {
    return [];
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  const records = rows.map(rowToRecord_);

  return records.sort(compareRecords_);
}

function rowToRecord_(row) {
  const record = {
    timestamp: normalizeCellValue_(row[0]),
    date: normalizeCellValue_(row[1]),
  };

  FIELD_DEFINITIONS.forEach(function (field, index) {
    assignFieldValue_(record, field, normalizeCellValue_(row[index + 2]));
  });

  return record;
}

function compareRecords_(left, right) {
  const leftKey = [left.date || '', left.timestamp || ''].join('T');
  const rightKey = [right.date || '', right.timestamp || ''].join('T');

  if (leftKey < rightKey) {
    return -1;
  }

  if (leftKey > rightKey) {
    return 1;
  }

  return 0;
}

function getDateRangeForDays_(days) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime());
  startDate.setDate(startDate.getDate() - (days - 1));

  return {
    startDate: formatDate_(startDate),
    endDate: formatDate_(endDate),
  };
}

function formatDate_(date) {
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone() || 'Asia/Taipei',
    'yyyy-MM-dd'
  );
}

function formatDateTime_(date) {
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone() || 'Asia/Taipei',
    'yyyy-MM-dd HH:mm:ss'
  );
}

function firstDefinedValue_(payload, keys) {
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      return payload[key];
    }
  }

  return '';
}

function getFieldLookupKeys_(field) {
  var keys = [field.key, field.header, toSnakeCase_(field.key)];

  (field.aliases || []).forEach(function (alias) {
    keys.push(alias);
    keys.push(toSnakeCase_(alias));
  });

  return uniqueValues_(keys);
}

function assignFieldValue_(record, field, value) {
  record[field.key] = value;

  (field.aliases || []).forEach(function (alias) {
    record[alias] = value;
  });
}

function uniqueValues_(values) {
  var seen = {};
  var unique = [];

  values.forEach(function (value) {
    if (!seen[value]) {
      seen[value] = true;
      unique.push(value);
    }
  });

  return unique;
}

function toSnakeCase_(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

function normalizeCellValue_(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function errorResponse_(error) {
  const message = error && error.message ? error.message : String(error);
  return jsonResponse_({ result: 'error', message: message });
}
