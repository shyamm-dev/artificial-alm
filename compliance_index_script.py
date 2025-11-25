import json

from collections import defaultdict

base_path = "constants/"
list_of_compliance_files = ["FDA.json", "HIPAA.json", "ISO-IEC-27001-2022.json"]

index = {}
reverse_index = defaultdict(list)

for files in list_of_compliance_files:
    with open(base_path + files, "r", encoding="utf-8") as compliance_file:
        compliance_clauses = json.load(compliance_file)

        for compliance_clause in compliance_clauses:
            doc_id = compliance_clause["source"]+" "+compliance_clause["clause_id"]
            index[doc_id] = compliance_clause

            for tag in compliance_clause["tags"]:
                reverse_index[tag].append(doc_id)

with open(base_path + "compliance_index.json", "w", encoding="utf-8") as index_file:
    json.dump(index, index_file, indent=4)

with open(base_path + "compliance_reverse_index.json", "w", encoding="utf-8") as reverse_index_file:
    json.dump(reverse_index, reverse_index_file, indent=4)

with open(base_path + "compliance_tags.json", "w", encoding="utf-8") as tags_file:
    json.dump(list(reverse_index.keys()), tags_file, indent=4)
