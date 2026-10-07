/* Everything the game says, in one place. Each line can be recorded in a grown-up's voice;
   anything not recorded falls back to the device's text-to-speech. */
(function () {
  const L = {};
  const G = [];   // groups for the recording screen
  function group(title, items) { G.push({ title, ids: Object.keys(items) }); Object.assign(L, items); }

  group("Getting started", {
    hello: "Hello Bella! Let's play with the dinosaurs!",
    pick_game: "Pick a game!",
    win: "Hooray Bella! You did it! Clever girl!",
    yes: "Yes! Well done!",
    oops: "Oops, not that one. Try again!",
    hmm: "Hmm, not that one. Try again!"
  });
  group("Meet the Dinos", {
    meet_prompt: "Tap a dinosaur to say hello!",
    meet_trex: "This is T-Rex! T-Rex has a big head and teeny tiny arms. Rawr!",
    meet_triceratops: "This is Triceratops! Triceratops has three horns on its head. One, two, three!",
    meet_stegosaurus: "This is Stegosaurus! Stegosaurus has pointy plates all along its back.",
    meet_brachiosaurus: "This is Brachiosaurus! Brachiosaurus has a very, very long neck to munch the tall trees.",
    meet_pterodactyl: "This is Pterodactyl! Pterodactyl can fly high up in the sky. Whoosh!",
    meet_ankylosaurus: "This is Ankylosaurus! Ankylosaurus has a bumpy back and a big club on its tail."
  });
  group("Colour Hunt", {
    colour_green: "Find the green dinosaur!",
    colour_orange: "Find the orange dinosaur!",
    colour_purple: "Find the purple dinosaur!",
    colour_blue: "Find the blue dinosaur!",
    colour_yellow: "Find the yellow dinosaur!",
    colour_pink: "Find the pink dinosaur!",
    colour_red: "Find the red dinosaur!"
  });
  group("Count the Eggs", {
    count_prompt: "Tap the eggs to count them!",
    n1: "One!", n2: "Two!", n3: "Three!", n4: "Four!", n5: "Five!",
    eggs_1: "One egg! One baby dinosaur! Hooray!",
    eggs_2: "Two eggs! Two baby dinosaurs! Hooray!",
    eggs_3: "Three eggs! Three baby dinosaurs! Hooray!",
    eggs_4: "Four eggs! Four baby dinosaurs! Hooray!",
    eggs_5: "Five eggs! Five baby dinosaurs! Hooray!"
  });
  group("Feed Me", {
    feed_trex: "T-Rex is hungry! T-Rex eats meat. Tap the meat!",
    feed_triceratops: "Triceratops is hungry! Triceratops eats leaves. Tap the leaves!",
    feed_stegosaurus: "Stegosaurus is hungry! Stegosaurus eats leaves. Tap the leaves!",
    feed_brachiosaurus: "Brachiosaurus is hungry! Brachiosaurus eats leaves. Tap the leaves!",
    feed_pterodactyl: "Pterodactyl is hungry! Pterodactyl eats fish. Tap the fish!",
    feed_ankylosaurus: "Ankylosaurus is hungry! Ankylosaurus eats leaves. Tap the leaves!",
    yum: "Yum yum yum! Thank you Bella!"
  });
  group("Dino Band and Big or Small", {
    band_prompt: "Tap the dinosaurs to make dino music!",
    size_big: "Which dinosaur is big? Tap the big one!",
    size_small: "Which dinosaur is small? Tap the small one!",
    size_yes_big: "Yes! That one is big! Well done!",
    size_yes_small: "Yes! That one is small! Well done!",
    size_no_big: "That one is big. Can you find the small one?",
    size_no_small: "That one is small. Can you find the big one?"
  });
  group("Dino Family", {
    fam_pick: "Which dinosaur family do you want to look after?",
    fam_egg: "Mummy has an egg! Tap the egg to keep it warm.",
    fam_intro: "Here's your dinosaur family! Tap a dinosaur, then tap a button to look after them.",
    egg_1: "It's wobbling!", egg_2: "I can hear a tap, tap, tap!", egg_3: "Keep it warm!", egg_4: "Nearly there!",
    hatched: "Hooray! Baby hatched! Hello Baby! Let's look after Baby together.",
    egg_first: "Tap the egg first to help it hatch!",
    dad_1: "Hello Bella! I'm Daddy dinosaur. Rawr!",
    dad_2: "Daddy dinosaur is here! Stomp, stomp, stomp!",
    mum_1: "Hello sweetheart! I'm Mummy dinosaur.",
    mum_2: "Mummy dinosaur gives the best cuddles!",
    baby_1: "Hi Bella! I'm Baby dinosaur! Will you play with me?",
    baby_2: "Baby dinosaur loves you, Bella!",
    sleeping: "Shh! Someone is sleeping.",
    full: "All full up! Burp! Excuse me!",
    bath: "Splish splash! All clean and shiny!",
    night: "Shh. Night night. Sleep tight.",
    morning: "Good morning! What a lovely sleep. Big stretch!",
    play: "Wheee! Catch the ball! So much fun!",
    cuddle: "Aww! I love you, Bella!"
  });

  window.LINES = L;
  window.LINE_GROUPS = G;
})();
