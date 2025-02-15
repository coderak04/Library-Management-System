from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password
from extensions import db

def create_data(user_datastore: SQLAlchemySessionUserDatastore):
    print('creating user data')
    
    # Create roles
    user_datastore.find_or_create_role(name='admin', description='administrator')
    user_datastore.find_or_create_role(name='student', description='student')

    # Create user data
    if not user_datastore.find_user(email='admin@gmail.com'):
        user_datastore.create_user(email='admin@gmail.com', password=hash_password('pass'), roles=['admin'])

    if not user_datastore.find_user(email='student@gmail.com'):
        user_datastore.create_user(email='student@gmail.com', password=hash_password('pass'), roles=['student'])

    db.session.commit()
