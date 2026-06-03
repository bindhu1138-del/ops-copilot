// const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// export async function callClaude({ system, messages, maxTokens = 1200 }) {
//   const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
//   if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set in .env');

//   const res = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': apiKey,
//       'anthropic-version': '2023-06-01',
//       'anthropic-dangerous-direct-browser-access': 'true',
//     },
//     body: JSON.stringify({
//       model: CLAUDE_MODEL,
//       max_tokens: maxTokens,
//       system,
//       messages,
//     }),
//   });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err?.error?.message || `API error ${res.status}`);
//   }

//   const data = await res.json();
//   return data.content?.map(b => b.text || '').join('') || '';
// }

// // Streaming version - calls onChunk with each text delta
// export async function callClaudeStream({ system, messages, maxTokens = 1200, onChunk, onDone }) {
//   const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
//   if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set in .env');

//   const res = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': apiKey,
//       'anthropic-version': '2023-06-01',
//       'anthropic-dangerous-direct-browser-access': 'true',
//     },
//     body: JSON.stringify({
//       model: CLAUDE_MODEL,
//       max_tokens: maxTokens,
//       stream: true,
//       system,
//       messages,
//     }),
//   });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err?.error?.message || `API error ${res.status}`);
//   }

//   const reader = res.body.getReader();
//   const decoder = new TextDecoder();
//   let buffer = '';
//   let fullText = '';

//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     buffer += decoder.decode(value, { stream: true });
//     const lines = buffer.split('\n');
//     buffer = lines.pop();
//     for (const line of lines) {
//       if (!line.startsWith('data: ')) continue;
//       const data = line.slice(6).trim();
//       if (data === '[DONE]') continue;
//       try {
//         const evt = JSON.parse(data);
//         if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
//           fullText += evt.delta.text;
//           onChunk?.(evt.delta.text, fullText);
//         }
//       } catch {}
//     }
//   }
//   onDone?.(fullText);
//   return fullText;
// }












// // claude.js
// const GEMINI_MODEL = 'gemini-2.5-flash';

// async function fetchWithRetry(url, options, retries = 3) {
//   for (let i = 0; i < retries; i++) {
//     const res = await fetch(url, options);

//     if (res.ok) {
//       return res;
//     }

//     if (res.status === 503 && i < retries - 1) {
//       console.log(`Retrying Gemini request... Attempt ${i + 2}`);
//       await new Promise(resolve => setTimeout(resolve, 5000));
//       continue;
//     }

//     return res;
//   }
// }

// export async function callClaude({
//   system,
//   messages,
//   maxTokens = 3500,
// }) {
//   console.log("PROMPT START");
//   console.log(prompt);
//   console.log("PROMPT END");
//   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
//   console.log("Gemini Key Loaded:", !! apiKey);
//   console.log("Key Prefix", apiKey?.slice(0,10));

//   if (!apiKey) {
//     throw new Error('VITE_GEMINI_API_KEY not set in .env');
//   }

//   const prompt = [
//     system,
//     ...messages.map(
//       (m) =>
//         `${m.role}: ${
//           typeof m.content === 'string'
//             ? m.content
//             : JSON.stringify(m.content)
//         }`
//     ),
//   ].join('\n\n');

//   const res = await fetchWithRetry(
//   `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
//   {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       contents: [
//         {
//           parts: [
//             {
//               text: prompt,
//             },
//           ],
//         },
//       ],
//       generationConfig: {
//         maxOutputTokens: maxTokens,
//         temperature: 0.2,
//         topP: 0.9,
//         topK: 40,
//       },
//     }),
//   }
// );

//   if (!res || !res.ok) {

//   if (res?.status === 503) {
//     throw new Error(
//       "Gemini is currently overloaded. Please try again in a few seconds."
//     );
//   }

//   const err = res ? await res.text() : "No response received";
//   throw new Error(err || `Gemini API error ${res?.status}`);
// }

//   const data = await res.json();
//   console.log("Gemini Response:", data);

