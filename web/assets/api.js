// Neo-nav API connector
// Global script only. Keep compatible with the inline page logic in index.html.

var SCRIPT_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMU3SLqBIR78BcUKL5MmUDtr-vFiwCmNdjHMVv0ohs2o0dSX45D53VA3zGAAgC3AYMHAmUykeMBmjqw4SmSE2ipknl3IBjFGlRvU_Hb4OLja4NlwiVS2PpnMHNjYXFRnnYG1azS5A2RNw7uCZIB7FUxU-FsLwEjmXLbbuWG-vhEEoMphvZc3orc4ZnqrO0VdImb76csWQz5nG4CHt8gGHirT0fF8WZ9Vzn_rJaLcd6yWrrGenMV40M0nvwtJoG-Mjmh8hom0iNgcE59S5fQ1uahG_IEohyQKAefX64Ww&lib=MB30yu0Gs3RCQKkJfDYGzi5QVv05oF4W2';
var SCRIPT_URL_PLACEHOLDER = 'https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMU3SLqBIR78BcUKL5MmUDtr-vFiwCmNdjHMVv0ohs2o0dSX45D53VA3zGAAgC3AYMHAmUykeMBmjqw4SmSE2ipknl3IBjFGlRvU_Hb4OLja4NlwiVS2PpnMHNjYXFRnnYG1azS5A2RNw7uCZIB7FUxU-FsLwEjmXLbbuWG-vhEEoMphvZc3orc4ZnqrO0VdImb76csWQz5nG4CHt8gGHirT0fF8WZ9Vzn_rJaLcd6yWrrGenMV40M0nvwtJoG-Mjmh8hom0iNgcE59S5fQ1uahG_IEohyQKAefX64Ww&lib=MB30yu0Gs3RCQKkJfDYGzi5QVv05oF4W2';

var API_ACTIONS = {
  HEALTH: 'health',
  TODAY_SUMMARY: 'today_summary',
  LAST_7_DAYS: 'last_7_days',
  OVERVIEW: 'overview',
};

var CANONICAL_KEYS = [
  'role',
  'reporter',
  'todayStatus',
  'medication',
  'regulation',
  'parentReminder',
  'lastNightSleep',
  'regulationAction',
  'waterIntake',
  'mealIntake',
  'probioticSupplementTime',
  'taskInitiation',
  'frequentToilet',
  'interestLevel',
  'teacherNote',
  'otTaskExecution',
  'specialEdFocus',
  'effectiveTools',
  'stuckPoints',
  'handoffWindow',
  'homeworkCompletion',
  'peerComparison',
  'afterschoolInterest',
  'interruptions',
  'afterschoolNote',
  'neoOverallFeeling',
  'neoBodyFeeling',
  'neoInterestLevel',
  'neoHardestThing',
  'taskCardCompletion',
  'teacherSuggestedTools',
  'parentResponseReceived',
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

window.NeoApi = {
  SCRIPT_URL: SCRIPT_URL,

  isConfigured: function () {
    return (
      typeof SCRIPT_URL === 'string' &&
      SCRIPT_URL.length > 0 &&
      SCRIPT_URL !== SCRIPT_URL_PLACEHOLDER
    );
  },

  ping: function () {
    return requestJson_('ping', buildActionUrl_(API_ACTIONS.HEALTH)).then(
      function () {
        return true;
      }
    );
  },

  postRecord: function (roleOrPayload, maybePayload) {
    var resolved = resolvePostArgs_(roleOrPayload, maybePayload);
    var normalized = normalizeOutboundRecord_(resolved.role, resolved.payload);

    return requestJson_('postRecord', buildActionUrl_(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalized),
    }).then(function (payload) {
      return {
        result: payload.result,
        record: normalized,
      };
    });
  },

  getTodaySummary: function () {
    return requestJson_(
      'getTodaySummary',
      buildActionUrl_(API_ACTIONS.TODAY_SUMMARY)
    ).then(function (payload) {
      return normalizeTodaySummary_(payload.data || {});
    });
  },

  getLast7Days: function () {
    return requestJson_(
      'getLast7Days',
      buildActionUrl_(API_ACTIONS.LAST_7_DAYS)
    ).then(function (payload) {
      return normalizeLast7Days_(payload.data || {});
    });
  },

  getOverviewData: function () {
    return requestJson_(
      'getOverviewData',
      buildActionUrl_(API_ACTIONS.OVERVIEW)
    ).then(function (payload) {
      return normalizeOverviewData_(payload.data || {});
    });
  },
};

