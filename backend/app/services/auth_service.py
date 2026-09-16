"""business logic for temporary auth."""

from datetime import date

from backend.app.data.sample_data import users
from backend.app.services.dashboard_service import DashboardService


SPECIAL_CHARACTERS = "!@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~"


class AuthService:

    def __init__(self) -> None:
        self.dashboard_service = DashboardService()

    # find a user by username in the temporary sample data
    def find_user(self, username: str) -> dict | None:
        for user in users:
            if user["username"] == username:
                return user
        return None

    # find a user by email in the temporary sample data
    def find_user_by_email(self, email: str) -> dict | None:
        for user in users:
            if user["email"] == email:
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

    # check that the email at least looks like an email
    def validate_email(self, email: str) -> str | None:
        if " " in email or email.count("@") != 1:
            return "Enter a valid email address."
        local, _, domain = email.partition("@")
        if not local or "." not in domain:
            return "Enter a valid email address."
        return None

    # create a temporary in-memory login user
    def create_user(self, username: str, name: str, email: str, password: str) -> dict:
        user_id = max(user["user_id"] for user in users) + 1 if users else 1
        user = {
            "user_id": user_id,
            "name": name,
            "email": email,
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
            "message": f"Welcome, {user['name']}!",
            "dashboard": self.dashboard_service.build_dashboard(user),
        }
