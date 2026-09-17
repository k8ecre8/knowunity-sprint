/* Mock terms for the recall loop — see SPEC.md → How the mocked recall behaves.
   Nothing here listens or judges: every term carries a script, one step per
   judged answer, and the turn screens walk it. The section round below is the
   Plate Tectonics script from the spec: term 1 correct first try, term 2
   partial then correct with the slow beat, term 3 the full ladder with the
   error on its second judgement. Review and exam-eve seeds are Open 24 and
   are not here yet. */

export type Round = 'section' | 'review' | 'eve';

export type StepKind = 'correct' | 'partial' | 'miss' | 'unclear' | 'question';

export type ScriptStep = {
  kind: StepKind;
  /** What the mocked transcription shows for this take. */
  transcript: string;
  /** Overrides the judging wait: 'slow' resolves between 4s and 10s, 'error' passes 10s. */
  delay?: 'slow' | 'error';
};

export type Term = {
  id: string;
  /** The label on summary cards. */
  name: string;
  prompt: string;
  /** Second wording, used by the exam-eve repeat. */
  promptB: string;
  hints: [string, string];
  answer: string;
  script: ScriptStep[];
  /** ISO timestamp of when the student last revised it. */
  lastSeenAt: string;
};

export type Section = {
  id: string;
  name: string;
  terms: Term[];
};

const revisedAt = '2026-09-16T09:00:00.000Z';

export const plateTectonics: Section = {
  id: 'plate-tectonics',
  name: 'Plate tectonics',
  terms: [
    {
      id: 'why-plates-move',
      name: 'Why plates move',
      prompt: 'Explain to Knowie why tectonic plates move.',
      promptB: 'What drives the movement of tectonic plates?',
      hints: [
        'Think about what is happening in the mantle underneath the plates.',
        'Hot material rises, cools and sinks. What does that circulation do to the plates above it?',
      ],
      answer:
        'Convection currents in the mantle drag the plates along: hot rock rises, spreads under the crust, cools and sinks again.',
      script: [{ kind: 'correct', transcript: 'The mantle has convection currents, so hot rock rises and spreads out and drags the plates with it, then sinks when it cools.' }],
      lastSeenAt: revisedAt,
    },
    {
      id: 'divergent-boundaries',
      name: 'Divergent boundaries',
      prompt: 'Explain to Knowie what happens at a divergent boundary.',
      promptB: 'Describe a divergent plate boundary and what it produces.',
      hints: [
        'Divergent means moving apart. What fills the gap when two plates separate?',
        'Magma rises into the gap and cools. What new feature does that build, and where do you find one?',
      ],
      answer:
        'At a divergent boundary two plates move apart, magma rises to fill the gap and cools into new crust, forming a mid-ocean ridge.',
      script: [
        { kind: 'partial', transcript: 'The plates move away from each other.', delay: 'slow' },
        { kind: 'correct', transcript: 'The plates move apart and magma comes up between them and hardens into new crust, like at a mid-ocean ridge.' },
      ],
      lastSeenAt: revisedAt,
    },
    {
      id: 'transform-boundaries',
      name: 'Transform boundaries',
      prompt: 'Explain to Knowie what happens at a transform boundary.',
      promptB: 'What is a transform boundary, and why does it cause earthquakes?',
      hints: [
        'No crust is made or destroyed at a transform boundary. So what are the plates doing?',
        'The plates slide past each other sideways. What happens when they catch and then suddenly slip?',
      ],
      answer:
        'At a transform boundary two plates slide past each other horizontally. They stick, strain builds up, and when they slip it releases as an earthquake.',
      script: [
        { kind: 'miss', transcript: 'One plate goes under the other one.' },
        { kind: 'miss', transcript: 'They push into each other and make mountains.', delay: 'error' },
        { kind: 'miss', transcript: 'I think they crash together.' },
      ],
      lastSeenAt: revisedAt,
    },
  ],
};

/* --- exam-eve repeat seeds (Open 24, decided here) ------------------------
   Twelve terms, reached from `/?day=eve`, every one asked with `promptB`.
   The scripts give the repeat summary's "misses" frame when walked with no
   discards: one needs practice, three needed a hint, eight correct without
   help. The three Plate tectonics terms are the same objects as above, so
   the tester's own section rows can be merged in by id. */

const eveRevisedAt = '2026-09-15T18:30:00.000Z';

function eveTerm(
  id: string,
  name: string,
  prompt: string,
  promptB: string,
  hints: [string, string],
  answer: string,
  script: ScriptStep[],
): Term {
  return { id, name, prompt, promptB, hints, answer, script, lastSeenAt: eveRevisedAt };
}

