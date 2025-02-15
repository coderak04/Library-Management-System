from flask import jsonify, request, render_template
from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password,verify_password
from extensions import db
from models import *


def create_view(app, user_datastore: SQLAlchemyUserDatastore):
    @app.route("/")
    def home():
        return render_template("index.html")

    @app.route("/register", methods=['POST'])
    def register():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        print(email, password)
        print(role)

        if not email or not password or role not in ['student', 'admin']:
            return jsonify({'message': 'invalid input'}), 403

        if user_datastore.find_user(email=email):
            return jsonify({'message': 'user already exists'}), 400

        try:
            user_datastore.create_user(email=email, password=hash_password(password), roles=[role])
            db.session.commit()
            return jsonify({'message': 'User successfully created'}), 201
        except Exception as e:
            print('Error while creating:', e)
            db.session.rollback()
            return jsonify({'message': 'Error creating user'}), 500


    @app.route("/loginn", methods=['POST'])
    def loginn():
        print("Login route reached") 
        data = request.get_json()
        email = data.get('email')
        password=data.get('password')

        if not email or not password:
            return jsonify({'message':'Not valid email or password'}),404
        
        user = user_datastore.find_user(email=email)
        
        if not user:
            return jsonify({'message': 'Invalid User'}), 404
        
        if verify_password(password,user.password):
            return jsonify({'token':user.get_auth_token(),
                            'role':user.roles[0].name,
                            'id':user.id,'email':user.email}),200
        
        else:
            return jsonify({'message':'wrong password'}),401


