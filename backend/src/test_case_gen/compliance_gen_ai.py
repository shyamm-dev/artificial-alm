from .google_gen_ai import GoogleGenAI
import json

from .schema import ComplianceTestCaseResponseSchema

class ComplianceTestCaseGeneration:

    def __init__(self, api_key: str, db_client=None):
        self.api_key = api_key
        self.gen_ai = GoogleGenAI(self.api_key)
        self.db = db_client

    def __get_compliance_tags_instruction(self) -> str:

        with open("./compliance_tags_instruction.md", "r", encoding='utf-8') as f:
            instruction = f.read()
        return instruction

    def __get_compliance_test_cases_instruction(self) -> str:

        with open("./compliance_test_cases_instruction.md", "r", encoding='utf-8') as f:
            instruction = f.read()
        return instruction
    
    def __get_compliance_index(self) -> dict:
        with open("./compliance_index.json", "r", encoding='utf-8') as f:
            compliance_index = json.load(f)
        return compliance_index
    
    def __get_compliance_reverse_index(self) -> dict:
        with open("./compliance_reverse_index.json", "r", encoding='utf-8') as f:
            compliance_reverse_index = json.load(f)
        return compliance_reverse_index

    def __get_compliance_clause_ids(self, tags: list) -> list:
        reverse_index = self.__get_compliance_reverse_index()
        clause_ids = set()
        for tag in tags:
            clause_ids.add(reverse_index[tag])
        return list(clause_ids)

    def __get_compliance_clauses(self, clause_ids: list) -> list:
        compliance_index = self.__get_compliance_index()
        clauses = []
        for clause_id in clause_ids:
            clauses.append(compliance_index[clause_id])
        return clauses

    async def generate(self, prompt: str, project_compliance: list=None, project_custom_rules: list=None) -> dict:

        messages = [("user", prompt)]

        response = await self.gen_ai.generate(
            messages=messages,
            system_instruction=self.__get_compliance_tags_instruction(),
            schema=ComplianceTestCaseResponseSchema.get_compliance_tags_schema()
        )

        tags = json.loads(response.text).get("tags", [])

        if tags:
            compliance_clause_ids = self.__get_compliance_clause_ids(tags)
            compliance_clauses = self.__get_compliance_clauses(compliance_clause_ids)
            messages.append(("user", "The relevant compliance clauses are: " + json.dumps(compliance_clauses)))
            messages.append(("user", "Project compliance standards to consider: " + json.dumps(project_compliance) if project_compliance else "No specific project compliance requirements provided."))
            messages.append(("user", "Project custom rules to ensure: " + json.dumps(project_custom_rules) if project_custom_rules else "No specific project custom rules provided."))
        else:
            return {
                "success": False,
                "issue": "No compliance tags found.",
                "data": []
            }

        final_msg = await self.gen_ai.generate(
            messages=messages,
            system_instruction=self.__get_compliance_test_cases_instruction(),
            schema=ComplianceTestCaseResponseSchema.get_compliance_schema()
        )

        return json.loads(final_msg.text)