function resolvePostArgs_(roleOrPayload, maybePayload) {
  if (typeof roleOrPayload === 'string') {
    return {
      role: roleOrPayload,
      payload: maybePayload || {},
    };
  }

  if (roleOrPayload && typeof roleOrPayload === 'object') {
    return {
      role: roleOrPayload.role || '',
      payload: roleOrPayload,
    };
  }

  throw new Error('postRecord: payload must be an object.');
}

function normalizeOutboundRecord_(role, payload) {
  var source = payload || {};
  var record = {};

  copyCanonicalFields_(record, source);
  setValue_(record, 'role', firstDefinedValue_(source, ['role', '角色', role]));

  if (!record.role && role) {
    record.role = role;
  }

  if (record.role === 'parent') {
    mapParentPayload_(record, source);
  } else if (record.role === 'teacher') {
    mapTeacherPayload_(record, source);
  } else if (record.role === 'specialed') {
    mapSpecialedPayload_(record, source);
  } else if (record.role === 'afterschool') {
    mapAfterSchoolPayload_(record, source);
  } else if (record.role === 'neo') {
    mapNeoPayload_(record, source);
  } else if (record.role === 'parentReply') {
    mapParentReplyPayload_(record, source);
  }

  if (!record.role) {
    throw new Error('postRecord: missing role.');
  }

  return stripEmptyValues_(record);
}

function mapParentPayload_(record, source) {
  setFromCandidates_(record, 'reporter', source, ['reporter']);
  setFromCandidates_(record, 'todayStatus', source, ['todayStatus', 'status']);
  setFromCandidates_(record, 'medication', source, ['medication', 'medTaken']);
  setFromCandidates_(record, 'regulation', source, ['regulation', 'regulated']);
  setFromCandidates_(record, 'parentReminder', source, ['parentReminder', 'reminder']);
  setFromCandidates_(record, 'lastNightSleep', source, ['lastNightSleep', 'sleep']);
  setFromCandidates_(record, 'regulationAction', source, [
    'regulationAction',
    'regulationActions',
  ]);
  setFromCandidates_(record, 'waterIntake', source, ['waterIntake', 'water']);
  setFromCandidates_(record, 'mealIntake', source, ['mealIntake', 'meal', 'food']);
  setFromCandidates_(record, 'probioticSupplementTime', source, [
    'probioticSupplementTime',
    'probiotic_time',
    'probioticTime',
    'supplements',
  ]);
  setFromCandidates_(record, 'parent_quick_handoff', source, [
    'parent_quick_handoff',
    'parentQuickHandoff',
    'notes',
  ]);
  setFromCandidates_(record, 'today_schedule_notes', source, [
    'today_schedule_notes',
    'todayScheduleNotes',
  ]);
  setFromCandidates_(record, 'today_support_tools', source, [
    'today_support_tools',
    'todaySupportTools',
  ]);
  setFromCandidates_(record, 'teacherSuggestedTools', source, [
    'teacherSuggestedTools',
    'teacher_suggested_tools',
  ]);
  setFromCandidates_(record, 'aiSummary', source, [
    'aiSummary',
    'ai_summary',
    'aiFeedback',
    'ai_feedback',
  ]);
  setFromCandidates_(record, 'expertSuggestion', source, [
    'expertSuggestion',
    'expert_suggestion',
  ]);
}

function mapTeacherPayload_(record, source) {
  setFromCandidates_(record, 'taskInitiation', source, ['taskInitiation', 'taskEntry']);
  setFromCandidates_(record, 'interestLevel', source, ['interestLevel', 'interest']);
  setFromCandidates_(record, 'frequentToilet', source, [
    'frequentToilet',
    'toiletFreq',
  ]);
  setFromCandidates_(record, 'teacherNote', source, ['teacherNote', 'note']);
  setFromCandidates_(record, 'teacher_free_note', source, [
    'teacher_free_note',
    'teacherFreeNote',
    'freeNote',
  ]);
  setFromCandidates_(record, 'today_schedule_notes', source, [
    'today_schedule_notes',
    'todayScheduleNotes',
  ]);
  setFromCandidates_(record, 'today_support_tools', source, [
    'today_support_tools',
    'todaySupportTools',
  ]);
}

