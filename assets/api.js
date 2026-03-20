// Neo-nav API connector
// Plain browser script. No module syntax.

var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrzfuSzjYYiaCAb5QnvCkDkJqakabH_zLTjHWLqNDAB41E2wxwVLzLRGsjXxuo-lDnFw/exec';

window.NeoApi = (function () {
  function isConfigured() {
    return (
      typeof SCRIPT_URL === 'string' &&
      SCRIPT_URL.length > 0 &&
      SCRIPT_URL !== 'YOUR_APPS_SCRIPT_URL_HERE'
    );
  }

  function buildUrl(action, extraParams) {
    if (!isConfigured()) {
      throw new Error('SCRIPT_URL is not configured in web/assets/api.js.');
    }

    var url = SCRIPT_URL;

    if (action) {
      url += '?action=' + encodeURIComponent(action);
    }

    if (extraParams) {
      Object.keys(extraParams).forEach(function (key) {
        var value = extraParams[key];

        if (value === undefined || value === null || value === '') {
          return;
        }

        url += (url.indexOf('?') === -1 ? '?' : '&');
        url += encodeURIComponent(key) + '=' + encodeURIComponent(value);
      });
    }

    return url;
  }

  function requestJson(operation, url, options) {
    return fetch(url, options || {})
      .then(function (response) {
        return response.text().then(function (text) {
          var json;

          try {
            json = JSON.parse(text);
          } catch (error) {
            throw new Error(operation + ': API response is not valid JSON.');
          }

          if (!response.ok) {
            throw new Error(
              operation +
                ': HTTP ' +
                response.status +
                '. ' +
                (json && json.message ? json.message : 'Request failed.')
            );
          }

          if (!json || json.result !== 'success') {
            throw new Error(
              operation +
                ': ' +
                (json && json.message ? json.message : 'API returned error.')
            );
          }

          return json;
        });
      })
      .catch(function (error) {
        if (error instanceof Error) {
          throw error;
        }

        throw new Error(operation + ': ' + String(error));
      });
  }

  function resolvePostArgs(roleOrPayload, maybePayload) {
    if (typeof roleOrPayload === 'string') {
      return {
        role: roleOrPayload,
        payload: maybePayload || {},
      };
    }

    return {
      role: roleOrPayload && roleOrPayload.role ? roleOrPayload.role : '',
      payload: roleOrPayload || {},
    };
  }

  function normalizeOutboundRecord(role, payload) {
    var source = payload || {};
    var record = {};

    if (role) {
      record.role = role;
    } else if (source.role) {
      record.role = source.role;
    }

    copyIfPresent(record, 'reporter', source, ['reporter']);

    if (record.role === 'parent') {
      copyIfPresent(record, 'todayStatus', source, ['todayStatus', 'status']);
      copyIfPresent(record, 'medication', source, ['medication', 'medTaken']);
      copyIfPresent(record, 'regulation', source, ['regulation', 'regulated']);
      copyIfPresent(record, 'parentReminder', source, ['parentReminder', 'reminder']);
      copyIfPresent(record, 'lastNightSleep', source, ['lastNightSleep', 'sleep']);
      copyIfPresent(record, 'regulationAction', source, [
        'regulationAction',
        'regulationActions',
      ]);
      copyIfPresent(record, 'waterIntake', source, ['waterIntake', 'water']);
      copyIfPresent(record, 'mealIntake', source, ['mealIntake', 'meal', 'food']);
      copyIfPresent(record, 'probioticSupplementTime', source, [
        'probioticSupplementTime',
        'probiotic_time',
        'probioticTime',
        'supplements',
      ]);
      copyIfPresent(record, 'today_schedule_notes', source, [
        'today_schedule_notes',
        'todayScheduleNotes',
      ]);
      copyIfPresent(record, 'today_support_tools', source, [
        'today_support_tools',
        'todaySupportTools',
      ]);
      copyIfPresent(record, 'parent_quick_handoff', source, [
        'parent_quick_handoff',
        'parentQuickHandoff',
        'notes',
      ]);
      copyIfPresent(record, 'teacherSuggestedTools', source, ['teacherSuggestedTools']);
      copyIfPresent(record, 'aiSummary', source, [
        'aiSummary',
        'ai_summary',
        'aiFeedback',
        'ai_feedback',
      ]);
      copyIfPresent(record, 'expertSuggestion', source, [
        'expertSuggestion',
        'expert_suggestion',
      ]);
    } else if (record.role === 'teacher') {
      copyIfPresent(record, 'taskInitiation', source, ['taskInitiation', 'taskEntry']);
      copyIfPresent(record, 'frequentToilet', source, [
        'frequentToilet',
        'toiletFreq',
      ]);
      copyIfPresent(record, 'interestLevel', source, ['interestLevel', 'interest']);
      copyIfPresent(record, 'teacherNote', source, ['teacherNote', 'note']);
      copyIfPresent(record, 'teacher_free_note', source, [
        'teacher_free_note',
        'teacherFreeNote',
        'freeNote',
      ]);
      copyIfPresent(record, 'today_schedule_notes', source, [
        'today_schedule_notes',
        'todayScheduleNotes',
      ]);
      copyIfPresent(record, 'today_support_tools', source, [
        'today_support_tools',
        'todaySupportTools',
      ]);
    } else if (record.role === 'specialed') {
      copyIfPresent(record, 'taskInitiation', source, [
        'taskInitiation',
        'taskEntry',
        'sp-taskEntry',
      ]);
      copyIfPresent(record, 'frequentToilet', source, [
        'frequentToilet',
        'toiletFreq',
        'sp-toiletFreq',
      ]);
      copyIfPresent(record, 'interestLevel', source, [
        'interestLevel',
        'interest',
        'sp-interest',
      ]);
      copyIfPresent(record, 'teacherNote', source, ['teacherNote', 'note']);
      copyIfPresent(record, 'otTaskExecution', source, [
        'otTaskExecution',
        'otTask',
        'sp-otTask',
      ]);
      copyIfPresent(record, 'specialEdFocus', source, [
        'specialEdFocus',
        'supportFocus',
      ]);
      copyIfPresent(record, 'effectiveTools', source, [
        'effectiveTools',
        'effectiveTool',
      ]);
      copyIfPresent(record, 'stuckPoints', source, ['stuckPoints', 'stuckPoint']);
      copyIfPresent(record, 'specialed_free_note', source, [
        'specialed_free_note',
        'specialedFreeNote',
        'freeNote',
      ]);
    } else if (record.role === 'afterschool') {
      copyIfPresent(record, 'handoffWindow', source, [
        'handoffWindow',
        'pickupLabel',
        'pickup',
      ]);
      copyIfPresent(record, 'pickup_rule_default', source, [
        'pickup_rule_default',
        'pickupRuleDefault',
      ]);
      copyIfPresent(record, 'pickup_after_minutes', source, [
        'pickup_after_minutes',
        'pickupAfterMinutes',
      ]);
      copyIfPresent(record, 'pickup_time_exact', source, [
        'pickup_time_exact',
        'pickupTimeExact',
        'pickupCustomTime',
      ]);
      copyIfPresent(record, 'homeworkCompletion', source, [
        'homeworkCompletion',
        'homework',
      ]);
      copyIfPresent(record, 'peerComparison', source, ['peerComparison', 'peer']);
      copyIfPresent(record, 'afterschoolInterest', source, [
        'afterschoolInterest',
        'interest',
      ]);
      copyIfPresent(record, 'interruptions', source, ['interruptions', 'interrupt']);
      copyIfPresent(record, 'afterschoolNote', source, ['afterschoolNote', 'note']);
    } else if (record.role === 'neo') {
      copyIfPresent(record, 'neoOverallFeeling', source, [
        'neoOverallFeeling',
        'mood',
      ]);
      copyIfPresent(record, 'neoBodyFeeling', source, ['neoBodyFeeling', 'body']);
      copyIfPresent(record, 'neoInterestLevel', source, [
        'neoInterestLevel',
        'interest',
      ]);
      copyIfPresent(record, 'neoHardestThing', source, [
        'neoHardestThing',
        'hardest',
      ]);
      copyIfPresent(record, 'taskCardCompletion', source, [
        'taskCardCompletion',
        'taskCard',
      ]);
    } else if (record.role === 'parentReply') {
      copyIfPresent(record, 'parentResponseReceived', source, [
        'parentResponseReceived',
        'text',
      ]);
    } else {
      copyKnownTopLevelKeys(record, source);
    }

    if (!record.role) {
      throw new Error('postRecord: missing role.');
    }

    return stripEmptyValues(record);
  }

  function copyKnownTopLevelKeys(target, source) {
    [
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
    ].forEach(function (key) {
      copyIfPresent(target, key, source, [key]);
    });
  }

  function copyIfPresent(target, targetKey, source, sourceKeys) {
    var value = pickFirst(source, sourceKeys);

    if (value === undefined || value === null || value === '') {
      return;
    }

    target[targetKey] = value;
  }

  function pickFirst(source, keys) {
    if (!source || !keys) {
      return undefined;
    }

    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];

      if (
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

  function stripEmptyValues(record) {
    var result = {};

    Object.keys(record).forEach(function (key) {
      var value = record[key];

      if (value === undefined || value === null || value === '') {
        return;
      }

      result[key] = value;
    });

    return result;
  }

  function normalizeReadPayload(json) {
    var records = Array.isArray(json.records)
      ? json.records
      : json.data && Array.isArray(json.data.records)
        ? json.data.records
        : [];

    return {
      records: records,
      count:
        typeof json.count === 'number'
          ? json.count
          : typeof json.totalRecords === 'number'
            ? json.totalRecords
            : records.length,
    };
  }

  function ping() {
    return requestJson('ping', buildUrl('ping')).then(function () {
      return true;
    });
  }

  function postRecord(roleOrPayload, maybePayload) {
    var resolved = resolvePostArgs(roleOrPayload, maybePayload);
    var body = normalizeOutboundRecord(resolved.role, resolved.payload);
    body.action = 'write';

    return requestJson(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  function getTodaySummary() {
    return requestJson('getTodaySummary', buildUrl('today_summary')).then(function (json) {
      return normalizeReadPayload(json.data || {});
    });
  }

  function getLast7Days() {
    return requestJson('getLast7Days', buildUrl('last_7_days')).then(function (json) {
      return normalizeReadPayload(json.data || {});
    });
  }

  function getOverviewData() {
    return requestJson('getOverviewData', buildUrl('overview')).then(function (json) {
      var data = json.data || {};
      var last7 = normalizeReadPayload(data.last7Days || {});

      return {
        records: Array.isArray(data.records) ? data.records : last7.records,
        count: last7.count,
        todaySummary: data.todaySummary || {},
        last7Days: data.last7Days || {},
        generatedAt: data.generatedAt || '',
      };
    });
  }

  return {
    isConfigured: isConfigured,
    ping: ping,
    postRecord: postRecord,
    getTodaySummary: getTodaySummary,
    getLast7Days: getLast7Days,
    getOverviewData: getOverviewData,
  };
})();
