import libsql
from uuid import uuid4

from database_queries import ISSUE_DATA, STATUS_UPDATE, STATUS_UPDATE_WITH_REASON, INSERT_TEST_CASES

class Database:

    def __init__(self, database, auth_token):
        self._conn = self._connect(database, auth_token)

    def _connect(self, database, auth_token):
        conn = libsql.connect(
            database=database,
            auth_token=auth_token
        )
        return conn

    def fetch_issue_data(self, issue_id: str) -> tuple[str, str, str]:
        return self._conn.execute(ISSUE_DATA, (issue_id,)).fetchone()

    def update_status(self, status: str, issue_id: str):
        self._conn.execute(STATUS_UPDATE, (status, issue_id))
        self._conn.commit()

    def update_status_with_reason(self, status: str, reason: str, issue_id: str):
        self._conn.execute(STATUS_UPDATE_WITH_REASON, (status, reason, issue_id))
        self._conn.commit()

    def insert_test_cases(self, issue_id: str, testcases: list):

        _testcases = [(str(uuid4()), issue_id, tc['summary'], tc['description']) for tc in testcases]
        print(_testcases)
        with self._conn:
            self._conn.executemany(INSERT_TEST_CASES, _testcases)

    def close_connection(self):
        if self._conn:
            self._conn.close()