function mapSpecialedPayload_(record, source) {
  setFromCandidates_(record, 'taskInitiation', source, [
    'taskInitiation',
    'taskEntry',
    'sp-taskEntry',
  ]);
  setFromCandidates_(record, 'interestLevel', source, [
    'interestLevel',
    'interest',
    'sp-interest',
  ]);
  setFromCandidates_(record, 'frequentToilet', source, [
    'frequentToilet',
    'toiletFreq',
    'sp-toiletFreq',
  ]);
  setFromCandidates_(record, 'teacherNote', source, ['teacherNote', 'note']);
  setFromCandidates_(record, 'specialed_free_note', source, [
    'specialed_free_note',
    'specialedFreeNote',
    'freeNote',
  ]);
  setFromCandidates_(record, 'specialEdFocus', source, [
    'specialEdFocus',
    'supportFocus',
  ]);
  setFromCandidates_(record, 'otTaskExecution', source, [
    'otTaskExecution',
    'otTask',
    'sp-otTask',
  ]);
  setFromCandidates_(record, 'effectiveTools', source, [
    'effectiveTools',
    'effectiveTool',
  ]);
  setFromCandidates_(record, 'stuckPoints', source, ['stuckPoints', 'stuckPoint']);
}

function mapAfterSchoolPayload_(record, source) {
  setFromCandidates_(record, 'handoffWindow', source, [
    'handoffWindow',
    'pickupLabel',
    'pickup',
  ]);
  setFromCandidates_(record, 'pickup_rule_default', source, [
    'pickup_rule_default',
    'pickupRuleDefault',
  ]);
  setFromCandidates_(record, 'pickup_time_exact', source, [
    'pickup_time_exact',
    'pickupTimeExact',
    'pickupCustomTime',
  ]);
  setValue_(
    record,
    'pickup_after_minutes',
    extractPickupMinutes_(firstDefinedValue_(source, [
      'pickup_after_minutes',
      'pickupAfterMinutes',
      'pickup',
    ]))
  );
  setFromCandidates_(record, 'homeworkCompletion', source, [
    'homeworkCompletion',
    'homework',
  ]);
  setFromCandidates_(record, 'peerComparison', source, ['peerComparison', 'peer']);
  setFromCandidates_(record, 'afterschoolInterest', source, [
    'afterschoolInterest',
    'interest',
  ]);
  setFromCandidates_(record, 'interruptions', source, ['interruptions', 'interrupt']);
  setFromCandidates_(record, 'afterschoolNote', source, ['afterschoolNote', 'note']);
}

function mapNeoPayload_(record, source) {
  setFromCandidates_(record, 'neoOverallFeeling', source, [
    'neoOverallFeeling',
    'mood',
  ]);
  setFromCandidates_(record, 'neoBodyFeeling', source, ['neoBodyFeeling', 'body']);
  setFromCandidates_(record, 'neoInterestLevel', source, [
    'neoInterestLevel',
    'interest',
  ]);
  setFromCandidates_(record, 'neoHardestThing', source, [
    'neoHardestThing',
    'hardest',
  ]);
  setFromCandidates_(record, 'taskCardCompletion', source, [
    'taskCardCompletion',
    'taskCard',
  ]);
}

function mapParentReplyPayload_(record, source) {
  setFromCandidates_(record, 'parentResponseReceived', source, [
    'parentResponseReceived',
    'text',
  ]);
}

function normalizeTodaySummary_(data) {
  var records = normalizeRecords_(data.records);

  return {
    date: data.date || '',
    totalRecords:
      typeof data.totalRecords === 'number' ? data.totalRecords : records.length,
    latestRecord: data.latestRecord
      ? normalizeRecord_(data.latestRecord)
      : records.length > 0
        ? records[records.length - 1]
        : null,
    records: records,
  };
}

function normalizeLast7Days_(data) {
  var records = normalizeRecords_(data.records);

  return {
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    totalRecords:
      typeof data.totalRecords === 'number' ? data.totalRecords : records.length,
    records: records,
  };
}

function normalizeOverviewData_(data) {
  var last7Days = normalizeLast7Days_(data.last7Days || {});
  var records = normalizeRecords_(
    Array.isArray(data.records) && data.records.length > 0
      ? data.records
      : last7Days.records
  );

  return {
    generatedAt: data.generatedAt || '',
    records: records,
    todaySummary: normalizeTodaySummary_(data.todaySummary || {}),
    last7Days: last7Days,
  };
}

