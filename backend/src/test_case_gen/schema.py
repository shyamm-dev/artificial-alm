from google.genai import types

class FNFTestCaseGenResponseSchema:

    @staticmethod
    def get_schema() -> types.Schema:
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
                        any_of=[
                            FNFTestCaseGenResponseSchema.__get_functional_test_case_schema(),
                            FNFTestCaseGenResponseSchema.__get_non_functional_test_case_schema(),
                        ]
                    )
                )
            },
            required=["success", "issue", "data"]
        )
    

    @staticmethod
    def __get_functional_test_case_schema() -> types.Schema:
        return types.Schema(
            type=types.Type.OBJECT,
            properties={
                "summary": types.Schema(type=types.Type.STRING, description="Short title (5-10 words) describing the test case"),
                "description": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "type": types.Schema(type=types.Type.STRING, enum=["functional"]),
                        "purpose": types.Schema(type=types.Type.STRING, description="Purpose of the test"),
                        "preconditions": types.Schema(type=types.Type.STRING, description="Preconditions (if any)"),
                        "testing_procedure": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING), description="Steps for testing"),
                        "expected_result": types.Schema(type=types.Type.STRING, description="Expected result (Clear observable outcome)"),
                        "requirement_coverage": types.Schema(type=types.Type.STRING, description="Requirement Coverage (Which part of the requirement this test validates)")
                    },
                    required=["type", "purpose", "preconditions", "testing_procedure", "expected_result", "requirement_coverage"]
                ),
            },
            required=["summary", "description"]
        )

    @staticmethod
    def __get_non_functional_test_case_schema() -> types.Schema:
        return types.Schema(
            type=types.Type.OBJECT,
            properties={
                "summary": types.Schema(type=types.Type.STRING, description="Short title (5-10 words) describing the test case."),
                "description": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "type": types.Schema(type=types.Type.STRING, enum=["non_functional"]),
                        "test_category": types.Schema(type=types.Type.STRING, description="Non-functional category (Performance, Security, Usability, Reliability, Scalability, Compatibility)"),
                        "preconditions": types.Schema(type=types.Type.STRING, description="Preconditions (if any)"),
                        "testing_procedure": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING), description="Steps for testing"),
                        "expected_result": types.Schema(type=types.Type.STRING, description="Expected result (Clear measurable outcome)"),
                        "acceptance_criteria": types.Schema(type=types.Type.STRING, description="Specific acceptance criteria or thresholds")
                    },
                    required=["type", "test_category", "preconditions", "testing_procedure", "expected_result", "acceptance_criteria"]
                ),
            },
            required=["summary", "description"]
        )

#########################################################################################

class ComplianceTestCaseResponseSchema:

    @staticmethod
    def get_compliance_schema() -> types.Schema:
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
                            "summary": types.Schema(type=types.Type.STRING, description="COMPLIANCE - [Short title (5-10 words) describing the test case.]"),
                            "description": types.Schema(
                                type=types.Type.OBJECT,
                                properties={
                                    "type": types.Schema(type=types.Type.STRING, enum=["compliance"]),
                                    "compliance_rule": types.Schema(type=types.Type.STRING, description="Compliance Rule Involved (Exact rule with clause id )"),
                                    "preconditions": types.Schema(type=types.Type.STRING, description="Preconditions (if any)"),
                                    "testing_procedure": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING), description="Steps for testing"),
                                    "expected_result": types.Schema(type=types.Type.STRING, description="Expected result (System behavior must remain compliant with the rule.)"),
                                    "compliance_impact": types.Schema(type=types.Type.STRING, description="Compliance Impact Explanation (Brief explanation of significance and why verification is required)")
                                },
                                required=["type", "compliance_rule", "preconditions", "testing_procedure", "expected_result", "compliance_impact"]
                            ),
                        },
                        required=["summary", "description"]
                    )
                )
            },
            required=["success", "issue", "data"]
        )

    @staticmethod
    def get_compliance_tags_schema() -> types.Schema:
        return types.Schema(
            type=types.Type.OBJECT,
            properties={
                "tags": types.Schema(
                    type=types.Type.ARRAY,
                    description="Array of compliance tags that matches the requirement.",
                    items=types.Schema(type=types.Type.STRING)
                )
            },
            required=["tags"]
        )
