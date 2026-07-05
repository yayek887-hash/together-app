export const MOOD_CONTENT = {
  Happy: {
    color: "#f59e0b",
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    border: "#fde68a",
    affirmation: "I am allowed to feel this happiness fully. It's real, it's mine, and I deserve it.",
    quote: { text: "Joy shared is joy doubled. Let someone know they made your world a little brighter today.", author: "Community wisdom" },
    breathing: {
      name: "Gratitude breath ✨",
      instruction: "Breathe in for 4 counts, thinking of something you're grateful for. Hold for 4. Breathe out slowly for 6, smiling as you do.",
      emoji: "😊",
    },
    challenge: {
      title: "Spread the feeling 🌟",
      text: "Send a genuine compliment or thank-you message to someone who deserves to hear it today.",
    },
    tip: { icon: "🎨", title: "Channel your energy", text: "Good moods are powerful. Use this energy to start something you've been putting off — even just for 10 minutes." },
    starter: { question: "What's one small thing that made you genuinely smile today?", context: "Share it in the community — good feelings are contagious 💛" },
    article: { title: "Why celebrating small wins actually rewires your brain", blurb: "Science shows that noticing your wins — even tiny ones — builds a more resilient, optimistic mindset over time.", readTime: "3 min read" },
    aiSuggestion: "You're in a great place right now. What's one thing you've been wanting to do but kept putting off? Today might be the perfect day to start.",
  },

  Calm: {
    color: "#0891b2",
    bg: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
    border: "#a5f3fc",
    affirmation: "Peace is my natural state. I deserve this quiet, and I will protect it.",
    quote: { text: "Within you there is a stillness — a sanctuary you can return to at any moment, no matter what's happening around you.", author: "Community wisdom" },
    breathing: {
      name: "4-7-8 calm breath 🌊",
      instruction: "Breathe in for 4 counts. Hold gently for 7. Breathe out completely for 8. Repeat 3 times. This is one of the most calming breaths you can do.",
      emoji: "😌",
    },
    challenge: {
      title: "Guard your calm 🛡️",
      text: "Identify one thing today that drains your peace — and make a small decision to protect yourself from it.",
    },
    tip: { icon: "🌿", title: "Use this moment", text: "When you feel calm, it's a great time to check in with yourself. Write down one thing you're proud of and one thing you're looking forward to." },
    starter: { question: "What's a place, song, or moment that always brings you back to peace?", context: "Share it — someone here might really need it right now 💙" },
    article: { title: "How to protect your calm when life gets noisy", blurb: "Calm isn't just a feeling — it's a skill you can build. Here are five micro-habits that keep you grounded even on hard days.", readTime: "4 min read" },
    aiSuggestion: "You're in a calm, clear space right now. This is a wonderful time to reflect — is there something you've been wanting to say or do that you haven't found the courage for yet?",
  },

  Sad: {
    color: "#6366f1",
    bg: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
    border: "#c7d2fe",
    affirmation: "It's okay to not be okay. This feeling is real, it's valid, and it won't last forever. You are not alone in this.",
    quote: { text: "Sadness is just love with nowhere to go right now. But this community is here — and it's okay to let some of it land here.", author: "Community wisdom" },
    breathing: {
      name: "Slow release breath 💜",
      instruction: "Breathe in slowly for 4 counts. Pause for 2. Then breathe out for 8 counts — longer than you breathe in. The long exhale tells your body it's safe.",
      emoji: "😢",
    },
    challenge: {
      title: "One small connection 🤝",
      text: "Reach out to one person today — even just saying 'hey' or sending a meme. You don't have to explain anything. Just connect.",
    },
    tip: { icon: "💧", title: "Let yourself feel it", text: "Crying isn't weakness — it actually releases stress hormones and helps your body process pain. You're allowed to feel sad. You're also allowed to ask for support." },
    starter: { question: "Is there something that's been weighing on you lately that you haven't said out loud yet?", context: "This is a safe place. You can share as much or as little as you want 💜" },
    article: { title: "5 small things to do when everything feels too heavy", blurb: "When sadness makes everything feel impossible, you don't need big solutions. These tiny steps can help you get through the day with more gentleness toward yourself.", readTime: "3 min read" },
    aiSuggestion: "I see you're feeling sad right now, and that's completely okay. Would it help to share what's going on? Sometimes putting feelings into words — even just here — makes them feel a little lighter.",
  },

  Anxious: {
    color: "#7c3aed",
    bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
    border: "#ddd6fe",
    affirmation: "This feeling will pass. Right now, in this moment, I am safe. My body is trying to protect me, and I can slow it down.",
    quote: { text: "You don't have to solve everything right now. You just have to get through this moment — and you've already gotten through every hard moment so far.", author: "Community wisdom" },
    breathing: {
      name: "5-5-5 grounding breath 🌱",
      instruction: "Breathe in for 5 counts. Hold for 5. Breathe out for 5. While you breathe, look around and name 5 things you can see. This brings you back to now.",
      emoji: "😰",
    },
    challenge: {
      title: "One thing only 🎯",
      text: "Write down everything on your mind — then pick just ONE small thing to do today. Cross it off. That's enough.",
    },
    tip: { icon: "🧊", title: "The 5-4-3-2-1 trick", text: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. It's called grounding, and it works by pulling your brain into the present moment." },
    starter: { question: "What's something that helps you feel less anxious? Even something small or weird?", context: "Share it — your tip might be exactly what someone else needs right now 💜" },
    article: { title: "What anxiety actually is — and why it's not your fault", blurb: "Anxiety is your brain's alarm system working overtime. Understanding why it happens can make it feel less scary and more manageable.", readTime: "4 min read" },
    aiSuggestion: "Anxiety can make everything feel urgent. Try writing out your worries — even just a list. Getting them out of your head and onto paper often makes them feel smaller and more manageable.",
  },

  Angry: {
    color: "#dc2626",
    bg: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
    border: "#fecdd3",
    affirmation: "My anger is valid. I am allowed to feel this — and I also have the power to choose what I do with it.",
    quote: { text: "Feeling angry doesn't make you a bad person. It means something matters to you. The question is what to do with that energy.", author: "Community wisdom" },
    breathing: {
      name: "Cool-down breath ❄️",
      instruction: "Breathe in sharply through your nose for 4 counts. Then breathe out slowly through your mouth for 8 counts — like you're blowing out a candle far away. Repeat until you feel the heat leave your chest.",
      emoji: "😡",
    },
    challenge: {
      title: "Wait 10 minutes ⏱️",
      text: "Before responding to whatever made you angry — give yourself exactly 10 minutes. Go for a walk, drink water, shake out your hands. Then decide.",
    },
    tip: { icon: "🏃", title: "Move it out", text: "Anger is energy stored in your body. Physical movement — even jumping up and down, or shaking your arms — can release it faster than you'd think." },
    starter: { question: "What's one thing that helps you cool down when something really bothers you?", context: "No judgment here. Share what works for you 🧡" },
    article: { title: "Anger isn't bad — here's how to use it", blurb: "Anger is one of the most powerful emotions. When you understand what's underneath it, it becomes a signal instead of a storm.", readTime: "3 min read" },
    aiSuggestion: "Anger usually has something underneath it — hurt, fear, or feeling unheard. Before reacting, try writing down what you're feeling. What's really going on beneath the anger?",
  },

  Tired: {
    color: "#64748b",
    bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    border: "#e2e8f0",
    affirmation: "Rest is not giving up. Taking care of myself is exactly how I keep going. I am allowed to slow down.",
    quote: { text: "Almost everything will work again if you unplug it for a few minutes — and that includes you. Rest isn't a reward. It's a necessity.", author: "Community wisdom" },
    breathing: {
      name: "Body scan breath 🌙",
      instruction: "Close your eyes. Take a slow breath in for 4 counts. As you breathe out for 6, let your shoulders drop, unclench your jaw, and relax your hands. Repeat 4 times.",
      emoji: "😴",
    },
    challenge: {
      title: "One kind thing for yourself 🫶",
      text: "Do just one small, kind thing for yourself today. Drink water. Put on a comforting playlist. Lie down for 10 minutes. That's enough.",
    },
    tip: { icon: "🌙", title: "Rest without guilt", text: "There's a difference between being physically tired and being emotionally drained. Both are real. Both deserve rest. You don't need to earn it." },
    starter: { question: "What's been draining your energy lately — and what would actually help you recharge?", context: "You're in good company here. Let's figure it out together 💙" },
    article: { title: "The difference between tired and emotionally drained — and how to recover", blurb: "Emotional exhaustion is real and it's different from just needing sleep. Here's how to recognize it and what actually helps.", readTime: "4 min read" },
    aiSuggestion: "Being tired — especially emotionally — is your body asking for gentleness, not productivity. What's one thing you could let go of today to give yourself a little more space?",
  },
};