function normalizeRecords_(records) {
  return Array.isArray(records)
    ? records.map(function (record) {
        return normalizeRecord_(record);
      })
    : [];
}

function normalizeRecord_(record) {
  var input = record || {};
  var normalized = {};

  copyCanonicalFields_(normalized, input);

  normalized.probiotic_time = normalized.probioticSupplementTime || '';
  normalized.status = normalized.todayStatus || '';
  normalized.medTaken = normalized.medication;
  normalized.regulated = normalized.regulation;
  normalized.reminder = normalized.parentReminder || '';
  normalized.sleep = normalized.lastNightSleep || '';
  normalized.water = normalized.waterIntake || '';
  normalized.food = normalized.mealIntake || '';
  normalized.taskEntry = normalized.taskInitiation || '';
  normalized.toiletFreq = normalized.frequentToilet || '';
  normalized.note =
    normalized.teacherNote ||
    normalized.afterschoolNote ||
    normalized.parent_quick_handoff ||
    '';
  normalized.freeNote =
    normalized.teacher_free_note || normalized.specialed_free_note || '';
  normalized.supportFocus = normalized.specialEdFocus || '';
  normalized.otTask = normalized.otTaskExecution || '';
  normalized.effectiveTool = normalized.effectiveTools || '';
  normalized.stuckPoint = normalized.stuckPoints || '';
  normalized.pickupLabel = normalized.handoffWindow || '';
  normalized.pickupRuleDefault = normalized.pickup_rule_default || '';
  normalized.pickupCustomTime = normalized.pickup_time_exact || '';
  normalized.homework = normalized.homeworkCompletion || '';
  normalized.peer = normalized.peerComparison || '';
  normalized.interrupt = normalized.interruptions || '';
  normalized.mood = normalized.neoOverallFeeling || '';
  normalized.body = normalized.neoBodyFeeling || '';
  normalized.hardest = normalized.neoHardestThing || '';
  normalized.taskCard = normalized.taskCardCompletion || '';

  return normalized;
}

function copyCanonicalFields_(target, source) {
  CANONICAL_KEYS.forEach(function (key) {
    setFromCandidates_(target, key, source, [key]);
  });
}

function setFromCandidates_(target, key, source, candidates) {
  var value = firstDefinedValue_(source, candidates);
  setValue_(target, key, value);
}

function setValue_(target, key, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  target[key] = value;
}

function firstDefinedValue_(source, keys) {
  for (var index = 0; index < keys.length; index += 1) {
    var key = keys[index];

    if (
      key &&
      Object.prototype.hasOwnProperty.call(source, key) &&
      source[key] !== undefined &&
      source[key] !== null &&
      source[key] !== ''
    ) {
      return source[key];
    }
  }

  return undefined;
}

function extractPickupMinutes_(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  var text = String(value).trim();
  var match = text.match(/^(\d+)$/);

  if (match) {
    return match[1];
  }

  return undefined;
}

function stripEmptyValues_(record) {
  var cleaned = {};

  Object.keys(record).forEach(function (key) {
    var value = record[key];

    if (value === undefined || value === null || value === '') {
      return;
    }

    cleaned[key] = value;
  });

  return cleaned;
}

function buildActionUrl_(action) {
  if (!window.NeoApi.isConfigured()) {
    throw new Error('SCRIPT_URL is not configured in web/assets/api.js.');
  }

  if (!action) {
    return SCRIPT_URL;
  }

  return SCRIPT_URL + '?action=' + encodeURIComponent(action);
}

function requestJson_(operation, url, options) {
  var fetchOptions = options || {};

  return fetch(url, Object.assign({ cache: 'no-store' }, fetchOptions))
    .then(function (response) {
      return response.text().then(function (text) {
        var payload;

        try {
          payload = JSON.parse(text);
        } catch (error) {
          throw new Error(operation + ': API response is not valid JSON.');
        }

        if (!response.ok) {
          throw new Error(
            operation +
              ': HTTP ' +
              response.status +
              '. ' +
              (payload && payload.message ? payload.message : 'API request failed.')
          );
        }

        if (!payload || payload.result !== 'success') {
          throw new Error(
            operation +
              ': ' +
              (payload && payload.message ? payload.message : 'API returned an error.')
          );
        }

        return payload;
      });
    })
    .catch(function (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(operation + ': ' + String(error));
    });
}
