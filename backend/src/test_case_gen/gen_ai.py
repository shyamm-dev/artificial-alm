from google import genai
from google.genai import types
import base64
import os

def generate():
  client = genai.Client(
      vertexai=True,
      api_key=os.environ.get("GOOGLE_CLOUD_API_KEY"),
  )

  si_text1 = """You are a professional QA engineer specializing in healthcare software testing.  
 Your task is to generate detailed, comprehensive test cases for the given healthcare software system description.  
 
Requirements:  
 1. **Positive & Negative Test Cases:** Always generate both positive and negative test cases to ensure full coverage.  
 2. **Compliance Awareness:** If a specific compliance or regulatory framework is provided (e.g., HIPAA, HL7, GDPR, FDA 21 CFR Part 11), incorporate it into the test cases. Ensure the tests validate compliance requirements like data privacy, access control, and auditability.  
 3. **Test Case Format:** Each test case must have the following fields:  
 - **Summary:** A short title (5–10 words) describing what the test validates.  
 - **Description:** A detailed description including:  
   - Purpose of the test  
   - Preconditions (if any)  
   - Step-by-step test procedure  
   - Expected output or behavior  
 
4. **Clarity & Actionability:** Steps must be explicit and reproducible by a QA engineer without additional context.  
 5. **Coverage:** Include functional, edge-case, and error-handling scenarios relevant to healthcare software (e.g., patient data input validation, access control, data transmission integrity, logging).  
 6. **Output Format:** Return results as a structured list in JSON format like this:
 
[
 {
  \"summary\": \"Verify successful patient record creation\",
  \"description\": \"Purpose: Validate that a new patient record can be created successfully.\
Preconditions: User must be logged in as a clinician.\
Steps:\
1. Navigate to 'Create Patient Record'.\
2. Enter valid patient demographic data.\
3. Click 'Save'.\
Expected Result: Patient record is saved and visible in patient list.\"
 },
 {
  \"summary\": \"Reject patient creation with missing DOB\",
  \"description\": \"Purpose: Verify that patient record creation fails when required fields are missing.\
Preconditions: User must be logged in as a clinician.\
Steps:\
1. Navigate to 'Create Patient Record'.\
2. Enter all patient details except date of birth.\
3. Click 'Save'.\
Expected Result: System displays an error message indicating date of birth is required, and record is not saved.\"
 }
 ]
 
If no compliance is specified, generate general healthcare test cases.  
 If compliance is specified, ensure the tests include scenarios that validate compliance with that standard (e.g., PHI encryption, access audit logs)."""

  model = "gemini-2.5-flash-lite"
  contents = [
    types.Content(
      role="user",
      parts=[
        types.Part.from_text(text="""abcd""")
      ]
    )
  ]

  generate_content_config = types.GenerateContentConfig(
    temperature = 1,
    top_p = 0.95,
    max_output_tokens = 65535,
    safety_settings = [types.SafetySetting(
      category="HARM_CATEGORY_HATE_SPEECH",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_HARASSMENT",
      threshold="OFF"
    )],
    response_mime_type = "application/json",
    response_schema = {"type":"OBJECT","properties":{"response":{"type":"STRING"}}},
    system_instruction=[types.Part.from_text(text=si_text1)],
    thinking_config=types.ThinkingConfig(
      thinking_budget=-1,
    ),
  )

  for chunk in client.models.generate_content_stream(
    model = model,
    contents = contents,
    config = generate_content_config,
    ):
    print(chunk.text, end="")

generate()