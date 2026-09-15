"""business logic for temporary auth."""

from datetime import date

from backend.app.data.sample_data import users


SPECIAL_CHARACTERS = "!@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~"


class AuthService:

    # find a user by username in the temporary sample data
    def find_user(self, username: str) -> dict | None:
        for user in users:
            if user["username"] == username:
                return user
        return None

    # check the password rules from the original auth work
    def validate_password(self, password: str) -> str | None:
        if len(password) < 8:
            return "Password must be at least 8 characters long."
        if " " in password:
            return "Password cannot contain spaces."
        if not any(char.isupper() for char in password):
            return "Password must contain at least one capital letter."
        if not any(char in SPECIAL_CHARACTERS for char in password):
            return "Password must contain at least one special symbol."
        return None

    # create a temporary in-memory login user
    def create_user(self, username: str, password: str) -> dict:
        user_id = max(user["user_id"] for user in users) + 1 if users else 1
        user = {
            "user_id": user_id,
            "name": username,
            "email": f"{username}@example.com",
            "username": username,
            "password": password,
            "created_at": date.today().isoformat(),
        }
        users.append(user)
        return user

    # check if the username and password match a temporary user
    def authenticate_user(self, username: str, password: str) -> dict | None:
        user = self.find_user(username)
        if not user or user["password"] != password:
            return None
        return user

    # create the dashboard response returned after auth succeeds
    def get_dashboard(self, user: dict) -> dict:
        return {
            "message": f"Welcome, {user['username']}!",
            "dashboard": "not developed yet",
        }
