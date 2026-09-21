export interface GenerationOutput {
  url: string;
  thumbnailUrl?: string;
  type: "image" | "video" | "audio";
  metadata?: Record<string, unknown>;
}

export interface GenerationResult {
  outputs: GenerationOutput[];
  providerMeta?: Record<string, unknown>;
}

export interface BaseGenerationInput {
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  settings: Record<string, unknown>;
  inputAssets?: string[];
}

export interface ImageGenerationProvider {
  generateImage(input: BaseGenerationInput): Promise<GenerationResult>;
  editImage(input: BaseGenerationInput): Promise<GenerationResult>;
  inpaintImage(input: BaseGenerationInput): Promise<GenerationResult>;
  upscaleImage(input: BaseGenerationInput): Promise<GenerationResult>;
  variationImage(input: BaseGenerationInput): Promise<GenerationResult>;
}

export interface VideoGenerationProvider {
  generateVideo(input: BaseGenerationInput): Promise<GenerationResult>;
  imageToVideo(input: BaseGenerationInput): Promise<GenerationResult>;
  editVideo(input: BaseGenerationInput): Promise<GenerationResult>;
  motionControl(input: BaseGenerationInput): Promise<GenerationResult>;
  extendVideo(input: BaseGenerationInput): Promise<GenerationResult>;
}

export interface AudioGenerationProvider {
  generateAudio(input: BaseGenerationInput): Promise<GenerationResult>;
}