const correct = (transcript: string): ScriptStep[] => [{ kind: 'correct', transcript }];
const hinted = (first: string, then: string): ScriptStep[] => [
  { kind: 'partial', transcript: first },
  { kind: 'correct', transcript: then },
];

export const examEveTerms: Term[] = [
  // needs practice
  { ...plateTectonics.terms[2] },
  // needed a hint
  { ...plateTectonics.terms[0], script: hinted('The plates float on the mantle.', 'Convection in the mantle drags them: hot rock rises, spreads, cools and sinks.') },
  eveTerm(
    'how-volcanoes-form',
    'How volcanoes form',
    'Explain to Knowie how a volcano forms.',
    'Where does the magma in a volcano come from, and how does it reach the surface?',
    ['Think about where crust is being destroyed. What happens to a plate that sinks?', 'The sinking plate melts. Where does that molten rock go?'],
    'At a subduction zone the sinking plate melts, the magma is less dense than the rock around it, so it rises through cracks and erupts.',
    hinted('Magma comes out of the ground.', 'A sinking plate melts, the magma rises because it is less dense and erupts at the surface.'),
  ),
  eveTerm(
    'fossil-dating',
    'Fossil dating',
    'Explain to Knowie how fossils help date rock layers.',
    'How can a fossil tell you the age of the rock it sits in?',
    ['Some species lived for only a short time. What does finding one tell you?', 'If a species lived for one short period, any rock holding it formed then.'],
    'Index fossils come from species that lived briefly and widely, so a layer holding one formed during that short period.',
    hinted('Older fossils are lower down.', 'Index fossils are from species that lived briefly, so a layer holding one formed in that period.'),
  ),
  // correct without help
  { ...plateTectonics.terms[1] , script: correct('The plates move apart, magma rises into the gap and cools into new crust at a mid-ocean ridge.') },
  eveTerm(
    'convergent-boundaries',
    'Convergent boundaries',
    'Explain to Knowie what happens at a convergent boundary.',
    'Describe a convergent plate boundary and what it produces.',
    ['Convergent means moving together. What happens when two plates collide?', 'One plate is forced under the other, or they crumple upwards.'],
    'At a convergent boundary two plates move together: an oceanic plate subducts under the other, or two continental plates crumple into mountains.',
    correct('Two plates push together, so one goes under the other, or they crumple up into mountains.'),
  ),
  eveTerm(
    'rock-layers',
    'Rock layers',
    'Explain to Knowie what rock layers show.',
    'What does the order of rock layers tell you about when they formed?',
    ['Layers build up over time. Which one was there first?', 'The lowest layer was laid down first, unless something has disturbed it.'],
    'Sedimentary layers build up over time, so the lowest is oldest and the top is youngest, unless folding or faulting has disturbed them.',
    correct('The bottom layer is the oldest and the top is the youngest, because they build up over time.'),
  ),
  eveTerm(
    'subduction-zones',
    'Subduction zones',
    'Explain to Knowie what a subduction zone is.',
    'What happens to an oceanic plate at a subduction zone?',
    ['Oceanic crust is denser than continental crust. Which one sinks?', 'The denser oceanic plate sinks into the mantle. What features does that make?'],
    'At a subduction zone the denser oceanic plate sinks under the other plate into the mantle, forming a trench and, further in, volcanoes.',
    correct('The denser oceanic plate sinks under the other one into the mantle, making a trench and volcanoes.'),
  ),
  eveTerm(
    'earthquake-waves',
    'Earthquake waves',
    'Explain to Knowie the two kinds of earthquake wave.',
    'What is the difference between P waves and S waves?',
    ['One kind arrives first. Which, and why?', 'P waves push and pull and travel through liquid. S waves shake sideways and cannot.'],
    'P waves are faster compression waves that pass through solids and liquids. S waves are slower, shake side to side and only pass through solids.',
    correct('P waves are faster and go through liquids, S waves are slower, move sideways and only go through solids.'),
  ),
  eveTerm(
    'continental-drift-evidence',
    'Continental drift evidence',
    'Explain to Knowie the evidence for continental drift.',
    'What evidence did Wegener use to argue the continents had moved?',
    ['Look at a map of the Atlantic. What do the coastlines suggest?', 'The coastlines fit, and the same fossils and rock types appear on both sides.'],
    'The coastlines of South America and Africa fit together, and matching fossils and rock formations are found on both sides of the ocean.',
    correct('The continents fit together like a jigsaw, and the same fossils and rocks are found on both sides of the Atlantic.'),
  ),
  eveTerm(
    'the-rock-cycle',
    'The rock cycle',
    'Explain to Knowie the rock cycle.',
    'How does one type of rock turn into another over time?',
    ['There are three rock types. What turns one into the next?', 'Heat and pressure, melting and cooling, weathering and deposition each move rock along.'],
    'Igneous rock weathers into sediment that becomes sedimentary rock; heat and pressure make it metamorphic; melting and cooling make it igneous again.',
    correct('Rocks weather into sediment, get squashed into sedimentary rock, heat and pressure make metamorphic rock, and melting and cooling makes igneous rock again.'),
  ),
  eveTerm(
    'types-of-volcano',
    'Types of volcano',
    'Explain to Knowie the difference between shield and composite volcanoes.',
    'Why are some volcanoes wide and gentle while others are steep and explosive?',
    ['Think about how runny the lava is. What does runny lava do?', 'Runny lava spreads far and builds a wide dome. Thick lava traps gas and erupts violently.'],
    'Shield volcanoes have runny lava that flows far, so they are wide and gentle. Composite volcanoes have thick lava that traps gas, so they are steep and explosive.',
    correct('Shield volcanoes have runny lava so they are wide and gentle, composite ones have thick sticky lava that traps gas so they erupt violently.'),
  ),
];

