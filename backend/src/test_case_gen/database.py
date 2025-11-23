import libsql

class Database:

    def __init__(self, database, auth_token):
        self._database = database
        self.auth_token = auth_token
        self._conn = None

    def __enter__(self):
        self._conn = libsql.connect(
            database=self._database,
            auth_token=self.auth_token
        )
        return self._conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._conn:
            self._conn.close()
