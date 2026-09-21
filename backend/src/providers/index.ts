import { useMockVideoProvider, useMockAudioProvider } from "../config/env";
import { MockVideoProvider } from "./mock/MockVideoProvider";
import { MockAudioProvider } from "./mock/MockAudioProvider";
import { ExternalImageProvider } from "./external/ExternalImageProvider";
import { ExternalVideoProvider } from "./external/ExternalVideoProvider";
import { ExternalAudioProvider } from "./external/ExternalAudioProvider";
import { ImageGenerationProvider, VideoGenerationProvider, AudioGenerationProvider } from "./ProviderTypes";

// Image generation always goes through ExternalImageProvider. When
// AI_IMAGE_API_KEY is set it calls real Gemini; when it's missing (or the
// call fails for any reason - network, quota, safety block) it falls back
// internally to the local keyword-based SVG generator. This gives keyword-
// matched illustrations (e.g. "flower") instead of the generic random
// MockImageProvider placeholder, with or without an API key configured.
export const imageProvider: ImageGenerationProvider = new ExternalImageProvider();

export const videoProvider: VideoGenerationProvider = useMockVideoProvider
  ? new MockVideoProvider()
  : new ExternalVideoProvider();

export const audioProvider: AudioGenerationProvider = useMockAudioProvider
  ? new MockAudioProvider()
  : new ExternalAudioProvider();

console.log(
  `[providers] image=external(local-fallback-ready) video=${useMockVideoProvider ? "mock" : "external"} audio=${useMockAudioProvider ? "mock" : "external"}`
);
