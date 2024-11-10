from sqlalchemy.orm import Mapped, mapped_column
from db import db
import bcrypt


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    hashed_password: Mapped[str] = mapped_column(unique=False)
    first_name: Mapped[str] = mapped_column(unique=False)
    last_name: Mapped[str] = mapped_column(unique=False)

    def __init__(self, username: str, password: str, first_name: str, last_name: str):
        self.username = username
        password = password.encode('utf-8')
        self.hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
        self.first_name = first_name
        self.last_name = last_name


class Circle(db.Model):
    __tablename__ = "circles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)

    def __init__(self, name: str):
        self.name = name


class Keyword(db.Model):
    __tablename__ = "keywords"

    id: Mapped[int] = mapped_column(primary_key=True)
    keyword: Mapped[str] = mapped_column(unique=False)

    def __init__(self, keyword: str):
        self.keyword = keyword


class Message(db.Model):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=False)
    text: Mapped[str] = mapped_column(unique=False)


    def __init__(self, username: str, text: str):
        self.username = username
        self.text = text


class users_to_circles(db.Model):
    __tablename__ = "users_to_circles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(unique=False)
    circle_id: Mapped[int] = mapped_column(unique=False)

    def __int__(self, user_id: int, circle_id: int):
        self.user_id = user_id
        self.circle_id = circle_id


class circles_to_keywords(db.Model):
    __tablename__ = "circles_to_keywords"

    id: Mapped[int] = mapped_column(primary_key=True)
    circle_id: Mapped[int] = mapped_column(unique=False)
    keyword_id: Mapped[int] = mapped_column(unique=False)

    def __init__(self, circle_id: int, keyword_id: int):
        self.circle_id = circle_id
        self.keyword_id = keyword_id


class circles_to_messages(db.Model):
    __tablename__ = "circles_to_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    circle_id: Mapped[int] = mapped_column(unique=False)
    message_id: Mapped[int] = mapped_column(unique=False)

    def __init__(self, circle_id: int, message_id: int):
        self.circle_id = circle_id
        self.message_id = message_id
