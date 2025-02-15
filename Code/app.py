from flask import Flask
from views import *
import os
from extensions import db,security,cache
import endpoints
from models import User,Role
from flask_security import  SQLAlchemyUserDatastore
from create_initial_data import create_data
from worker import celery_init_app
from celery.schedules import crontab
from tasks import daily_reminder,monthly_activity_report

def create_app():
    app=Flask(__name__)
    app.config['SECRET_KEY'] = 'b\x95\xb9\xb1\xb7\xdf!\x01\x91K\x94'
    current_dir = os.path.abspath(os.path.dirname(__file__))
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(current_dir, "mad2_database.sqlite3")
    app.config['SECURITY_PASSWORD_SALT']='b\x85\xb1\xb1\xb7\xdf!\x01\x91K\x94'

    #configure token
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['SECURITY_TOKEN_MAX_AGE'] = 600 #10
    app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True

    #cache config
    app.config['CACHE_TYPE']="RedisCache"
    app.config["CACHE_DEFAULT_TIMEOUT"]=300
    app.config["DEBUG"]=True
    app.config["CACHE_REDIS_PORT"]=6379

    cache.init_app(app)
    db.init_app(app)
    
    

    with app.app_context():
        user_datastore=SQLAlchemyUserDatastore(db,User,Role)
        security.init_app(app,user_datastore)
        db.create_all()
        create_data(user_datastore)

    # disable CSRF protection, from WTforms as well as flask security
    app.config["WTF_CSRF_CHECK_DEFAULT"] = False
    app.config['SECURITY_CSRF_PROTECT_MECHANISMS'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True

 
    
    endpoints.api.init_app(app)

    create_view(app,user_datastore)
    
    return app


app=create_app()
celery_app=celery_init_app(app)

@celery_app.on_after_configure.connect
def setup_reminder_tasks(sender, **kwargs):
    sender.add_periodic_task(
            crontab(hour=21, minute=30),
            daily_reminder.s(),
        ) 

@celery_app.on_after_configure.connect
def setup_monthly_report(sender, **kwargs):
    # Calls monthly activity report on the first day of every month at midnight
    sender.add_periodic_task(
        crontab(day_of_month=1, hour=0, minute=0),
        monthly_activity_report.s(),
    )     

if __name__=="__main__":
    app.run(debug=True)