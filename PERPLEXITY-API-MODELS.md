# Perplexity API Models

This document lists the available models for the Perplexity API and how they're mapped in our application.

## Available Models

Based on the current Perplexity API documentation, the following models are available:

- `sonar` - The basic Sonar model (recommended default)
- `sonar-small-online` - Small online model with web search capability
- `sonar-medium-online` - Medium-sized online model with web search capability
- `sonar-large-online` - Large online model with web search capability
- `sonar-small-chat` - Small chat model without web search
- `sonar-medium-chat` - Medium-sized chat model without web search
- `llama-3.1-sonar-small-128k-online` - Llama 3.1 model with Sonar capabilities

## Model Mapping

In our application, we map all model types to the basic `sonar` model for compatibility. This ensures that our API requests are accepted by the Perplexity API.

```typescript
const modelMap: Record<string, string> = {
  'sonar-small-online': 'sonar',
  'sonar-medium-chat': 'sonar',
  'sonar-large-online': 'sonar',
  'sonar-medium-online': 'sonar',
  'sonar-small-chat': 'sonar',
  'llama-3.1-sonar-small-128k-online': 'sonar'
};
```

## Request Format

Example API request format:

```json
{
  "model": "sonar",
  "messages": [
    {
      "role": "system",
      "content": "Be precise and concise."
    },
    {
      "role": "user",
      "content": "How many stars are there in our galaxy?"
    }
  ],
  "max_tokens": 1024
}
```

## API Endpoint

The correct endpoint for Perplexity API requests is:

```
https://api.perplexity.ai/chat/completions
```

## Important Notes

- Always include proper error handling for API responses
- The API requires authentication via Bearer token
- Perplexity's API is compatible with the OpenAI API format but with some differences in available models and parameters