//   console.log("Finish Reason:", data?.candidates?.[0]?.finishReason);

//   console.log("Usage Metadata:", data?.usageMetadata);

//   const text =
//     data?.candidates?.[0]?.content?.parts
//       ?.map((p) => p.text || '')
//       .join('') || '';

//   if (!text.trim()) {
//   throw new Error(
//     `Gemini returned empty response. Finish Reason: ${
//       data?.candidates?.[0]?.finishReason
//     }`
//   );
// }

  
//   console.log("Text Length:", text.length);

//   console.log(
//     "Preview:",
//      text.substring(0, 500)
//   );

//   console.log(
//     "Finish Reason:",
//     data?.candidates?.[0]?.finishReason
//   );

//   return text;

//   // return (
//   //   data?.candidates?.[0]?.content?.parts
//   //     ?.map((p) => p.text || '')
//   //     .join('') || ''
//   // );
// }

// // Simulated streaming version
// export async function callClaudeStream({
//   system,
//   messages,
//   maxTokens = 4096,
//   onChunk,
//   onDone,
// }) {
//   const text = await callClaude({
//     system,
//     messages,
//     maxTokens,
//   });

//   const chunkSize = 20;

//   for (let i = 0; i < text.length; i += chunkSize) {
//     const chunk = text.slice(i, i + chunkSize);
//     onChunk?.(chunk, text.slice(0, i + chunkSize));

//     await new Promise((resolve) => setTimeout(resolve, 10));
//   }

//   onDone?.(text);

//   return text;
// }














// // claude.js

// const GEMINI_MODEL = 'gemini-2.5-flash';

// async function fetchWithRetry(url, options, retries = 3) {
//   for (let i = 0; i < retries; i++) {
//     const res = await fetch(url, options);

//     if (res.ok) {
//       return res;
//     }

//     if (res.status === 503 && i < retries - 1) {
//       console.log(`Retrying Gemini request... Attempt ${i + 2}`);

//       await new Promise((resolve) =>
//         setTimeout(resolve, 5000)
//       );

//       continue;
//     }

//     return res;
//   }
// }

// export async function callClaude({
//   system,
//   messages,
//   maxTokens = 3500,
// }) {
//   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

//   console.log('Gemini Key Loaded:', !!apiKey);
//   console.log('Key Prefix:', apiKey?.slice(0, 10));

//   if (!apiKey) {
//     throw new Error(
//       'VITE_GEMINI_API_KEY not set in .env'
//     );
//   }

//   // Build prompt
//   const prompt = [
//     system,
//     ...messages.map(
//       (m) =>
//         `${m.role}: ${
//           typeof m.content === 'string'
//             ? m.content
//             : JSON.stringify(m.content)
//         }`
//     ),
//   ].join('\n\n');

//   // Debug prompt
//   console.log('PROMPT START');
//   console.log(prompt);
//   console.log('PROMPT END');
//   console.log('Prompt Length:', prompt.length);

//   const res = await fetchWithRetry(
//     `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },

//       body: JSON.stringify({
//         contents: [
//           {
//             role: 'user',
//             parts: [
//               {
//                 text: prompt,
//               },
//             ],
//           },
//         ],

//         generationConfig: {
//           maxOutputTokens: maxTokens,
//           temperature: 0.2,
//           topP: 0.9,
//           topK: 40,
//         },
//       }),
//     }
//   );

//   if (!res || !res.ok) {
//     if (res?.status === 503) {
//       throw new Error(
//         'Gemini is currently overloaded. Please try again in a few seconds.'
//       );
//     }

//     const err = res
//       ? await res.text()
//       : 'No response received';

//     throw new Error(
//       err || `Gemini API error ${res?.status}`
//     );
//   }

//   const data = await res.json();

//   console.log('Gemini Response:', data);

//   const finishReason =
//     data?.candidates?.[0]?.finishReason;

//   console.log('Finish Reason:', finishReason);

//   console.log(
//     'Usage Metadata:',
//     data?.usageMetadata
//   );

