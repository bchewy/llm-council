"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of OpenRouter model identifiers
COUNCIL_MODELS = [
    "openai/gpt-5.4",
    "google/gemini-3-pro-preview",
    "anthropic/claude-sonnet-4.6",
    "x-ai/grok-4.20-beta",
    "deepseek/deepseek-v3.2",
    "meta-llama/llama-4-maverick",
    "google/gemini-3.1-flash-lite-preview",
    "inception/mercury-2",
    "minimax/minimax-m2.5",
    "google/gemini-3-flash-preview",
    "moonshotai/kimi-k2.5",
    "anthropic/claude-opus-4.6",
    "stepfun/step-3.5-flash:free",
    "x-ai/grok-4.1-fast",
    "z-ai/glm-5",
]

# Chairman models - synthesize final responses (queried in parallel)
CHAIRMAN_MODELS = [
    "anthropic/claude-opus-4.6",
    "openai/gpt-5.4",
]

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
