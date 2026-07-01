// Narration helpers — semantic wrappers over speak()

export const narrationScripts = {
  home: [
    "Ready to uncover hidden stories in data?",
    "Join Chart the Owl on a data adventure! Learn to read, build, and compare bar graphs through real stories, hands-on simulations, and 10 exciting worlds of practice.",
  ],
  wonder: {
    intro: ["Hmm... I wonder..."],
    followUp: (text) => [text],
  },
  story: {
    page1: [
      "Aunty Lin sold fruits at the market today. She counted 8 apples, 5 mangoes, and 3 longans sold.",
      "Let's help Aunty Lin show her sales!",
    ],
    page2: [
      "Aunty Lin draws a line up — the vertical axis — and a line across — the horizontal axis — to make her graph.",
      "Every graph needs two axes to stand on!",
    ],
    page3: [
      "She draws one bar for each fruit. The taller the bar, the more fruits she sold!",
      "Look — Apples have the tallest bar!",
    ],
    page4: [
      "Now everyone can see at a glance which fruit sold the most — just by looking at the bars!",
      "That's the power of a bar graph!",
    ],
  },
  simulate: {
    welcome: ["Welcome to the Simulator! Explore bar graphs with no wrong answers here."],
    barBuilder: ["Drag each bar to match the data in the table. When it matches, you'll see a green check!"],
    scaleSlider: ["Watch how changing the scale changes the look of the graph — but not the data!"],
    orientation: ["Toggle between vertical and horizontal to see the same data in two ways!"],
    spotError: ["Can you spot the mistake in this graph? Tap on the error to find out!"],
    foundError: ["Great job! You found the error!"],
  },
  play: {
    intro: ["Choose a world and answer 8 questions to earn stars and XP!"],
    correct: ["Fantastic! That's correct!"],
    wrong: ["Almost! Let's try again!"],
    streak: ["Amazing streak! Keep going!"],
    worldDone: ["You've completed this world!"],
  },
  reflect: {
    complete: ["Journey Complete! You finished all 5 phases!"],
    high: ["Outstanding! You're a true Data Detective!"],
    mid: ["Great progress! A little more practice and you'll master every bar!"],
    low: ["Good start! Let's revisit the Story and Simulate to build confidence."],
  },
}

export function getReflectNarration(pct) {
  if (pct >= 90) return narrationScripts.reflect.high
  if (pct >= 60) return narrationScripts.reflect.mid
  return narrationScripts.reflect.low
}
