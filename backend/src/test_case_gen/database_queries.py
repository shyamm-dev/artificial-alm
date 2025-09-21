ISSUE_DATA = """SELECT
                    jpc.frameworks as compliance_frameworks,
                    sji.summary,
                    sji.description
                FROM scheduled_job_issue sji
                JOIN scheduled_job sj ON sji.job_id = sj.id
                LEFT JOIN jira_project_compliance jpc ON sj.project_id = jpc.project_id
                WHERE sji.id = ?;"""

STATUS_UPDATE = """UPDATE scheduled_job_issue
                     SET status = ?
                        WHERE id = ?;"""

STATUS_UPDATE_WITH_REASON = """UPDATE scheduled_job_issue
                     SET status = ?, reason = ?
                        WHERE id = ?;"""

INSERT_TEST_CASES = """INSERT INTO scheduled_job_issue_test_case (id, issue_id, summary, description) VALUES (?, ?, ?, ?);"""
