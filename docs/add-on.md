
Add-on: Locked-as-Grey & Unlocked-only Filter

1) UX behavior
	•	Fishdex cards
	•	Locked: muted/grey presentation (no color accents), optional silhouette; tap opens Locked Detail with “How to unlock.”
	•	Unlocked: full-color card with species image and rarity pill.
	•	Filter control
	•	Top-bar chip: “Unlocked only” (toggle). When ON, the grid shows only unlocked species.
	•	Shows a count: Unlocked X / Y.
	•	Persist the toggle locally; remember the user’s last choice.

2) Figma updates
	•	FishCard variants
	•	state={locked|hint|unlocked|new}
	•	Locked styling:
	•	Image container: neutral grey surface (#F2F3F5), fish silhouette (SVG) or blurred thumbnail at 40–60% opacity.
	•	Text color: onSurface-weak (e.g., #8A8F98).
	•	Rarity pill: outline only, grey border.
	•	Optional lock icon at top-right (12–14 px).
	•	Fishdex header
	•	Left: Search.
	•	Right: Filter sheet icon + a chip: Unlocked only (selected/neutral states).
	•	Add a small progress pill: X/Y unlocked.
	•	Empty states
	•	When filter hides all: “No unlocked species yet—log your first catch to unlock.” with CTA Log a catch (link to Log flow).
	•	Prototype
	•	Interaction: toggling the chip sets a page-level variable that swaps the grid source between AllSpecies and UnlockedSpecies.

3) Data model & logic
	•	Derived unlocked set
	•	A species is unlocked if there exists ≥ 1 Catch with catch.fishId === species.id.
	•	Cache an unlocked: boolean map in memory for quick lookup.
	•	Persistence
	•	Save showUnlockedOnly: boolean to local storage.

// pseudo-types
type Fish = { id: string; name: string; images: { card: string } /* … */ }
type Catch = { id: string; fishId: string /* … */ }

// derive unlocked map
const unlockedSet = new Set(catches.map(c => c.fishId));
const isUnlocked = (fishId: string) => unlockedSet.has(fishId);

4) Expo implementation (RN)
	•	List
	•	Use FlashList or FlatList with 2–3 columns.
	•	Memoize filtered data:

const [showUnlockedOnly, setShowUnlockedOnly] = useState(prevValue());
const filtered = useMemo(
  () => fish.filter(f => !showUnlockedOnly || isUnlocked(f.id)),
  [fish, showUnlockedOnly, catches]
);


	•	Card styling
	•	Keep one FishCard component with a state prop:

<FishCard
  state={isUnlocked(item.id) ? 'unlocked' : 'locked'}
  imageUri={item.images.card}
  /* … */
/>


	•	Grey look (no native filters needed):
	•	Show a neutral placeholder (SVG silhouette) instead of the actual photo or
	•	Show the photo with opacity: 0.5 + an absolute grey overlay rgba(0,0,0,0.35) to desaturate the overall feel (portable across iOS/Android/web).

	•	Header chip

<FilterChip
  label="Unlocked only"
  selected={showUnlockedOnly}
  onPress={() => {
    const next = !showUnlockedOnly;
    setShowUnlockedOnly(next);
    saveToStorage(next);
  }}
/>
<Text>{`${unlockedSet.size}/${fish.length} unlocked`}</Text>



5) Motion & feedback
	•	When a species moves from locked → unlocked (after submit in Log flow):
	•	In Fishdex, animate that card: scale 0.94 → 1.0 + fade 0 → 1 (180–220 ms).
	•	If Unlocked only is ON, the card appears in the filtered grid with a short fade-in (120 ms).
	•	Optional Lottie “confetti/splash” toast at the bottom (≤1.2 s).

6) Accessibility
	•	Locked cards expose accessibilityHint="Locked species"; unlocked have full labels.
	•	Do not use color alone: include a small lock icon or “Locked” label for screen readers.
	•	Maintain contrast ≥ 4.5:1 for text on grey cards.

7) Edge cases & rules
	•	Search + Unlocked only: intersection (search filters within unlocked set).
	•	Sorting: when showing all, order by sort key but keep a visual separation (optional subheader: Unlocked, Locked).
	•	Photos unavailable: fallback to family silhouette (SVG) for both locked and unlocked.

8) QA checklist
	•	Toggling “Unlocked only” persists across app restarts.
	•	Logging a catch immediately unlocks the species and updates counts without reload.
	•	Empty states render for both “no species at all” and “filter hides all.”
	•	Grid virtualization remains smooth at 200+ species.
