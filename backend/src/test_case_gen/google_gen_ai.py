from google import genai
from google.genai import types

class GoogleGenAI:

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model = model

    def _client(self):
        return genai.Client(vertexai=True, api_key=self.api_key).aio

    def _build_contents(self, texts: list[tuple[str, str|types.Part]]) -> list[types.Content]:
        return [
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=text) if isinstance(text, str) else text]
            ) for role, text in texts
        ]

    async def generate(self, messages: list[tuple[str, str]], system_instruction: str, schema: types.Schema=None, tools=None):
        client = self._client()
        contents = self._build_contents(messages)
        safety_settings = [
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="OFF"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="OFF"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="OFF"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="OFF"
            )
        ]

        content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=1,
            max_output_tokens=65535,
            safety_settings=safety_settings,
            response_mime_type="application/json",
            system_instruction=[types.Part.from_text(text=system_instruction)],
            thinking_config=types.ThinkingConfig(thinking_budget=-1)
        )

        content_config.tools = tools if tools else None
        content_config.response_schema = schema if schema else None

        response = await client.models.generate_content(
            model=self.model,
            contents=contents,
            config=content_config
        )
        return response
