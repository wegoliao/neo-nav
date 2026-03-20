export const DEFAULT_FOCUS_KEY = 'taskInitiation';

export const DEFAULT_NEO_PARENT_GAP_PAIRS = [
  {
    id: 'neo_overall_parent_reminder',
    title: 'Neo整體感覺 vs 家長提醒',
    neoKey: 'neoOverallFeeling',
    parentKey: 'parentReminder',
    neoLabel: 'Neo整體感覺',
    parentLabel: '家長提醒',
  },
  {
    id: 'neo_interest_parent_reminder',
    title: 'Neo興趣度 vs 家長提醒',
    neoKey: 'neoInterestLevel',
    parentKey: 'parentReminder',
    neoLabel: 'Neo興趣度',
    parentLabel: '家長提醒',
  },
  {
    id: 'neo_hardest_parent_reminder',
    title: 'Neo最難的事 vs 家長提醒',
    neoKey: 'neoHardestThing',
    parentKey: 'parentReminder',
    neoLabel: 'Neo最難的事',
    parentLabel: '家長提醒',
  },
];

export function buildStatusTrendData(input, options) {
  const settings = options || {};
  const statusKey = settings.statusKey || 'todayStatus';
  const records = getRecords_(input);
  const byDate = new Map();
  const statusSet = new Set();

  records.forEach(function (record) {
    const date = record.date || '';
    const status = normalizeText_(record[statusKey]) || '未填寫';

    if (!byDate.has(date)) {
      byDate.set(date, {});
    }

    const bucket = byDate.get(date);
    bucket[status] = (bucket[status] || 0) + 1;
    statusSet.add(status);
  });

  const labels = Array.from(byDate.keys()).sort();
  const statusList = Array.from(statusSet.values()).sort();
  const series = statusList.map(function (status) {
    return {
      key: status,
      label: status,
      data: labels.map(function (date) {
        const bucket = byDate.get(date) || {};
        return bucket[status] || 0;
      }),
    };
  });

  return {
    labels: labels,
    series: series,
    totalRecords: records.length,
  };
}

export function buildMedicationVsFocusData(input, options) {
  const settings = options || {};
  const medicationKey = settings.medicationKey || 'medication';
  const focusKey = settings.focusKey || DEFAULT_FOCUS_KEY;
  const records = getRecords_(input);
  const points = records
    .map(function (record) {
      return {
        date: record.date || '',
        timestamp: record.timestamp || '',
        role: record.role || '',
        reporter: record.reporter || '',
        medicationRaw: record[medicationKey] || '',
        medicationBucket: normalizeBooleanBucket_(record[medicationKey]),
        focusKey: focusKey,
        focusRaw: record[focusKey] || '',
        focusScore: toPercentageScore_(record[focusKey]),
      };
    })
    .filter(function (point) {
      return point.medicationBucket !== 'unknown' || point.focusScore !== null;
    });

  return {
    focusKey: focusKey,
    points: points,
    groups: buildBooleanBucketGroups_(points, 'medicationBucket', 'focusScore'),
  };
}

export function buildInterestVsCompletionData(input, options) {
  const settings = options || {};
  const interestKey = settings.interestKey || 'interestLevel';
  const completionKey = settings.completionKey || 'homeworkCompletion';
  const records = getRecords_(input);
  const points = records
    .map(function (record) {
      return {
        date: record.date || '',
        timestamp: record.timestamp || '',
        role: record.role || '',
        reporter: record.reporter || '',
        interestRaw: record[interestKey] || '',
        completionRaw: record[completionKey] || '',
        interestScore: toPercentageScore_(record[interestKey]),
        completionScore: toPercentageScore_(record[completionKey]),
      };
    })
    .filter(function (point) {
      return point.interestScore !== null || point.completionScore !== null;
    });

  const dailyAverages = buildDailyAverageSeries_(points, [
    { key: 'interestScore', label: '興趣度' },
    { key: 'completionScore', label: '完成度' },
  ]);

  return {
    interestKey: interestKey,
    completionKey: completionKey,
    points: points,
    labels: dailyAverages.labels,
    series: dailyAverages.series,
    averages: {
      interestScore: average_(pluckNumbers_(points, 'interestScore')),
      completionScore: average_(pluckNumbers_(points, 'completionScore')),
    },
  };
}

