import libsql

from database_queries import ISSUE_DATA, STATUS_UPDATE, STATUS_UPDATE_WITH_REASON

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
        print(ISSUE_DATA, (issue_id,))
        return self._conn.execute(ISSUE_DATA, (issue_id,)).fetchone()

    def update_status(self, status: str, issue_id: str):
        self._conn.execute(STATUS_UPDATE, (status, issue_id))
        self._conn.commit()

    def update_status_with_reason(self, status: str, reason: str, issue_id: str):
        self._conn.execute(STATUS_UPDATE_WITH_REASON, (status, reason, issue_id))
        self._conn.commit()

    def close_connection(self):
        if self._conn:
            self._conn.close()
