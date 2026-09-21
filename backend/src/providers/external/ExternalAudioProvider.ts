import { AudioGenerationProvider, BaseGenerationInput, GenerationResult } from "../ProviderTypes";
import { ApiError } from "../../utils/ApiError";

export class ExternalAudioProvider implements AudioGenerationProvider {
  async generateAudio(_input: BaseGenerationInput): Promise<GenerationResult> {
    throw new ApiError(501, "External audio provider not configured. Set AI_AUDIO_API_KEY and implement this class.");
  }
}
