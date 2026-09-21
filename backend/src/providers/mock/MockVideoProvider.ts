import { VideoGenerationProvider, BaseGenerationInput, GenerationResult } from "../ProviderTypes";

const SAMPLE_COUNT = 6;

function randomVideo(): string {
  const n = Math.floor(Math.random() * SAMPLE_COUNT) + 1;
  return `/demo/videos/sample-${n}.mp4`;
}

function randomThumb(): string {
  const n = Math.floor(Math.random() * 12) + 1;
  return `/demo/images/sample-${n}.svg`;
}

function buildOutput(action: string) {
  return {
    url: randomVideo(),
    thumbnailUrl: randomThumb(),
    type: "video" as const,
    metadata: { action, generatedAt: new Date().toISOString() },
  };
}

export class MockVideoProvider implements VideoGenerationProvider {
  async generateVideo(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: [buildOutput("generate")], providerMeta: { provider: "mock", model: input.modelId } };
  }

  async imageToVideo(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: [buildOutput("image-to-video")], providerMeta: { provider: "mock", sourceImage: input.inputAssets?.[0] } };
  }

  async editVideo(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: [buildOutput("edit")], providerMeta: { provider: "mock" } };
  }

  async motionControl(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: [buildOutput("motion-control")], providerMeta: { provider: "mock" } };
  }

  async extendVideo(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: [buildOutput("extend")], providerMeta: { provider: "mock" } };
  }
}
