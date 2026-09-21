import { ImageGenerationProvider, BaseGenerationInput, GenerationResult } from "../ProviderTypes";

const SAMPLE_COUNT = 12;

function randomSample(): string {
  const n = Math.floor(Math.random() * SAMPLE_COUNT) + 1;
  return `/demo/images/sample-${n}.svg`;
}

function buildOutputs(count: number) {
  return Array.from({ length: count }, () => ({
    url: randomSample(),
    thumbnailUrl: randomSample(),
    type: "image" as const,
    metadata: { generatedAt: new Date().toISOString() },
  }));
}

export class MockImageProvider implements ImageGenerationProvider {
  async generateImage(input: BaseGenerationInput): Promise<GenerationResult> {
    const n = Math.min(Number(input.settings.numImages) || 1, 4);
    return { outputs: buildOutputs(n), providerMeta: { provider: "mock", model: input.modelId } };
  }

  async editImage(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: buildOutputs(1), providerMeta: { provider: "mock", action: "edit" } };
  }

  async inpaintImage(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: buildOutputs(1), providerMeta: { provider: "mock", action: "inpaint" } };
  }

  async upscaleImage(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: buildOutputs(1), providerMeta: { provider: "mock", action: "upscale", factor: input.settings.factor || 2 } };
  }

  async variationImage(input: BaseGenerationInput): Promise<GenerationResult> {
    return { outputs: buildOutputs(4), providerMeta: { provider: "mock", action: "variation" } };
  }
}
