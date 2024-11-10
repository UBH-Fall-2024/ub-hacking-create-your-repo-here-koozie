from flask import Flask, request, jsonify, redirect, url_for
from db import db
from db.models import User, Circle, Message, circles_to_messages, Keyword, circles_to_keywords
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS, cross_origin
from db.adding_functions import add_new_message, add_new_circle_to_message, add_new_circle

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:Hakaton2024@localhost:3306/koozie'
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SECRET_KEY'] = 'your_strong_secret_key'
app.config["JWT_SECRET_KEY"] = 'your_jwt_secret_key'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
db.init_app(app)
jwt = JWTManager(app)

blacklisted_tokens = set()


def blacklist_token(token):
    blacklisted_tokens.add(token)


def is_token_blacklisted(token):
    return token in blacklisted_tokens


def check_blacklist():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if is_token_blacklisted(token):
            return jsonify({"error": "Token has been invalidated"}), 401


@app.route("/api/home", methods=["GET"])
@cross_origin()
@jwt_required()
def search_and_get_circles():
    check_blacklist()
    if not get_jwt_identity():
        return jsonify({'error': 'You are not signed in'}), 300
    word = request.args.get('q')
    if word:
        circle_items = []
        result1 = Circle.query.filter(Circle.name.ilike(f'%{word}%')).all()
        # result2 = Keyword.query.filter(Keyword.keyword.ilike(f'%{word}%'))

        for circle in result1:
            circle_items.append({"id": circle.id, "name": circle.name})
        # for keyword in result2:
        #     idk = keyword.id
        #     circles2 = circles_to_keywords.query.filter(circles_to_keywords.keyword_id == idk).all()
        #     for circle in circles2:
        #         real_circle = Circle.query.filter(Circle.id == circle.circle_id).first()
        #         circle_items.append({"title": real_circle.name, "url": f"/circle/{real_circle.id}"})
        return jsonify({"data": circle_items})
    else:
        circles = Circle.query.all()
        circle_ids_and_names = []
        for circle in circles:
            circle_ids_and_names.append({"id": circle.id, "name": circle.name})
        return jsonify({'data': circle_ids_and_names}), 200


@app.route("/api/sign-in", methods=["POST"])
@cross_origin()
def signin():
    username = request.get_json().get("username")
    password = request.get_json().get("password")
    this_user = User.query.filter(User.username == username).first()
    if this_user and bcrypt.checkpw(password.encode('utf-8'), this_user.hashed_password.encode('utf-8')):
        access_token = create_access_token(identity=this_user.id)
        return jsonify({"message": "Login successful!", 'access_token': access_token}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401


@app.route("/api/sign-out", methods=['GET'])
@cross_origin()
@jwt_required()
def signout():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header missing or invalid"}), 401

    token = auth_header.split(' ')[1]
    blacklist_token(token)
    return jsonify({"message": "Logged out successfully"}), 200


@app.route("/api/user/me", methods=["GET"])
@cross_origin()
@jwt_required()
def send_user_info():
    check_blacklist()
    user_id = get_jwt_identity()
    user = User.query.filter(User.id == user_id).first()
    username = user.username
    first_name = user.first_name
    last_name = user.last_name
    return jsonify({"user": {"username": username, "first_name": first_name, "last_name": last_name}}), 200


# @app.route("/api/home", methods=["GET"])
# @cross_origin()
# @jwt_required()
# def get_circle_names():
#     check_blacklist()
#     if not get_jwt_identity():
#         return jsonify({'error': 'You are not signed in'}), 300
#     circles = Circle.query.all()
#     circle_ids_and_names = []
#     for circle in circles:
#         circle_ids_and_names.append({"id": circle.id, "name": circle.name})
#     return jsonify({'names': circle_ids_and_names}), 200


@app.route("/api/circle/create", methods=["POST"])
@cross_origin()
@jwt_required()
def create_new_circles():
    check_blacklist()
    if not get_jwt_identity():
        return jsonify({'error': 'You are not signed in'}), 300
    circle_name = request.get_json().get("title")
    add_new_circle(db, name=circle_name)
    this_circle = Circle.query.filter(Circle.name == circle_name).first()
    return jsonify({"id": this_circle.id, "name": this_circle.name})


@app.route("/api/home", methods=["POST"])
@cross_origin()
@jwt_required()
def redirect_to_circle():
    check_blacklist()
    if not get_jwt_identity():
        return jsonify({'error': 'You are not signed in'}), 300
    circle_id = request.get_json().get('circle_id')
    return redirect(url_for(f'/api/circle/{circle_id}'))


@app.route("/api/circle/<int:circle_id>", methods=["GET"])
@cross_origin()
@jwt_required()
def show_chat(circle_id):
    chat_messages = []
    my_id = get_jwt_identity()
    my_user = User.query.filter(User.id == my_id).first()
    our_messages = circles_to_messages.query.filter(circles_to_messages.circle_id == circle_id)
    for message in our_messages:
        mes = {}
        idm = message.message_id
        messages2 = Message.query.filter(Message.id == idm)
        username = messages2[0].username
        text = messages2[0].text
        if username == my_user.username:
            mes['sender'] = 'me'
        else:
            mes['sender'] = 'friend'
        mes['username'] = username
        mes['text'] = text
        chat_messages.append(mes)
    circle = Circle.query.filter(Circle.id == circle_id).first()
    return jsonify({'data': chat_messages, 'chatname': circle.name}), 200


@app.route("/api/circle/<int:circle_id>", methods=["POST"])
@cross_origin()
@jwt_required()
def send_message(circle_id):
    check_blacklist()
    text_message = request.get_json().get('message')
    user_id = get_jwt_identity()
    user = User.query.filter(User.id == user_id).first()
    add_new_message(db, user.username, text_message)
    message = Message.query.filter(Message.username == user.username).all()
    add_new_circle_to_message(db, circle_id, message[-1].id)

    chat_messages = []
    my_id = get_jwt_identity()
    my_user = User.query.filter(User.id == my_id).first()
    our_messages = circles_to_messages.query.filter(circles_to_messages.circle_id == circle_id)
    for message in our_messages:
        mes = {}
        idm = message.message_id
        messages2 = Message.query.filter(Message.id == idm)
        username = messages2[0].username
        text = messages2[0].text
        if username == my_user.username:
            mes['sender'] = 'me'
        else:
            mes['sender'] = 'friend'
        mes['username'] = username
        mes['text'] = text
        chat_messages.append(mes)
    return jsonify({'data': chat_messages}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
