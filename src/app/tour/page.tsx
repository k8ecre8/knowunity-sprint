'use client';

/* /tour — the tester harness. Not a product screen and not in SPEC.md: a
   list of tours for people reviewing the prototype, so they can see every
   day and every state without knowing the seed links. Tapping a row opens
   a sheet with the tour's steps; "Start tour" clears the prototype, seeds
   what the tour needs (src/mock/session.ts) and opens its first screen.
   The product screens carry no link back here, so the frames stay as
   designed; testers return by reopening /tour. */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { TextBlock } from '@/components/TextBlock';
import { ListItem } from '@/components/ListItem';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { resetPrototype } from '@/mock/session';
import { tourGroups, type Tour } from './tours';
import styles from './page.module.css';

export default function TourPage() {
  const router = useRouter();
  const [open, setOpen] = useState<Tour | null>(null);

  const begin = (tour: Tour) => {
    resetPrototype();
    router.push(tour.start());
  };

  return (
    <Scaffold
      showTopNavSlot={false}
      showBottomSheetBackground={open !== null}
      middleContent={
        <div className={styles.content} inert={open !== null}>
          <TextBlock
            headline="Prototype tours"
            showCaption
            caption="Each tour clears the prototype and opens a screen. The day on each row is the day the app is simulating."
          />
          {tourGroups.map((group) => (
            <section key={group.heading} className={styles.group}>
              <TextBlock as="h2" size="S" headline={group.heading} />
              <ul className={styles.list}>
                {group.tours.map((tour) => (
                  <li key={tour.id}>
                    <ListItem
                      variant="Outlined"
                      title={tour.title}
                      subtitle={`${tour.day} · ${tour.detail}`}
                      showImage={false}
                      showEmoji={false}
                      leadingIcon={tour.icon}
                      trailingIcon="chevron-right"
                      onClick={() => setOpen(tour)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      }
      bottomSheetOnly={
        open && (
          /* The layer is the scrim's close target and keeps the sheet below
             the status bar, as the section intro tray does. */
          <div className={styles.layer}>
            <button type="button" className={styles.scrimTap} aria-label="Close" onClick={() => setOpen(null)} />
            <BottomSheet
              headline={open.title}
              showAppBar
              onClose={() => setOpen(null)}
              middleSection={
                <div className={styles.sheet}>
                  <TextBlock headline={open.title} showCaption caption={open.day} />
                  {/* tourSteps: no component; see docs/component-gaps.md. */}
                  <ol className={styles.steps}>
                    {open.steps.map((step, i) => (
                      <li key={step.action} className={styles.step}>
                        <span className={styles.stepNumber} aria-hidden="true">
                          {i + 1}
                        </span>
                        <div className={styles.stepText}>
                          <p className={styles.action}>{step.action}</p>
                          {step.result && <p className={styles.result}>{step.result}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              }
            >
              <Button fullWidth variant="Primary" size="L" onClick={() => begin(open)}>
                Start tour
              </Button>
              <Button fullWidth variant="Text" size="L" onClick={() => setOpen(null)}>
                Back to tours
              </Button>
            </BottomSheet>
          </div>
        )
      }
    />
  );
}
