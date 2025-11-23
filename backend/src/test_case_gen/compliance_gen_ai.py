from .google_gen_ai import GoogleGenAI
import json

from google.genai import types
from .schema import ComplianceTestCaseResponseSchema

tool_call_schema = types.Schema(
    type="object",
    properties={
        "tool_calls": types.Schema(
            type="array",
            items=types.Schema(
                type="object",
                properties={
                    "function": types.Schema(
                        type="object",
                        properties={
                            "name": types.Schema(
                                type="string",
                                enum=["get_compliance_info"]
                            ),
                            "arguments": types.Schema(
                                type="object",
                                properties={
                                    "tags": types.Schema(
                                        type="array",
                                        items=types.Schema(type="string")
                                    )
                                },
                                required=["tags"]
                            ),
                        },
                        required=["name", "arguments"]
                    )
                },
                required=["function"]
            )
        )
    },
    required=["tool_calls"]
)


tools = [
    {
        "type": "function",
        "function": {
            "name": "get_compliance_info",
            "description": "Gets software compliance information based on provided parameters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of compliance-related tags."
                    }
                },
                "required": ["tags"]
            }
        }
    }
]


class ComplianceTestCaseGeneration:

    def __init__(self, api_key: str, db_client=None):
        self.api_key = api_key
        self.gen_ai = GoogleGenAI(self.api_key)
        self.db = db_client

    def get_compliance_info(self, tags: list[str]):
        return {
            "tags_received": tags,
            "result": "Mock compliance data generated."
        }

    def __get_compliance_tags_instruction(self) -> str:

        with open("./compliance_tags_instruction.md", "r", encoding='utf-8') as f:
            instruction = f.read()
        return instruction

    def __get_compliance_test_cases_instruction(self) -> str:

        with open("./compliance_test_cases_instruction.md", "r", encoding='utf-8') as f:
            instruction = f.read()
        return instruction

    def generate(self, prompt: str) -> list:

        messages = [("user", prompt)]

        response = self.gen_ai.generate(
            messages=messages,
            system_instruction=self.__get_compliance_tags_instruction(),
            schema=tool_call_schema,
            tools=tools
        )

        data = json.loads(response)

        tags = data["function"]["arguments"]["tags"]

        tool_result = self.get_compliance_info(tags)

        messages.append(("model", response))

        messages.append(("tool", json.dumps(tool_result)))

        final_msg = self.gen_ai.generate(
            messages=messages,
            system_instruction=self.__get_compliance_test_cases_instruction(),
            schema=ComplianceTestCaseResponseSchema.get_compliance_schema()
        )

        return json.loads(final_msg)
