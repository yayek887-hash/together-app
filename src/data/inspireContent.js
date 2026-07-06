export const INTERESTS = [
  { key: "fitness",    label: "Fitness",    emoji: "💪", color: "#e05a00", bg: "#fff0ea" },
  { key: "motivation", label: "Motivation", emoji: "🔥", color: "#dc2626", bg: "#fff5f5" },
  { key: "study",      label: "Study",      emoji: "📚", color: "#2563eb", bg: "#eff6ff" },
  { key: "business",   label: "Business",   emoji: "🚀", color: "#7c3aed", bg: "#f5f3ff" },
  { key: "art",        label: "Art",        emoji: "🎨", color: "#db2777", bg: "#fdf2f8" },
  { key: "gaming",     label: "Gaming",     emoji: "🎮", color: "#059669", bg: "#ecfdf5" },
  { key: "music",      label: "Music",      emoji: "🎵", color: "#b45309", bg: "#fffbeb" },
  { key: "faith",      label: "Faith",      emoji: "🙏", color: "#0891b2", bg: "#ecfeff" },
  { key: "wellness",   label: "Wellbeing",  emoji: "🌱", color: "#16a34a", bg: "#f0fdf4" },
  { key: "creativity", label: "Creativity", emoji: "✨", color: "#9333ea", bg: "#fdf4ff" },
];

export const INSPIRE_CARDS = {
  fitness: [
    { type: "challenge", emoji: "💪", title: "Today's challenge",  text: "Do 15 minutes of movement you actually enjoy — dance, walk, or workout. Done is better than perfect." },
    { type: "quote",     emoji: "🏃", title: "Keep going",         text: "\"The only workout you regret is the one you didn't do.\"" },
    { type: "tip",       emoji: "🥗", title: "Fuel yourself",      text: "Drink a glass of water right now. Your body will thank you." },
  ],
  motivation: [
    { type: "quote",     emoji: "🔥", title: "Daily spark",        text: "\"You don't have to be great to start, but you have to start to be great.\"" },
    { type: "challenge", emoji: "🎯", title: "One step today",     text: "Pick one thing you've been putting off. Do just 5 minutes of it. That's all." },
    { type: "tip",       emoji: "🧠", title: "Mindset shift",      text: "Replace \"I have to\" with \"I get to\". Watch how your whole day changes." },
  ],
  study: [
    { type: "tip",       emoji: "⏱️", title: "Pomodoro method",   text: "Study 25 min, break 5 min. Repeat 4 times. Proven to boost focus." },
    { type: "challenge", emoji: "📖", title: "Tonight's goal",     text: "Review your notes from the last class for just 10 minutes before bed." },
    { type: "quote",     emoji: "🎓", title: "Study wisdom",       text: "\"The expert in anything was once a beginner.\"" },
  ],
  business: [
    { type: "challenge", emoji: "💡", title: "Idea of the day",   text: "Write down one problem you notice around you today. That's a potential business." },
    { type: "tip",       emoji: "📈", title: "Entrepreneur tip",   text: "Successful people don't wait for the perfect moment — they create it." },
    { type: "quote",     emoji: "🚀", title: "Dream big",          text: "\"Your vision is only impossible until someone does it.\"" },
  ],
  art: [
    { type: "challenge", emoji: "🎨", title: "Create something",  text: "Spend 10 minutes creating anything — a sketch, a doodle, a color experiment. No rules." },
    { type: "tip",       emoji: "👁️", title: "Creative tip",      text: "Inspiration is everywhere. Take a photo of something beautiful today." },
    { type: "quote",     emoji: "✏️", title: "Artist's truth",    text: "\"Creativity takes courage.\" — Henri Matisse" },
  ],
  gaming: [
    { type: "tip",       emoji: "🎮", title: "Level up IRL",      text: "Gaming teaches problem-solving and strategy. What skill from gaming can you use in real life today?" },
    { type: "challenge", emoji: "🏆", title: "Real-life quest",   text: "Complete one real-life task you keep postponing. Achievement unlocked." },
    { type: "quote",     emoji: "🕹️", title: "Game on",           text: "\"Every expert was once a noob.\" Keep playing, keep growing." },
  ],
  music: [
    { type: "challenge", emoji: "🎵", title: "Mood playlist",     text: "Build a playlist for the mood you WANT to be in — not the mood you're in now." },
    { type: "tip",       emoji: "🎧", title: "Focus music",        text: "Instrumental music (lofi, classical) can boost focus while studying. Try it today." },
    { type: "quote",     emoji: "🎶", title: "Music is life",      text: "\"Music gives a soul to the universe, wings to the mind.\" — Plato" },
  ],
  faith: [
    { type: "challenge", emoji: "🙏", title: "Gratitude moment",  text: "Take 2 minutes to think of 3 things you're thankful for right now. Really feel it." },
    { type: "quote",     emoji: "☀️", title: "Daily light",       text: "\"Faith is taking the first step even when you can't see the whole staircase.\"" },
    { type: "tip",       emoji: "💫", title: "Be still",          text: "Before the day gets busy, take 60 seconds of silence. It resets everything." },
  ],
  wellness: [
    { type: "tip",       emoji: "🌱", title: "Today's care",      text: "Go outside for 5 minutes. Fresh air and natural light genuinely improve your mood." },
    { type: "challenge", emoji: "😴", title: "Sleep challenge",   text: "Put your phone away 30 minutes earlier tonight. Your tomorrow-self will thank you." },
    { type: "quote",     emoji: "🧘", title: "Wellbeing truth",   text: "\"Almost everything will work again if you unplug it for a few minutes, including you.\"" },
  ],
  creativity: [
    { type: "challenge", emoji: "✨", title: "Write a line",      text: "Write the first sentence of a story that starts with: \"Nobody expected it to happen that way.\"" },
    { type: "tip",       emoji: "💭", title: "Think differently", text: "Ask yourself: what's the most unexpected solution to a problem I'm facing today?" },
    { type: "quote",     emoji: "🌈", title: "Be original",       text: "\"You can't use up creativity. The more you use, the more you have.\" — Maya Angelou" },
  ],
};

export function getDailyCard(topic) {
  const cards = INSPIRE_CARDS[topic];
  if (!cards) return null;
  const day = Math.floor(Date.now() / 86400000);
  return cards[day % cards.length];
}