/* --- review seeds (Open 24, decided here) ---------------------------------
   Ten terms, reached from `/plan?day=review`, each last revised three days
   before now, so the review summary can make the days-later claim. The
   scripts give the frame's counts when walked with no discards: eight
   correct without help, Divergent boundaries needed a hint, Transform
   boundaries needs practice. The seven non-Plate-tectonics terms are the
   same objects as the exam-eve list, so ids stay stable across rounds. */

const DAY_MS = 24 * 60 * 60 * 1000;
const reviewRevisedAt = new Date(Date.now() - 3 * DAY_MS).toISOString();

const reviewTerm = (term: Term, script: ScriptStep[]): Term => ({ ...term, script, lastSeenAt: reviewRevisedAt });

const eveById = (id: string): Term => {
  const found = examEveTerms.find((t) => t.id === id);
  if (!found) throw new Error(`No exam-eve term ${id}`);
  return found;
};

export const reviewTerms: Term[] = [
  // The one scripted unclear take (SPEC.md → Verification → path 2): the
  // first take lands on "didn't catch that", uses no hint and is not judged.
  reviewTerm(plateTectonics.terms[0], [
    { kind: 'unclear', transcript: '' },
    { kind: 'correct', transcript: 'Convection currents in the mantle drag the plates along as hot rock rises, spreads, cools and sinks.' },
  ]),
  reviewTerm(plateTectonics.terms[1], hinted('They move apart.', 'They move apart and magma rises into the gap and hardens into new crust, making a mid-ocean ridge.')),
  reviewTerm(plateTectonics.terms[2], [
    { kind: 'miss', transcript: 'One plate sinks under the other.' },
    { kind: 'miss', transcript: 'They collide and push up mountains.' },
    { kind: 'miss', transcript: 'I think crust gets destroyed there.' },
  ]),
  reviewTerm(eveById('convergent-boundaries'), correct('Two plates move together: one subducts under the other, or they crumple into mountains.')),
  reviewTerm(eveById('subduction-zones'), correct('The denser oceanic plate sinks under the other plate into the mantle, making a trench and volcanoes.')),
  reviewTerm(eveById('how-volcanoes-form'), correct('A sinking plate melts, the magma is less dense so it rises through cracks and erupts.')),
  reviewTerm(eveById('rock-layers'), correct('Layers build up over time, so the lowest is oldest and the top is youngest unless they have been disturbed.')),
  reviewTerm(eveById('fossil-dating'), correct('Index fossils are from species that lived briefly and widely, so a layer holding one formed in that period.')),
  reviewTerm(eveById('earthquake-waves'), correct('P waves are faster and pass through liquids; S waves are slower, shake sideways and only pass through solids.')),
  reviewTerm(eveById('continental-drift-evidence'), correct('The coastlines fit together and the same fossils and rocks are found on both sides of the Atlantic.')),
];

/* --- confidence (Open 5 and Open 24, decided here) -------------------------
   One whole-plan rating on five positions. Figma names three labels ("So
   cooked", "Mostly solid", "Most of it"); the other two are decided here.
   Position 1 is the lowest. The before-plan rating is mocked: the student
   said "So cooked" at onboarding, as the review summary frame draws it. */

export const confidenceLabels = ['So cooked', 'Getting there', 'Most of it', 'Mostly solid', 'Ready'] as const;

/** 1-based position on `confidenceLabels`. */
export const beforePlanRating = 1;

export const sections: Section[] = [plateTectonics];

/** The terms a round asks, in order. */
export function termsForRound(round: Round): Term[] {
  if (round === 'section') return plateTectonics.terms;
  if (round === 'review') return reviewTerms;
  return examEveTerms;
}

export function findTerm(id: string): Term | undefined {
  return [...sections.flatMap((s) => s.terms), ...reviewTerms, ...examEveTerms].find((t) => t.id === id);
}