export function buildNeoParentGapCards(input, options) {
  const settings = options || {};
  const pairs = settings.pairs || DEFAULT_NEO_PARENT_GAP_PAIRS;
  const record = settings.record || getLatestRecord_(input);

  if (!record) {
    return [];
  }

  return pairs.map(function (pair) {
    const neoValue = normalizeText_(record[pair.neoKey]);
    const parentValue = normalizeText_(record[pair.parentKey]);
    const neoScore = toPercentageScore_(neoValue);
    const parentScore = toPercentageScore_(parentValue);
    const difference =
      neoScore !== null && parentScore !== null ? neoScore - parentScore : null;

    return {
      id: pair.id,
      title: pair.title,
      neoKey: pair.neoKey,
      parentKey: pair.parentKey,
      neoLabel: pair.neoLabel || pair.neoKey,
      parentLabel: pair.parentLabel || pair.parentKey,
      neoValue: neoValue,
      parentValue: parentValue,
      neoScore: neoScore,
      parentScore: parentScore,
      difference: difference,
      comparable: difference !== null,
      exactMatch:
        neoValue && parentValue ? neoValue.toLowerCase() === parentValue.toLowerCase() : false,
      date: record.date || '',
      timestamp: record.timestamp || '',
    };
  });
}

function getRecords_(input) {
  const records = Array.isArray(input)
    ? input
    : Array.isArray(input && input.records)
      ? input.records
      : Array.isArray(input && input.last7Days && input.last7Days.records)
        ? input.last7Days.records
        : [];

  return records.slice().sort(compareRecords_);
}

function getLatestRecord_(input) {
  const records = getRecords_(input);
  return records.length > 0 ? records[records.length - 1] : null;
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

function buildBooleanBucketGroups_(points, bucketKey, valueKey) {
  return ['yes', 'no', 'unknown'].map(function (bucket) {
    const subset = points.filter(function (point) {
      return point[bucketKey] === bucket;
    });

    return {
      key: bucket,
      label: booleanBucketLabel_(bucket),
      count: subset.length,
      averageScore: average_(pluckNumbers_(subset, valueKey)),
    };
  });
}

function buildDailyAverageSeries_(points, metrics) {
  const dates = Array.from(
    points.reduce(function (set, point) {
      if (point.date) {
        set.add(point.date);
      }
      return set;
    }, new Set())
  ).sort();

  const series = metrics.map(function (metric) {
    return {
      key: metric.key,
      label: metric.label,
      data: dates.map(function (date) {
        const values = points
          .filter(function (point) {
            return point.date === date;
          })
          .map(function (point) {
            return point[metric.key];
          })
          .filter(function (value) {
            return typeof value === 'number' && !Number.isNaN(value);
          });

        return average_(values);
      }),
    };
  });

  return {
    labels: dates,
    series: series,
  };
}

function normalizeBooleanBucket_(value) {
  const text = normalizeText_(value).toLowerCase();

  if (!text) {
    return 'unknown';
  }

  if (
    /(有|是|已|需要|服藥|true|yes|y|1|ok)/.test(text) &&
    !/(沒有|無|否|未|免|no|false|0)/.test(text)
  ) {
    return 'yes';
  }

  if (/(沒有|無|否|未|免|no|false|n|0)/.test(text)) {
    return 'no';
  }

  return 'unknown';
}

function booleanBucketLabel_(bucket) {
  if (bucket === 'yes') {
    return '有';
  }

  if (bucket === 'no') {
    return '無';
  }

  return '未填寫';
}

function toPercentageScore_(value) {
  const text = normalizeText_(value);

  if (!text) {
    return null;
  }

  const percentMatch = text.match(/(-?\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return clamp_(Number(percentMatch[1]), 0, 100);
  }

  const numberMatch = text.match(/-?\d+(?:\.\d+)?/);
  if (numberMatch) {
    const numericValue = Number(numberMatch[0]);

    if (Number.isNaN(numericValue)) {
      return null;
    }

    if (numericValue >= 0 && numericValue <= 5) {
      return clamp_((numericValue / 5) * 100, 0, 100);
    }

    if (numericValue >= 0 && numericValue <= 10) {
      return clamp_((numericValue / 10) * 100, 0, 100);
    }

    return clamp_(numericValue, 0, 100);
  }

  const normalized = text.toLowerCase();

  if (/(非常高|很好|穩定|完成|順利|高|佳|良好|充足|投入)/.test(normalized)) {
    return 100;
  }

  if (/(中|普通|尚可|一般|部分|還可以|partial)/.test(normalized)) {
    return 60;
  }

  if (/(低|少|差|困難|卡住|弱|不足|疲累|不佳)/.test(normalized)) {
    return 20;
  }

  if (/(無|沒有|否|未|不行|拒絕|0|none)/.test(normalized)) {
    return 0;
  }

  return null;
}

function pluckNumbers_(items, key) {
  return items
    .map(function (item) {
      return item[key];
    })
    .filter(function (value) {
      return typeof value === 'number' && !Number.isNaN(value);
    });
}

function average_(values) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  return Number((total / values.length).toFixed(2));
}

function clamp_(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeText_(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}
