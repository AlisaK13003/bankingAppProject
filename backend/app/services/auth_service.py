"""business logic for authentication, backed by MongoDB."""

from datetime import date

import bcrypt

from backend.app.repositories.user_repository import UserRepository
from backend.app.services.dashboard_service import DashboardService


SPECIAL_CHARACTERS = "!@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~"


# bcrypt caps input at 72 bytes and raises past that, so encode once and
# truncate consistently between hashing and verifying
def hash_password(password: str) -> str:
    truncated = password.encode("utf-8")[:72]
    return bcrypt.hashpw(truncated, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    truncated = password.encode("utf-8")[:72]
    return bcrypt.checkpw(truncated, hashed_password.encode("utf-8"))


class AuthService:

    def __init__(self) -> None:
        self.users = UserRepository()
        self.dashboard_service = DashboardService()

    # find a user by username
    def find_user(self, username: str) -> dict | None:
        return self.users.find_by_username(username)

    # find a user by email
    def find_user_by_email(self, email: str) -> dict | None:
        return self.users.find_by_email(email)

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

    # create a login user in MongoDB
    def create_user(self, username: str, name: str, email: str, password: str) -> dict:
        user_data = {
            "user_id": self.users.next_user_id(),
            "name": name,
            "email": email,
            "username": username,
            "password": hash_password(password),
            "created_at": date.today().isoformat(),
        }
        return self.users.create_user(user_data)

    # check if the username and password match a user
    def authenticate_user(self, username: str, password: str) -> dict | None:
        user = self.find_user(username)
        if not user or not verify_password(password, user["password"]):
            return None
        return user

    # create the dashboard response returned after auth succeeds
    def get_dashboard(self, user: dict) -> dict:
        return {
            "message": f"Welcome, {user['name']}!",
            "dashboard": self.dashboard_service.build_dashboard(user),
        }
