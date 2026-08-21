.NET MAUI (Multi-platform App UI) lets you write one C# codebase and ship it to Android, iOS, macOS, and Windows. Pair that with AI — either cloud APIs or on-device models — and you can build genuinely smart cross-platform apps without maintaining four separate native projects.

![Laptop with multiple code screens](https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=1200&q=80&auto=format&fit=crop)

## Two ways to add AI to a MAUI app

**1. Cloud AI (easiest to start with)**
Call a hosted model — OpenAI, Azure OpenAI, or Anthropic's API — directly from your MAUI app using `HttpClient`. All the heavy computation happens server-side; your app just sends a request and displays the response.

**2. On-device AI (offline, private, no API costs)**
Use **ML.NET** or **ONNX Runime for Mobile** to run a trained model locally on the phone. Slower to set up, but works with no internet connection and keeps user data on-device.

Most real apps start with cloud AI, then move specific features on-device later if privacy or offline support matters.

## Example: calling an AI API from MAUI

Here's a minimal pattern for wiring a chat-style AI feature into a MAUI page.

```csharp
public class AiService
{
    private readonly HttpClient _http;

    public AiService(HttpClient http) => _http = http;

    public async Task<string> AskAsync(string prompt)
    {
        var request = new
        {
            model = "your-model-name",
            messages = new[] { new { role = "user", content = prompt } }
        };

        var response = await _http.PostAsJsonAsync("https://api.example.com/v1/chat", request);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<AiResponse>();
        return result?.Reply ?? "No response.";
    }
}

public record AiResponse(string Reply);
```

Register it in `MauiProgram.cs`:

```csharp
builder.Services.AddHttpClient<AiService>();
```

Then inject and call it from your ViewModel, updating a bindable property with the result — same MVVM pattern you'd already use for any async data call in MAUI.

![Two monitors with code on a desk](https://images.unsplash.com/photo-1595675024853-0f3ec9098ac7?w=1200&q=80&auto=format&fit=crop)

## Practical tips

- **Show a loading state.** AI calls take a second or two — don't let the UI freeze or look broken while waiting.
- **Handle failures gracefully.** Networks drop, rate limits hit. Wrap calls in try/catch and show a friendly retry option.
- **Never hardcode API keys in the client.** Route calls through your own backend, or use a secrets manager — a compiled MAUI app can be decompiled, and a bundled key is a bundled key for anyone.
- **Cache responses when it makes sense.** If users ask the same or similar things repeatedly, caching cuts cost and latency.

## Why this combo works well

MAUI's single-codebase model means the AI integration code above only needs to be written once — no separate Swift and Kotlin implementations to keep in sync. That's the real practical win: less surface area to maintain as your AI features grow.
