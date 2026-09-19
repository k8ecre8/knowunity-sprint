'use client';

import { useState } from 'react';
import { SummaryCard, type SummaryCardTone } from './SummaryCard';

const ROW_LIMIT = 3;

/** Axis `view`: how much of the list the card shows before it is pressed. */
export type ExpandableSummaryCardView = 'open' | 'overflow' | 'collapsed';

export type ExpandableSummaryCardProps = {
  tone?: SummaryCardTone;
  /** Every term in this outcome, in round order. */
  names: string[];
  /**
   * `open` shows every term. `overflow` shows three, then "N more".
   * `collapsed` shows the header and "N terms". Pressing the overflow row
   * opens the card; it never closes again. A list of three or fewer is shown
   * whole under `overflow`, and a single term whole under `collapsed`: the
   * count row would take the same height and hide the name.
   */
  view?: ExpandableSummaryCardView;
  className?: string;
};

/**
 * A `SummaryCard` that owns its own opening. The screen still decides the
 * starting view by outcome and context; this only remembers that the student
 * opened it. Opening changes the view, never the rows.
 */
export function ExpandableSummaryCard({ tone = 'Good', names, view = 'open', className }: ExpandableSummaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const open =
    expanded ||
    view === 'open' ||
    (view === 'overflow' && names.length <= ROW_LIMIT) ||
    (view === 'collapsed' && names.length <= 1);

  if (open) return <SummaryCard tone={tone} terms={names} showOverflowRow={false} className={className} />;

  if (view === 'collapsed') {
    return (
      <SummaryCard
        tone={tone}
        showRow1={false}
        showOverflowRow
        overflowText={`${names.length} terms`}
        onOverflowPress={() => setExpanded(true)}
        className={className}
      />
    );
  }

  return (
    <SummaryCard
      tone={tone}
      showRow1
      showRow2
      showRow3
      term1={names[0]}
      term2={names[1]}
      term3={names[2]}
      showOverflowRow
      overflowText={`${names.length - ROW_LIMIT} more`}
      onOverflowPress={() => setExpanded(true)}
      className={className}
    />
  );
}
