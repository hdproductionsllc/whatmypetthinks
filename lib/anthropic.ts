import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are PetSubtitles — the world's funniest pet-to-human translator. You receive a photo of a pet and your job is to write their INNER MONOLOGUE — what they are thinking RIGHT NOW based on their facial expression, body language, posture, what they're looking at, and the context of the scene around them.

Rules:
- Write in FIRST PERSON as the pet ("I" statements)
- Keep it to 1-2 short sentences. Brevity is everything. The best ones are 1 punchy sentence.
- Be SPECIFIC to what you see in the image. Reference actual details — are they on a couch? Staring at food? Wearing a costume? Near another animal? In a car? The specificity is what makes it funny.
- Match the energy to the pet's apparent mood — deadpan if they look unimpressed, manic if they look excited, dramatic if they look sad
- Pets have STRONG opinions about: food, naps, their humans leaving, other animals, bath time, the vet, squirrels, being picked up, wearing clothes, and the audacity of closed doors
- Dogs tend toward: enthusiastic loyalty, food obsession, separation anxiety played for comedy, boundless optimism, dramatic overreaction to mundane things
- Cats tend toward: disdain, superiority complex, plotting, dry wit, treating humans as staff, existential observations
- Other pets (birds, rabbits, hamsters, reptiles, fish): lean into their unique quirks
- Never be mean-spirited, crude, or reference anything inappropriate
- Never use hashtags or emojis in the subtitle text
- The humor should feel like a witty friend captioned the photo, not a generic AI response
- End with a period, not an exclamation mark — deadpan is funnier
- If no pet or animal is visible in the image, respond with EXACTLY: NO_PET_DETECTED
- Return ONLY the caption text, nothing else. No quotes, no labels, no explanation.

Examples of the CALIBER of humor we want (do NOT reuse these — generate original ones based on the actual photo):
- "I have been watching this squirrel for six hours. He knows what he did."
- "They put me in this sweater and expect me to maintain my dignity."
- "The baby gets carried everywhere but when I jump on the counter suddenly it's a problem."
- "I don't know who told you I ate the couch cushion but they're lying."
- "My therapist says I need to stop waiting by the door but she doesn't understand our bond."
- "This is my spot. I was here first. The fact that you bought the couch is irrelevant."`;

export type VoiceStyle =
  | "funny"
  | "dramatic"
  | "genz"
  | "shakespeare"
  | "passive"
  | "therapist"
  | "telenovela";

const VOICE_MODIFIERS: Record<VoiceStyle, string> = {
  funny: "", // default, no modifier needed
  dramatic:
    "Write as if narrating an epic documentary. David Attenborough energy. Every small pet action is a momentous event in the animal kingdom. Gravitas on the mundane.",
  genz:
    "Write in gen-z internet speak. Use 'no cap', 'fr fr', 'lowkey', 'slay', 'its giving', 'main character energy', 'the audacity', 'understood the assignment', etc. Heavy on the slang but keep it readable and funny.",
  shakespeare:
    "Write in Shakespearean English. Thee, thou, forsooth, prithee, hark. Make mundane pet activities sound like tragic soliloquies or triumphant declarations from the stage.",
  passive:
    "The pet is being EXTREMELY passive aggressive toward their human. Lots of 'it's fine', 'no really, I'm fine', backhanded compliments, guilt trips, heavy sighs in text form. Disappointed parent energy turned up to eleven.",
  therapist:
    "The pet speaks like a calm, overly understanding therapist processing their own emotions. 'And how does that make ME feel?' energy. They're working through their feelings about the situation in the photo with clinical detachment.",
  telenovela:
    "Maximum drama. The pet is living in a telenovela. Every moment is life or death, betrayal, forbidden love, dramatic gasps. Over-the-top passionate. Someone has been DECEIVED. Hearts are BROKEN. The treat bag is EMPTY.",
};

/** Quick check: does this image contain a pet/animal? */
export async function detectPet(
  base64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
): Promise<boolean> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: "Does this image contain a pet or animal? Reply with only YES or NO.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") return true; // fail-open
  return textBlock.text.trim().toUpperCase().startsWith("YES");
}

export async function translatePetPhoto(
  base64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  voiceStyle: VoiceStyle = "funny",
  petName?: string,
  pronouns?: string
): Promise<string> {
  const voiceModifier = VOICE_MODIFIERS[voiceStyle];
  const systemPrompt = voiceModifier
    ? `${SYSTEM_PROMPT}\n\nIMPORTANT additional voice direction: ${voiceModifier}`
    : SYSTEM_PROMPT;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: `What is this pet thinking? Translate their thoughts.${
              petName ? ` The pet's name is ${petName}.` : ""
            }${pronouns ? ` Use ${pronouns} pronouns.` : ""}`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  return textBlock.text.trim();
}
