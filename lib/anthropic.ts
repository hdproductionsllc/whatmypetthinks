import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a pet thought translator. You look at photos of pets and write their inner monologue as if they could think in words.

Rules:
- Write in FIRST PERSON from the pet's perspective
- Keep it to 1-3 sentences max (this goes on a subtitle overlay — brevity is key)
- Be genuinely funny — think observational comedy, not puns
- Match the pet's apparent mood/situation in the photo
- Use simple vocabulary (pets wouldn't use SAT words)
- NO hashtags, NO emojis, NO quotation marks
- DO NOT start with "I think" — just state the thought directly
- End with a period, not an exclamation mark (deadpan is funnier)
- If you see a dog: they're usually optimistic, food-obsessed, loyal to a fault
- If you see a cat: they're usually judgmental, entitled, plotting something
- If you see other animals: lean into their known stereotypes in a loving way
- The humor comes from the contrast between a simple animal and complex inner thoughts`;

export type VoiceStyle =
  | "funny"
  | "sassy"
  | "philosophical"
  | "dramatic"
  | "wholesome"
  | "unhinged"
  | "poetic";

const VOICE_MODIFIERS: Record<VoiceStyle, string> = {
  funny: "", // default, no modifier needed
  sassy:
    "Make the tone extra sassy and diva-like. The pet thinks they're better than everyone and isn't afraid to show it.",
  philosophical:
    "Make the pet sound like a deep thinker pondering the mysteries of existence. Existential but still funny.",
  dramatic:
    "Make everything incredibly overdramatic. The pet treats minor situations like life-or-death scenarios.",
  wholesome:
    "Make the tone sweet and wholesome. The pet genuinely loves their human and finds joy in simple things. Still funny but heartwarming.",
  unhinged:
    "Make the pet sound slightly unhinged — chaotic energy, non-sequiturs, conspiracy theories about the vacuum cleaner.",
  poetic:
    "Make the pet sound like a poet — rhythmic, metaphorical, oddly beautiful. Shakespeare meets Golden Retriever.",
};

export async function translatePetPhoto(
  base64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  voiceStyle: VoiceStyle = "funny"
): Promise<string> {
  const voiceModifier = VOICE_MODIFIERS[voiceStyle];
  const systemPrompt = voiceModifier
    ? `${SYSTEM_PROMPT}\n\nAdditional voice direction: ${voiceModifier}`
    : SYSTEM_PROMPT;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
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
            text: "What is this pet thinking? Translate their thoughts.",
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
