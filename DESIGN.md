# StudyScroll Design System

## Direction

Faithfully implement the supplied Figma file. StudyScroll uses a dark, compact, mobile-first product language: cool near-black surfaces, powder-blue actions, restrained lavender outlines, Sora for display and question titles, IBM Plex Sans for prose, and IBM Plex Mono for metadata and controls.

## Color

- Surface: #121318
- Elevated surface: #1A1A24
- Control surface: #27282E
- Neutral variant: #2D2D3B
- Outline: #8F8E9D
- Primary 80: #ADC6FF
- Primary 70: #7DAAFF
- Primary 90: #D8E2FF
- Primary 20: #102766
- Text: #E3E1EB
- Secondary text: #BFC6DC
- Success surface: #203D34
- Success outline: #3F7C64
- Caution surface: #3A2329
- Caution outline: #81505C

## Typography

- Display: Sora ExtraBold, used only for the landing hero.
- Titles: Sora SemiBold.
- Body: IBM Plex Sans Regular/Bold.
- Labels and metadata: IBM Plex Mono Medium.
- App typography uses a fixed rem scale; landing display type may scale within the Figma proportions.

## Layout

- Primary design viewport: 393 x 852 px.
- Mobile page gutters: 24 px.
- App bottom navigation and sheet actions respect device safe areas.
- Desktop presentation centers the mobile product in a restrained preview shell.
- Cards use 16 px radii; pills are reserved for actions and compact tags.

## Components

- Question cards contain persona, level, topic, question, code clue, answer action, share, and save.
- Bottom sheets handle question judgment, results, topic filtering, and difficulty filtering.
- Primary actions use the powder-blue fill with dark blue text.
- Secondary actions use a powder-blue outline.
- Correct and caution feedback use semantic tinted surfaces plus explicit labels.

## Motion

- Product transitions run 150-250 ms with confident ease-out curves.
- Sheets slide from the bottom with a fading backdrop.
- Pressed controls compress subtly.
- Reduced-motion mode removes movement while retaining immediate state changes.