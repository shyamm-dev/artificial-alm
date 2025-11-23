from google.genai import types

class ToolBuilder:
    
    @staticmethod
    def create_function_tool(name: str, description: str, parameters: dict) -> types.Tool:
        return types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name=name,
                    description=description,
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties=parameters.get("properties", {}),
                        required=parameters.get("required", [])
                    )
                )
            ]
        )
    
    @staticmethod
    def create_parameter(param_type: str, description: str, enum_values=None) -> types.Schema:
        schema_params = {
            "type": getattr(types.Type, param_type.upper()),
            "description": description
        }
        
        if enum_values:
            schema_params["enum"] = enum_values
            
        return types.Schema(**schema_params)
    
    @staticmethod
    def create_string_array_parameter(description: str) -> types.Schema:
        return types.Schema(
            type=types.Type.ARRAY,
            description=description,
            items=types.Schema(type=types.Type.STRING)
        )