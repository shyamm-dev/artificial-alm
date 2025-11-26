from dataclasses import dataclass

@dataclass(frozen=True)
class JiraQueries:
    FETCH_ISSUE_DATA = """SELECT
                        jpc.frameworks as compliance_frameworks,
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'title', pcr.title,
                                'description', pcr.description,
                                'severity', pcr.severity
                            )
                        ) as custom_rules,
                        sji.summary,
                        sji.description
                    FROM scheduled_job_issue sji
                    JOIN scheduled_job sj ON sji.job_id = sj.id
                    LEFT JOIN jira_project_compliance jpc ON sj.project_id = jpc.project_id
                    LEFT JOIN project_custom_rule pcr ON sj.project_id = pcr.project_id
                    WHERE sji.id = ? AND sji.status = 'pending'
                    GROUP BY sji.id;"""
    
    UPDATE_ISSUE_STATUS = """UPDATE scheduled_job_issue
                     SET status = ?
                     WHERE id = ?;"""
    
    UPDATE_ISSUE_STATUS_WITH_REASON = """UPDATE scheduled_job_issue
                              SET status = ?, reason = ?
                              WHERE id = ?;"""
    
    INSERT_ISSUE_TEST_CASES = """INSERT INTO scheduled_job_issue_test_case (id, issue_id, summary, description) VALUES (?, ?, ?, ?);"""

@dataclass(frozen=True)
class ManualUploadQueries:
    FETCH_ISSUE_DATA = """SELECT
                        spc.frameworks as compliance_frameworks,
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'title', pcr.title,
                                'description', pcr.description,
                                'severity', pcr.severity
                            )
                        ) as custom_rules,
                        sjr.name,
                        sjr.content
                    FROM standalone_scheduled_job_requirement sjr
                    JOIN standalone_scheduled_job ssj ON sjr.job_id = ssj.id
                    LEFT JOIN standalone_project_compliance spc ON ssj.project_id = spc.project_id
                    LEFT JOIN project_custom_rule pcr ON ssj.project_id = pcr.project_id
                    WHERE sjr.id = ? AND sjr.status = 'pending';"""
    
    UPDATE_ISSUE_STATUS = """UPDATE standalone_scheduled_job_requirement
                     SET status = ?
                     WHERE id = ?;"""
    
    UPDATE_ISSUE_STATUS_WITH_REASON = """UPDATE standalone_scheduled_job_requirement
                              SET status = ?, reason = ?
                              WHERE id = ?;"""
    
    INSERT_ISSUE_TEST_CASES = """INSERT INTO standalone_scheduled_job_requirement_test_case (id, requirement_id, summary, description) VALUES (?, ?, ?, ?);"""