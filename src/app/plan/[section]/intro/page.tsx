'use client';

/* Section intro tray — SPEC.md → Screens → 8. Section intro tray.
   Figma, Exam Section 1 - Claude (Core Flow): "Section intro tray". No frame
   exists for the mocked iOS mic prompt; that is `permissionAlert`.

   The tray rises over the plan. Start asks for the mic the first time
   (docs/sprint-context.md → Input mode), then opens the section round at the
   term the student is on, so a round left on hint 2 resumes there. "I can't
   talk right now" and a denied mic both go to the typed route, never back to
   the plan. Dismissing the tray goes to /plan. */

import { use, useEffect, useId, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { MascotSlot } from '@/components/MascotSlot';
import { TextBlock } from '@/components/TextBlock';
import { IconSlot, type IconName } from '@/components/IconSlot';
import { Button } from '@/components/Button';
import { PermissionAlert } from '@/components/PermissionAlert';
import { sections } from '@/mock/terms';
import { currentTerm, enterRound, updateSession, useSession } from '@/mock/session';
import { PlanHome } from '../../PlanHome';
import styles from './page.module.css';

/* The three rows under the headline, as the frame draws them. */
const rows: { icon: IconName; text: string }[] = [
  { icon: 'microphone-01', text: 'Explain concepts in your own words.' },
  { icon: 'thumbs-up', text: 'It’s okay to pause, stumble, or even start over.' },
  { icon: 'lock-01', text: 'Your recording is only used to check your answer. It is not saved.' },
];

function IntroTray() {
  const router = useRouter();
  const session = useSession();
  const [prompt, setPrompt] = useState(false);
  const titleId = useId();

  const dismiss = () => router.push('/plan');

  // Escape closes the tray, as a sheet's scrim tap does.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !prompt) dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  // Null on the server and the first client render, so the markup matches.
  if (!session) return <PlanHome showBottomSheetBackground />;

  // The only section with a round is Plate Tectonics; its round is `section`.
  const round = 'section';
  const term = currentTerm(session, round);

  const openVoice = () => {
    enterRound(round);
    router.push(`/recall/${round}/${term}`);
  };

  const start = () => {
    // One OS prompt per session, on the first mic use.
    if (session.micPermission === 'unasked') setPrompt(true);
    else openVoice();
  };

  const allowMic = () => {
    updateSession((s) => ({ ...s, micPermission: 'granted' }));
    openVoice();
  };

  const denyMic = () => {
    updateSession((s) => ({ ...s, micPermission: 'denied' }));
    router.push(`/recall/${round}/mic-denied`);
  };

  const cantTalk = () => {
    // Typing sticks for the rest of the session.
    enterRound(round);
    updateSession((s) => ({ ...s, inputMode: 'typed' }));
    router.push(`/recall/${round}/${term}/typed`);
  };

  return (
    /* Behind the tray sits the plan as on screen 9, with its slots inert. */
    <PlanHome
      showBottomSheetBackground
      bottomSheetOnly={
        prompt ? (
          <PermissionAlert
            title="“Knowunity” would like to access the microphone"
            body="Knowie listens while you explain, so your answer can be checked. Nothing is recorded in this prototype."
            onDeny={denyMic}
            onAllow={allowMic}
          />
        ) : (
          /* introTray: a bottomSheet with a mascot and rows in its middle
             section and a Bottom-sheet App Bar. Neither slot exists on the
             code `BottomSheet`, so the tray is built inline from its tokens. */
          <div className={styles.layer}>
            <button type="button" className={styles.scrimTap} aria-label="Close" onClick={dismiss} />
            <div className={styles.tray} role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <button type="button" className={styles.appBar} aria-label="Close" onClick={dismiss}>
                <span className={styles.handle} />
              </button>
              <div className={styles.intro}>
                <MascotSlot size="2XL" name="standby" />
                <div id={titleId}>
                  <TextBlock as="h1" headline="Explain it to Knowie" />
                </div>
                <ul className={styles.rows}>
                  {rows.map((row) => (
                    <li key={row.icon} className={styles.row}>
                      <span className={styles.rowIcon}>
                        <IconSlot size="300" name={row.icon} />
                      </span>
                      <span className={styles.rowText}>{row.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.actions}>
                <Button variant="Primary" size="L" onClick={start}>
                  Start
                </Button>
                <Button variant="Text" size="L" onClick={cantTalk}>
                  I can’t talk right now
                </Button>
              </div>
            </div>
          </div>
        )
      }
    />
  );
}

export default function SectionIntroPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  if (!sections.some((s) => s.id === section)) notFound();
  return <IntroTray />;
}
