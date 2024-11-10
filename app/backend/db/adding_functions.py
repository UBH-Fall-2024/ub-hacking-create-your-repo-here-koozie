from db.models import User, Circle, Message, Keyword, circles_to_messages
from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:Hakaton2024@localhost:3306/koozie' # password: Hakaton2024


# if you want to add data to databases manually (for testing)
def add_new_user(db, username, password, first_name, last_name):
    new_user = User(username=username, password=password, first_name=first_name, last_name=last_name)
    db.session.add(new_user)
    db.session.commit()


def add_new_circle_and_keywords(db, name, keywords):
    new_circle = Circle(name=name)
    db.session.add(new_circle)
    for keyword in keywords:
        new_keyword = Keyword(keyword=keyword)
        db.session.add(new_keyword)
    db.session.commit()


def add_new_circle(db, name):
    new_circle = Circle(name=name)
    db.session.add(new_circle)
    db.session.commit()


def add_new_message(db, username, text):
    new_message = Message(username=username, text=text)
    db.session.add(new_message)
    db.session.commit()


def add_new_circle_to_message(db, circle_id, message_id):
    new_entry = circles_to_messages(circle_id=circle_id, message_id=message_id)
    db.session.add(new_entry)
    db.session.commit()


with app.app_context():
    db = SQLAlchemy(app)
