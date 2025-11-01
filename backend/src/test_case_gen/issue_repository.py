from abc import ABC, abstractmethod
from uuid import uuid4

from database_queries import ISSUE_DATA, STATUS_UPDATE, STATUS_UPDATE_WITH_REASON, INSERT_TEST_CASES

class IssueRepository(ABC):

    @abstractmethod
    def fetch_issue_data(self, issue_id: str) -> tuple[str, str, str]:
        pass

    @abstractmethod
    def update_issue_status(self, status: str, issue_id: str):
        pass

    @abstractmethod
    def update_issue_status_with_reason(self, status: str, reason: str, issue_id: str):
        pass

    @abstractmethod
    def insert_issue_test_cases(self, issue_id: str, testcases: list):
        pass

class JIRAIssueRepository(IssueRepository):

    def __init__(self, conn):
        self._conn = conn

    def fetch_issue_data(self, issue_id: str) -> tuple[str, str, str]:
        return self._conn.execute(ISSUE_DATA, (issue_id,)).fetchone()

    def update_issue_status(self, status: str, issue_id: str):
        self._conn.execute(STATUS_UPDATE, (status, issue_id))
        self._conn.commit()

    def update_issue_status_with_reason(self, status: str, reason: str, issue_id: str):
        self._conn.execute(STATUS_UPDATE_WITH_REASON, (status, reason, issue_id))
        self._conn.commit()

    def insert_issue_test_cases(self, issue_id: str, testcases: list):
        _testcases = [(str(uuid4()), issue_id, tc['summary'], tc['description']) for tc in testcases]
        with self._conn:
            self._conn.executemany(INSERT_TEST_CASES, _testcases)

class ManualUploadIssueRepository(IssueRepository):

    def __init__(self, conn):
        self._conn = conn

    def fetch_issue_data(self, issue_id: str) -> tuple[str, str, str]:
        return self._conn.execute(ISSUE_DATA, (issue_id,)).fetchone()

    def update_issue_status(self, status: str, issue_id: str):
        self._conn.execute(STATUS_UPDATE, (status, issue_id))
        self._conn.commit()

    def update_issue_status_with_reason(self, status: str, reason: str, issue_id: str):
        self._conn.execute(STATUS_UPDATE_WITH_REASON, (status, reason, issue_id))
        self._conn.commit()

    def insert_issue_test_cases(self, issue_id: str, testcases: list):
        _testcases = [(str(uuid4()), issue_id, tc['summary'], tc['description']) for tc in testcases]
        with self._conn:
            self._conn.executemany(INSERT_TEST_CASES, _testcases)
