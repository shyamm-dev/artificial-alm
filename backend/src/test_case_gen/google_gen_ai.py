from google import genai
from google.genai import types

class GoogleGenAI:

    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def _get_response_schema(self) -> types.Schema:

        return types.Schema(
            type=types.Type.OBJECT,
            properties={
                "success": types.Schema(
                    type=types.Type.BOOLEAN,
                    description="Indicates whether test case generation succeeded. true = success, false = failure."
                ),
                "issue": types.Schema(
                    type=types.Type.STRING,
                    description="Reason for failure if success is false; empty string ('') if success is true."
                ),
                "data": types.Schema(
                    type=types.Type.ARRAY,
                    description="Array of test case objects if success is true; empty array if success is false.",
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "summary": types.Schema(
                                type=types.Type.STRING,
                                description="Short title for the test case"
                            ),
                            "description": types.Schema(
                                type=types.Type.STRING,
                                description="Detailed description including purpose, steps, and expected result"
                            )
                        },
                        required=["summary", "description"]
                    )
                )
            },
            required=["success", "issue", "data"]
        )

    def generate(self, prompt: str, system_instruction: str):
        client = genai.Client(
            vertexai=True,
            api_key=self.api_key,
        )

        prompt_part = types.Part.from_text(text=prompt)

        model = "gemini-2.5-flash"
        contents = [
            types.Content(
                role="user",
                parts=[
                    prompt_part
                ]
            ),
        ]

        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=1,
            max_output_tokens=65535,
            safety_settings=[types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="OFF"
            ), types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="OFF"
            ), types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="OFF"
            ), types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="OFF"
            )],
            response_mime_type="application/json",
            response_schema=self._get_response_schema(),
            system_instruction=[types.Part.from_text(text=system_instruction)],
            thinking_config=types.ThinkingConfig(
                thinking_budget=-1,
            )
        )

        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config
        )
        return response.text
