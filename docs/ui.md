Here’s a crisp, Expo-friendly UI Design Plan for your fishing log + fishdex app, written in English and aligned with free assets (real fish photos, Lottie, badge icons, “Pokédex-style” cards, habit/streak patterns).

1) Product pillars
	•	Record fast, celebrate often: 1–3 taps to log a catch; satisfying unlock/level-up feedback.
	•	Collect & learn: A clean Fishdex that grows with the user’s photos and stats.
	•	Discover without leaking spots: Map + privacy controls (share none/fuzzy/exact).
	•	Offline-first feel: All key screens usable with poor signal; sync later.

2) Information architecture & navigation

Bottom Tabs (5): Home · Fishdex · Log · Achievements · Stats
	•	Home (Stack): feed of recent unlocks, quick actions, “continue goals”.
	•	Fishdex (Stack): grid → detail.
	•	Log (Modal/Stack): stepper for new catch.
	•	Achievements (Stack): badge wall → badge detail.
	•	Stats (Stack): streak + charts + personal bests.

Navigation tech (Expo):
	•	@react-navigation/native + @react-navigation/native-stack
	•	@react-navigation/bottom-tabs
	•	Optional route convention: expo-router if you prefer file-based routing.

3) Key screens (layout, states)

3.1 Home
	•	Header: user avatar, greeting, weather/season chip (read-only), settings icon.
	•	Sections:
	•	Quick Add (CTA): “Log a catch” button.
	•	Recent unlocks (horizontal cards): last 3 fish unlocked.
	•	Ongoing goals (progress cards): “Catch 3 species this week”, “7-day streak”.
	•	Tips/ethics (dismissible chip).
	•	Empty state: playful Lottie + “Log your first catch”.

3.2 Fishdex (grid)
	•	Top bar: search, filter (rarity, region, season), sort (name/rarity/recent).
	•	Grid: 2–3 columns depending on device width.
	•	Card states: locked / hint / unlocked / new.
	•	Contents: image container (1:1), name, ID, tiny rarity tag.
	•	Empty states:
	•	When filtered to none → show “No species match” + clear filters.
	•	Interactions:
	•	Long-press: quick peek (photo + min info).
	•	Tap: open Fish Detail.

3.3 Fish Detail
	•	Hero: large image (4:3), species name + ID, rarity pill.
	•	Tabs: About · Habitat · Your Records
	•	About: length/weight range, family, regulations (min size, closed months).
	•	Habitat: regions chips, season bar (12-month strip), recommended lures.
	•	Your Records: top photo, personal best, latest catches list.
	•	Actions: “Log new catch with this species”, share, favorite.
	•	Locked state: blurred silhouette + “How to discover” hint (e.g., “log a catch” or “scan photo later”).

3.4 Log Catch (stepper modal)
	1.	Photo (camera/library) → crop to square; optional multiple.
	2.	Species (search; prefilled if from detail).
	3.	Size & weight (number inputs with unit toggles).
	4.	Gear (chips/selects).
	5.	Water & location (type + optional map pin; privacy toggle: exact/fuzzy/off).
	6.	Notes & submit → Success screen (Lottie “splash/fireworks” + haptic).

	•	Validation/Autosave: draft saved per step; minimal required fields: photo OR species + date.

3.5 Achievements
	•	Header: “X / Y unlocked”, progress bar.
	•	Grid: badge components with locked/unlocked + tier (bronze/silver/gold).
	•	Detail sheet: criteria, progress, next tier preview, “track this goal”.

3.6 Stats
	•	Streak heatmap (7×n weeks).
	•	Bar cards: catches by species, by water, by month.
	•	Personal bests: largest by weight/length (with photos).
	•	Export/share (image of summary).

3.7 Settings
	•	Profile, units (cm/in, kg/lb), privacy defaults, data backup/export, legal/ethics.

4) Design system (tokens & patterns)

4.1 Colors
	•	Neutrals: for surfaces & text.
	•	Accent by species group (e.g., Salmonidae, Cyprinidae, Percidae…). Map these to a small set of semantic accents to avoid rainbow UI.
	•	Functional: success (green), warning (amber), danger (red), info (blue).
	•	Contrast: text/background ≥ 4.5:1.

4.2 Typography
	•	Expo-friendly: Inter or System font. Sizes (dp): 32/24 (H1/H2), 18 (H3), 16 body, 14 secondary, 12 meta.

4.3 Spacing & radius
	•	Spacing scale: 4, 8, 12, 16, 24.
	•	Corner radius: 12 for cards, 20 for image containers (Fishdex look).
	•	Shadows/Elevation: subtle; rely on contrast and dividers for list density.

4.4 Components (with props)
	•	FishCard
