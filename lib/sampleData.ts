/** Carousel examples — mix of conversations and captions */
export type CarouselExample =
  | {
      type: "convo";
      id: string;
      petName: string;
      petPhoto: string;
      messages: { sender: "pet" | "owner"; text: string; reaction?: string }[];
    }
  | {
      type: "caption";
      id: string;
      petName: string;
      petPhoto: string;
      caption: string;
      voiceLabel: string;
    };

export const CAROUSEL_EXAMPLES: CarouselExample[] = [
  {
    type: "convo",
    id: "mochi",
    petName: "Mochi",
    petPhoto: "/samples/corgi-mochi.jpg",
    messages: [
      { sender: "pet", text: "hey i need to talk to you about something" },
      { sender: "owner", text: "What did you do" },
      { sender: "pet", text: "nothing i just have a medical condition now" },
      { sender: "owner", text: "What kind of medical condition" },
      { sender: "pet", text: "[PHOTO]" },
      { sender: "pet", text: "very serious neck coldness. need this bandana for health" },
      { sender: "owner", text: "I put that on you for the photo shoot", reaction: "👎" },
      { sender: "pet", text: "yes for my CONDITION", reaction: "😂" },
      { sender: "owner", text: "You just like how it looks" },
    ],
  },
  {
    type: "convo",
    id: "biscuit",
    petName: "Biscuit",
    petPhoto: "/samples/pug-biscuit.jpg",
    messages: [
      { sender: "pet", text: "hey so im coming home" },
      { sender: "owner", text: "Great! When?" },
      { sender: "pet", text: "whenever i get there" },
      { sender: "pet", text: "took your skateboard hope thats cool" },
      { sender: "owner", text: "You can't ride a skateboard." },
      { sender: "pet", text: "[PHOTO]" },
      { sender: "owner", text: "You're just SITTING on it in the street!", reaction: "👍" },
      { sender: "pet", text: "yeah its pretty fast" },
      { sender: "owner", text: "IT'S NOT MOVING", reaction: "😂" },
    ],
  },
  {
    type: "convo",
    id: "koda",
    petName: "Koda",
    petPhoto: "/samples/husky-koda.jpg",
    messages: [
      { sender: "pet", text: "i have perished" },
      { sender: "owner", text: "You're literally fine" },
      { sender: "pet", text: "no im dead from belly rub deficiency" },
      { sender: "owner", text: "You got belly rubs an hour ago" },
      { sender: "pet", text: "that was FOREVER ago", reaction: "‼️" },
      { sender: "pet", text: "[PHOTO]" },
      { sender: "pet", text: "see i am deceased" },
      { sender: "owner", text: "I can see my hand petting your belly right now" },
      { sender: "pet", text: "too late already a ghost", reaction: "😂" },
    ],
  },
  {
    type: "convo",
    id: "chairman",
    petName: "Chairman Meow",
    petPhoto: "/samples/cat-chairman.jpg",
    messages: [
      { sender: "pet", text: "we need to talk about my compensation" },
      { sender: "owner", text: "What are you talking about?" },
      { sender: "pet", text: "found these in your drawer" },
      { sender: "pet", text: "[PHOTO]" },
      { sender: "owner", text: "Those are MY sunglasses!", reaction: "👎" },
      { sender: "pet", text: "im clearly the star of this household" },
      { sender: "owner", text: "You're wearing them on your forehead" },
      { sender: "pet", text: "its called fashion linda", reaction: "😂" },
    ],
  },
  {
    type: "convo",
    id: "luna",
    petName: "Luna",
    petPhoto: "/samples/cat-luna.jpg",
    messages: [
      { sender: "pet", text: "need you home right now" },
      { sender: "owner", text: "What's wrong?" },
      { sender: "pet", text: "its serious" },
      { sender: "owner", text: "Luna are you okay??" },
      { sender: "pet", text: "[PHOTO]" },
      { sender: "owner", text: "You texted me 911 because you're YAWNING?", reaction: "‼️" },
      { sender: "pet", text: "my jaw is stuck like this" },
      { sender: "owner", text: "Your jaw is not stuck." },
      { sender: "pet", text: "might be permanent. very tragic", reaction: "❤️" },
    ],
  },
];

/** Pre-made example data for SocialProof */

export interface SampleExample {
  id: string;
  petType: string;
  voiceStyle: string;
  voiceEmoji: string;
  caption: string;
  /** Path to pre-composited image with subtitle + footer (carousel size) */
  image: string;
  /** Path to smaller thumbnail version (social proof cards) */
  thumb: string;
}

/**
 * First 6 entries have real composited photos (from /public/samples/).
 * Additional entries are text-only extras for the social proof scroll.
 */
export const SAMPLE_EXAMPLES: SampleExample[] = [
  {
    id: "dog-guilty",
    petType: "Pug",
    voiceStyle: "Funny",
    voiceEmoji: "😂",
    caption: "I didn't do it. But hypothetically, if I DID eat that shoe, it had it coming.",
    image: "/samples/dog-guilty.jpg",
    thumb: "/samples/dog-guilty-thumb.jpg",
  },
  {
    id: "cat-judging",
    petType: "Tabby Cat",
    voiceStyle: "Passive Agg",
    voiceEmoji: "😒",
    caption: "I've been watching you type for 20 minutes. Not a single email about me.",
    image: "/samples/cat-judging.jpg",
    thumb: "/samples/cat-judging-thumb.jpg",
  },
  {
    id: "puppy-mess",
    petType: "Golden Retriever",
    voiceStyle: "Gen-Z",
    voiceEmoji: "💀",
    caption: "In my defense, that pillow was looking at me weird.",
    image: "/samples/puppy-mess.jpg",
    thumb: "/samples/puppy-mess-thumb.jpg",
  },
  {
    id: "cat-stare",
    petType: "House Cat",
    voiceStyle: "Silly",
    voiceEmoji: "😂",
    caption: "You have 30 seconds to explain why you stopped petting me. Choose your words carefully.",
    image: "/samples/cat-stare.jpg",
    thumb: "/samples/cat-stare-thumb.jpg",
  },
  {
    id: "dog-begging",
    petType: "Husky",
    voiceStyle: "Dramatic Narrator",
    voiceEmoji: "🎬",
    caption: "I can smell that you cut the cheese 4.7 seconds ago. The clock is ticking, Karen.",
    image: "/samples/dog-begging.jpg",
    thumb: "/samples/dog-begging-thumb.jpg",
  },
  {
    id: "kitten-surprised",
    petType: "Scottish Fold",
    voiceStyle: "Dramatic Narrator",
    voiceEmoji: "🎬",
    caption: "SOMETHING MOVED UNDER THE BLANKET AND I AM NOT OKAY.",
    image: "/samples/kitten-surprised.jpg",
    thumb: "/samples/kitten-surprised-thumb.jpg",
  },
];
