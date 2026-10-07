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

  group("Dino Match", {
    match_prompt: "Find two dinosaurs that are the same!",
    match_yes: "It's a match!",
    match_no: "Not the same. Try again!"
  });
  group("Dino Puzzle", {
    puzzle_prompt: "Put the pieces together to make the dinosaur! Tap a piece, then tap where it goes.",
    puzzle_done: "You did it! Look at the dinosaur!"
  });
  group("Spot the Difference", {
    spot_prompt: "Look carefully! Something is different in the second picture. Can you find it?",
    spot_yes: "You found it!",
    spot_more: "There's another one! Keep looking!",
    spot_no: "Hmm, that one is the same. Look again!"
  });
  group("Alphabet", {
    abc_prompt: "Let's find letters!",
    letter_A: "Find the letter A! A is for Ankylosaurus!", letter_B: "Find the letter B! B is for Brachiosaurus!",
    letter_C: "Find the letter C! C is for cake!", letter_D: "Find the letter D! D is for dinosaur!",
    letter_E: "Find the letter E! E is for egg!", letter_F: "Find the letter F! F is for fish!",
    letter_G: "Find the letter G! G is for grapes!", letter_H: "Find the letter H! H is for hat!",
    letter_I: "Find the letter I! I is for ice cream!", letter_J: "Find the letter J! J is for jelly!",
    letter_K: "Find the letter K! K is for kite!", letter_L: "Find the letter L! L is for lion!",
    letter_M: "Find the letter M! M is for moon!", letter_N: "Find the letter N! N is for nest!",
    letter_O: "Find the letter O! O is for octopus!", letter_P: "Find the letter P! P is for Pterodactyl!",
    letter_Q: "Find the letter Q! Q is for queen!", letter_R: "Find the letter R! R is for rainbow!",
    letter_S: "Find the letter S! S is for Stegosaurus!", letter_T: "Find the letter T! T is for T-Rex!",
    letter_U: "Find the letter U! U is for umbrella!", letter_V: "Find the letter V! V is for volcano!",
    letter_W: "Find the letter W! W is for whale!", letter_X: "Find the letter X! X is for xylophone!",
    letter_Y: "Find the letter Y! Y is for yo-yo!", letter_Z: "Find the letter Z! Z is for zebra!"
  });
  group("Numbers 1 to 30 (Count the Eggs and Count to 30)", {
    c30_prompt: "Let's count to thirty! Tap the numbers in order. Tap one first!",
    n1: "One!", n2: "Two!", n3: "Three!", n4: "Four!", n5: "Five!",
    n6: "Six!", n7: "Seven!", n8: "Eight!", n9: "Nine!", n10: "Ten!",
    n11: "Eleven!", n12: "Twelve!", n13: "Thirteen!", n14: "Fourteen!", n15: "Fifteen!",
    n16: "Sixteen!", n17: "Seventeen!", n18: "Eighteen!", n19: "Nineteen!", n20: "Twenty!",
    n21: "Twenty-one!", n22: "Twenty-two!", n23: "Twenty-three!", n24: "Twenty-four!", n25: "Twenty-five!",
    n26: "Twenty-six!", n27: "Twenty-seven!", n28: "Twenty-eight!", n29: "Twenty-nine!", n30: "Thirty!",
    c30_ten: "Ten! Keep going!",
    c30_twenty: "Twenty! Nearly there!",
    c30_done: "Thirty! You counted all the way to thirty! Amazing!",
    c30_no: "Oops, not that one. What comes next?"
  });

  window.LINES = L;
  window.LINE_GROUPS = G;
})();
