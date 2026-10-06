# Bella's Dino Land 🦕

A tap-only dinosaur game for a three-year-old. Runs in any phone or tablet browser, nothing to install.

## Games
- **Dino Family** – tamagotchi-style care game. Pick a family, tap the egg until Baby hatches, then feed, bath, nap, play with and cuddle Mummy, Daddy and Baby. Hearts drop slowly over real time (saved on the device), and the dinos show what they need in a thought bubble. Nothing bad ever happens, they just wait patiently.
- **Meet the Dinos** – tap a dino to hear its name and a fun fact.
- **Colour Hunt** – "Find the GREEN dinosaur!" (5 rounds).
- **Count the Eggs** – tap each egg to count out loud, then they hatch (1 to 5).
- **Feed Me!** – give each dino the food it eats (leaves, meat or fish).
- **Dino Band** – free play, every dino makes its own sound.
- **Big or Small?** – tap the big one or the small one.

## Made for little kids
- Every prompt is spoken out loud, so no reading needed. The 🔊 button repeats it.
- No wrong-answer buzzers. A wrong tap just wobbles and gently says what to look for.
- Soft, friendly sounds made in code (no scary roars, no downloads).
- Big buttons, no zooming or scrolling, works in portrait and landscape.

## Play it
1. Open `index.html` in a browser, or
2. Turn on GitHub Pages: repo **Settings → Pages → Source: GitHub Actions**. Every push to `main` then publishes to `https://<your-username>.github.io/bellasdinogame/`.
3. On an iPad, open the link in Safari, tap Share → **Add to Home Screen** for a full-screen app icon.

Tip: the first tap on "Tap to play!" is what switches the sound and voice on (browsers require a tap first).

## Making the voice sound natural
The game uses the voices built into the device. The default ones can sound robotic.
- **iPad / iPhone:** Settings → Accessibility → Spoken Content → Voices → English → Australian → Karen → download **Enhanced** (or **Premium**). Reopen the game, then tap the small **Voice** button on the start screen and pick the starred voice.
- **Android / Chrome:** the Google voices are picked automatically. The **Voice** button lets you choose another.
- The chosen voice is remembered on that device.

## Files
- `index.html` – screens
- `style.css` – looks and animations
- `dinos.js` – the six cartoon dinos, drawn as SVG, with moods (happy, excited, sleepy, hungry, muddy) and family roles (Mummy bow, Daddy eyebrows, Baby eggshell hat)
- `sounds.js` – sound effects and the voice
- `game.js` – the games
