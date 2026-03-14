"""OpenRouter API client for making LLM requests."""

import asyncio
import time
import httpx
from typing import List, Dict, Any, Optional, AsyncIterator, Tuple
from .config import OPENROUTER_API_KEY, OPENROUTER_API_URL

MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2.0

_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0, connect=10.0),
            limits=httpx.Limits(max_connections=30, max_keepalive_connections=20),
        )
    return _client


async def query_model(
    model: str,
    messages: List[Dict[str, str]],
    timeout: float = 120.0
) -> Optional[Dict[str, Any]]:
    """Query a single model via OpenRouter API with retry on 429/529."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": messages,
    }

    client = _get_client()
    start_time = time.time()

    for attempt in range(MAX_RETRIES):
        try:
            response = await client.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload
            )

            if response.status_code in (429, 529):
                wait = RETRY_BACKOFF_BASE ** attempt
                print(f"Rate limited on {model} (HTTP {response.status_code}), retrying in {wait}s (attempt {attempt + 1}/{MAX_RETRIES})")
                await asyncio.sleep(wait)
                continue

            if response.status_code != 200:
                try:
                    body = response.json()
                except Exception:
                    body = response.text
                print(f"Error querying model {model}: HTTP {response.status_code} - {body}")
                return None

            data = response.json()
            message = data['choices'][0]['message']
            duration_ms = round((time.time() - start_time) * 1000)

            return {
                'content': message.get('content'),
                'reasoning_details': message.get('reasoning_details'),
                'duration_ms': duration_ms
            }

        except Exception as e:
            print(f"Error querying model {model}: {e}")
            return None

    print(f"Gave up on {model} after {MAX_RETRIES} retries (rate limited)")
    return None


async def _query_model_tagged(
    model: str, messages: List[Dict[str, str]]
) -> Tuple[str, Optional[Dict[str, Any]]]:
    """Wrapper that returns (model_id, response) for use with as_completed."""
    result = await query_model(model, messages)
    return model, result


async def query_models_parallel(
    models: List[str],
    messages: List[Dict[str, str]]
) -> Dict[str, Optional[Dict[str, Any]]]:
    """Query multiple models concurrently, return all at once."""
    tasks = [_query_model_tagged(model, messages) for model in models]
    results = await asyncio.gather(*tasks)
    return {model: response for model, response in results}


async def query_models_progressive(
    models: List[str],
    messages: List[Dict[str, str]]
) -> AsyncIterator[Tuple[str, Optional[Dict[str, Any]]]]:
    """Query multiple models concurrently, yield each result as it arrives."""
    tasks = {
        asyncio.ensure_future(_query_model_tagged(model, messages)): model
        for model in models
    }
    for coro in asyncio.as_completed(tasks.keys()):
        model, result = await coro
        yield model, result
