type LikeEventRow = {
  caption_id: string | null;
  profile_id: string | null;
  created_datetime_utc: string | null;
};

export type TopCaptionWindowStat = {
  captionId: string;
  likeCount: number;
  latestLikeAt: string | null;
};

export type TopLikerWindowStat = {
  profileId: string;
  likeCount: number;
  latestLikeAt: string | null;
};

type AggregateBucket = {
  count: number;
  latestTimestamp: string | null;
};

function compareLatestTimestampDesc(left: string | null, right: string | null) {
  const leftTime = left ? Date.parse(left) : Number.NEGATIVE_INFINITY;
  const rightTime = right ? Date.parse(right) : Number.NEGATIVE_INFINITY;

  return rightTime - leftTime;
}

function buildAggregateMap(
  rows: LikeEventRow[],
  getKey: (row: LikeEventRow) => string | null
) {
  const aggregates = new Map<string, AggregateBucket>();

  rows.forEach((row) => {
    const key = getKey(row);

    if (!key) {
      return;
    }

    const existing = aggregates.get(key);
    const nextTimestamp =
      row.created_datetime_utc &&
      (!existing?.latestTimestamp ||
        Date.parse(row.created_datetime_utc) > Date.parse(existing.latestTimestamp))
        ? row.created_datetime_utc
        : existing?.latestTimestamp ?? null;

    aggregates.set(key, {
      count: (existing?.count ?? 0) + 1,
      latestTimestamp: nextTimestamp,
    });
  });

  return aggregates;
}

export function summarizeCaptionLikeWindow(rows: LikeEventRow[]) {
  const captionAggregates = buildAggregateMap(rows, (row) => row.caption_id);
  const likerAggregates = buildAggregateMap(rows, (row) => row.profile_id);

  const topCaption =
    Array.from(captionAggregates.entries())
      .sort(([leftId, leftBucket], [rightId, rightBucket]) => {
        if (leftBucket.count !== rightBucket.count) {
          return rightBucket.count - leftBucket.count;
        }

        const timestampComparison = compareLatestTimestampDesc(
          leftBucket.latestTimestamp,
          rightBucket.latestTimestamp
        );

        if (timestampComparison !== 0) {
          return timestampComparison;
        }

        return leftId.localeCompare(rightId);
      })
      .map(([captionId, bucket]) => ({
        captionId,
        likeCount: bucket.count,
        latestLikeAt: bucket.latestTimestamp,
      }))
      .at(0) ?? null;

  const topLikers = Array.from(likerAggregates.entries())
    .sort(([leftId, leftBucket], [rightId, rightBucket]) => {
      if (leftBucket.count !== rightBucket.count) {
        return rightBucket.count - leftBucket.count;
      }

      const timestampComparison = compareLatestTimestampDesc(
        leftBucket.latestTimestamp,
        rightBucket.latestTimestamp
      );

      if (timestampComparison !== 0) {
        return timestampComparison;
      }

      return leftId.localeCompare(rightId);
    })
    .map(([profileId, bucket]) => ({
      profileId,
      likeCount: bucket.count,
      latestLikeAt: bucket.latestTimestamp,
    }));

  return {
    topCaption,
    topLikers,
  };
}
