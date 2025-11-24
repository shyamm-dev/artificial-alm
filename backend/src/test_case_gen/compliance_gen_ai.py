from .google_gen_ai import GoogleGenAI
import json

from google.genai import types
from .schema import ComplianceTestCaseResponseSchema

get_compliance_function = {
    "name": "get_compliance_info",
    "description": "Gets software compliance information based on provided parameters.",
    "parameters": {
        "type": "object",
        "properties": {
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of compliance-related tags.",
            }
        },
        "required": ["tags"],
    },
}

get_compliance_tool = types.Tool(function_declarations=[get_compliance_function])

tools = [get_compliance_tool]


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

    def generate(self, prompt: str, project_compliance: list=None) -> list:

        messages = [("user", prompt)]

        response = self.gen_ai.generate(
            messages=messages,
            system_instruction=self.__get_compliance_tags_instruction(),
            tools=tools
        )

        if response.candidates[0].content.parts[0].function_call:
            function_call = response.candidates[0].content.parts[0].function_call
            function_response_part = types.Part.from_function_response(
                name=function_call.name,
                response={"result": f"Project compliance requirements: {project_compliance} and compliance tags: {function_call.args}"},
            )

            messages.append(("user", function_response_part))

        final_msg = self.gen_ai.generate(
            messages=messages,
            system_instruction=self.__get_compliance_test_cases_instruction(),
            schema=ComplianceTestCaseResponseSchema.get_compliance_schema()
        )

        return json.loads(final_msg.text)
