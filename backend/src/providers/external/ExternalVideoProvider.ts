import { VideoGenerationProvider, BaseGenerationInput, GenerationResult } from "../ProviderTypes";
import { ApiError } from "../../utils/ApiError";

export class ExternalVideoProvider implements VideoGenerationProvider {
  async generateVideo(_input: BaseGenerationInput): Promise<GenerationResult> {
    throw new ApiError(501, "External video provider not configured. Set AI_VIDEO_API_KEY and implement this class.");
  }
  async imageToVideo(_input: BaseGenerationInput): Promise<GenerationResult> {
    throw new ApiError(501, "Not implemented");
  }
  async editVideo(_input: BaseGenerationInput): Promise<GenerationResult> {
    throw new ApiError(501, "Not implemented");
  }
  async motionControl(_input: BaseGenerationInput): Promise<GenerationResult> {
    throw new ApiError(501, "Not implemented");
  }
  async extendVideo(_input: BaseGenerationInput): Promise<GenerationResult> {
    throw new ApiError(501, "Not implemented");
  }
}
