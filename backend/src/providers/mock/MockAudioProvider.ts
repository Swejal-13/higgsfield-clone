import { AudioGenerationProvider, BaseGenerationInput, GenerationResult } from "../ProviderTypes";

function randomAudio(): string {
  const n = Math.floor(Math.random() * 4) + 1;
  return `/demo/audio/sample-${n}.mp3`;
}

export class MockAudioProvider implements AudioGenerationProvider {
  async generateAudio(input: BaseGenerationInput): Promise<GenerationResult> {
    return {
      outputs: [{ url: randomAudio(), type: "audio", metadata: { generatedAt: new Date().toISOString() } }],
      providerMeta: { provider: "mock", model: input.modelId },
    };
  }
}