props: { imageUri, name, id, rarity, state: 'locked'|'hint'|'unlocked'|'new' }
	•	Badge
props: { iconName|svg, title, tier: 'bronze'|'silver'|'gold', status: 'locked'|'unlocked' }
	•	ProgressBar / ProgressRing
numeric progress 0..1 + label.
	•	Pills/Chips for filters.
	•	HeatmapCell (pressable square with intensity 0..4).
	•	StatRow (label + value + tiny bar).

5) Motion & feedback
	•	Unlock animation: Lottie (1.0–1.4 s). Trigger after successful log if new species.
	•	Micro-interactions:
	•	Card “new→unlocked” scale 0.94→1 & fade 0→1 (150–220 ms).
	•	Streak day tap highlights (100 ms).
	•	Haptics: light on tap, success on unlock, error on validation fail.

6) Image & asset guidelines (real fish photos)
	•	Card images: square 1:1, centered fish, transparent or soft neutral backdrop.
	•	Detail hero: 4:3; avoid heavy backgrounds.
	•	Hint state: grayscale + 60–70% overlay to create silhouette.
	•	Performance: use expo-image with caching (contentFit="cover", cachePolicy="memory-disk"); prefetch grid thumbnails.

7) Accessibility & i18n
	•	All icons have accessible labels.
	•	Minimum touch target 44×44 dp.
	•	High contrast mode friendly (no color-only status).
	•	Text scalable (supports system font scaling).
	•	Left-to-right today; plan keys for localization.

8) Expo implementation notes (free stack)
	•	UI styling: nativewind (Tailwind for RN) or simple StyleSheet.
	•	Navigation: React Navigation (stacks, tabs, modal).
	•	Animation: react-native-reanimated + moti for tiny flourishes.
	•	Lottie: lottie-react-native (works in Expo).
	•	Forms: react-hook-form + zod (optional).
	•	Images: expo-image.
	•	Location/Media: expo-image-picker, expo-location, expo-file-system.
	•	Haptics: expo-haptics.
	•	Maps (optional): react-native-maps (can be added later).

9) Data → UI (minimal schemas)

// Fish species
type Fish = {
  id: string;           // "salmo-trutta"
  name: string;         // "Brown Trout"
  localName?: string;   // Chinese name if needed
  family?: string;
  rarity: 'common'|'rare'|'epic'|'legend';
  sizeCm: { min: number; max: number };
  weightKgMax?: number;
  habitat?: string[];   // "river", "lake"
  regions?: string[];   // "North", "East" ...
  season?: number[];    // months [4,5,6,9,10]
  regulations?: { minSizeCm?: number; closedMonths?: number[] };
  images: { card: string; hero?: string };
}

// Catch record
type Catch = {
  id: string;
  fishId: string;
  dateISO: string;
  lengthCm?: number;
  weightKg?: number;
  gear?: { rod?: string; lure?: string };
  water?: { type?: string; name?: string };
  location?: { lat: number; lng: number; privacy: 'off'|'fuzzy'|'exact' };
  photoUri?: string;
  released?: boolean;
  notes?: string;
}

	•	Derived UI states:
	•	FishCard locked if no catch for fishId.
	•	hint if AI/vision later suggests a likely species but not confirmed (keep slot now if you want the look).

10) File structure (Expo app)

app/
  (tabs)/
    index.tsx          // Home
    fishdex.tsx        // Grid
    achievements.tsx
    stats.tsx
  fish/
    [id].tsx           // Fish Detail
  log/
    index.tsx          // Log stepper (modal)
components/
  FishCard.tsx
  Badge.tsx
  ProgressBar.tsx
  Heatmap.tsx
  EmptyState.tsx
  ImageCard.tsx
lib/
  theme.ts             // tokens, spacing, colors
  data.ts              // mock data for prototype
  store.ts             // Zustand or simple context
assets/
  lottie/
  images/fish/

11) Free badge set (MVP)
	•	First catch · 3 outings/week · 5 species logged · 10 of one species
	•	3 different waters · 7-day streak · Personal best · Fishdex 25%
Each with locked/unlocked state; 3 tiers for volume-based goals.

12) Analytics events (for later)
	•	catch_logged, species_unlocked, streak_extended, badge_unlocked, filter_used.

13) Success & empty states (copy tone)
	•	Success: “New species unlocked!” / “Personal best!”
	•	Empty: “Your Fishdex awaits. Log a catch to unlock your first species.”

14) Deliverables checklist
	•	Component library in Figma mirroring the React Native components (FishCard, Badge, Pills, Heatmap, Progress).
	•	Prototype flows: Browse Fishdex, Log a Catch, Unlock Celebration.
	•	Token sheet (colors/typography/spacing), sample fish & catch JSON, 3 Lottie files.

