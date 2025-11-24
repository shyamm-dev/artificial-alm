from .google_gen_ai import GoogleGenAI
import json

from .schema import FNFTestCaseGenResponseSchema


class FNFTestCaseGeneration:

    def __init__(self, api_key: str, db_client=None):
        self.api_key = api_key
        self.gen_ai = GoogleGenAI(self.api_key)
        self.db = db_client


    def __get_functional_test_cases_instruction(self) -> str:

        with open("./system_instruction.md", "r", encoding='utf-8') as f:
            instruction = f.read()
        return instruction

    def generate(self, prompt: str) -> list:

        messages = [("user", prompt)]

        response = self.gen_ai.generate(
            messages=messages,
            system_instruction=self.__get_functional_test_cases_instruction(),
            schema=FNFTestCaseGenResponseSchema.get_schema()
        )

        response = json.loads(response.text)

        return response