//   const text =
//     data?.candidates?.[0]?.content?.parts
//       ?.map((p) => p.text || '')
//       .join('') || '';

//   if (!text.trim()) {
//     throw new Error(
//       `Gemini returned empty response. Finish Reason: ${finishReason}`
//     );
//   }

//   console.log('Text Length:', text.length);

//   console.log(
//     'Preview:',
//     text.substring(0, 500)
//   );

//   return text;
// }

// // Simulated streaming version
// export async function callClaudeStream({
//   system,
//   messages,
//   maxTokens = 8192,
//   onChunk,
//   onDone,
// }) {
//   const text = await callClaude({
//     system,
//     messages,
//     maxTokens,
//   });

//   const chunkSize = 20;

//   for (
//     let i = 0;
//     i < text.length;
//     i += chunkSize
//   ) {
//     const chunk = text.slice(
//       i,
//       i + chunkSize
//     );

//     onChunk?.(
//       chunk,
//       text.slice(0, i + chunkSize)
//     );

//     await new Promise((resolve) =>
//       setTimeout(resolve, 10)
//     );
//   }

//   onDone?.(text);

//   return text;
// }















// claude.js

const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Retry helper for temporary Gemini failures
 */
async function fetchWithRetry(url, options, retries = 3) {
  let lastResponse = null;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);

      if (res.ok) {
        return res;
      }

      lastResponse = res;

      // Retry only for temporary server issues
      if (
        (res.status === 503 || res.status === 500) &&
        i < retries - 1
      ) {
        const delay = 2000 * (i + 1);

        console.warn(
          `Gemini temporary error (${res.status}). Retrying in ${delay}ms...`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return res;
    } catch (err) {
      console.error('Network error:', err);

      if (i < retries - 1) {
        const delay = 2000 * (i + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }

  return lastResponse;
}

/**
 * Standard Gemini call
 */
export async function callClaude({
  system,
  messages,
  maxTokens = 1500,
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'VITE_GEMINI_API_KEY not found in .env file'
    );
  }

  const prompt = [
    system,
    ...messages.map(
      m =>
        `${m.role}: ${
          typeof m.content === 'string'
            ? m.content
            : JSON.stringify(m.content)
        }`
    ),
  ].join('\n\n');

  const res = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.3,
        },
      }),
    }
  );

  if (!res || !res.ok) {
    let errorText = 'Unknown Gemini error';

    try {
      errorText = await res.text();
    } catch {
      // ignore
    }

    console.error(
      'Gemini API Error:',
      res?.status,
      errorText
    );
    console.log("Gemini Request Sent");

    if (res?.status === 503) {
      throw new Error(
        'Gemini model is temporarily overloaded. Please try again in a few seconds.'
      );
    }

    if (res?.status === 429) {
      throw new Error(
        'Gemini quota exhausted or rate limit reached.'
      );
    }

    if (res?.status === 401) {
      throw new Error(
        'Invalid Gemini API key.'
      );
    }

    if (res?.status === 403) {
      throw new Error(
        'Gemini API access denied.'
      );
    }

    throw new Error(
      errorText || `Gemini API error ${res?.status}`
    );
  }

  const data = await res.json();

  return (
    data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      ?.join('') || ''
  );
}

/**
 * Simulated streaming for UI components
 */
export async function callClaudeStream({
  system,
  messages,
  maxTokens = 4000,
  onChunk,
  onDone,
}) {
  const fullText = await callClaude({
    system,
    messages,
    maxTokens,
  });

  const chunkSize = 25;

  for (
    let i = 0;
    i < fullText.length;
    i += chunkSize
  ) {
    const chunk = fullText.slice(
      i,
      i + chunkSize
    );

    const partial = fullText.slice(
      0,
      i + chunkSize
    );

    onChunk?.(chunk, partial);

    await new Promise(resolve =>
      setTimeout(resolve, 10)
    );
  }

  onDone?.(fullText);

  return fullText;
}