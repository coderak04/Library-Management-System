from datetime import datetime, timedelta
from celery import shared_task
from mail_service import send_email
from extensions import db
from models import *
from flask import render_template_string
import csv
import io
import os
import time


@shared_task
def daily_reminder():
    now = datetime.now()
    reminder_window = timedelta(days=1)
    
    upcoming_due_books = db.session.query(IssuedBook).filter(
        IssuedBook.date_returned.between(now.date(), now.date() + reminder_window)
    ).all()
    print(upcoming_due_books)
    for issued_book in upcoming_due_books:
        user = issued_book.user
        book = issued_book.book
        send_email(
            user.email,
            "Reminder: Book Return Due Soon",
            f"Dear {user.email},\n\nYour book '{book.title}' is due for return on {issued_book.date_returned}. Please return it soon.\n\nThank you."
        )


@shared_task
def monthly_activity_report():
    # Calculate the date range for the past month
    today = datetime.today()
    first_day_of_month = today.replace(day=1)
    last_day_of_previous_month = first_day_of_month - timedelta(days=1)
    first_day_of_previous_month = last_day_of_previous_month.replace(day=1)

    # Query the database for sections created within the past month
    new_sections = Section.query.filter(
        Section.date_created >= first_day_of_previous_month,
    ).all()

    # Fetch data for the report
    issued_books = IssuedBook.query.all()
    comments = Comment.query.all()

    report_html = render_template_string("""
    <h1>Monthly Activity Report</h1>
    <h2>Issued Books</h2>
    <ul>
    {% for issued in issued_books %}
        <li>{{ issued.book.title }} issued by {{ issued.user.email }} on {{ issued.date_issued }}</li>
    {% endfor %}
    </ul>
    <h2>Comments</h2>
    <ul>
    {% for comment in comments %}
        <li>{{ comment.content }} by {{ comment.user.email }} on {{ comment.date_posted }} for book {{ comment.book.title }}</li>
    {% endfor %}
    </ul>
    <h2>Newly Created Sections</h2>
    <ul>
    {% for section in new_sections %}
        <li>{{ section.name }} - {{ section.description }} (Created on: {{ section.date_created }})</li>
    {% endfor %}
    </ul>
    """, issued_books=issued_books, comments=comments, new_sections=new_sections)

    
    librarian_email = "admin@gmail.com"  

    # Send the report via email
    send_email(librarian_email, "Monthly Activity Report", report_html)
    return "OK"


@shared_task
def export_books_task():
    time.sleep(20)  # Simulate a delay for export process
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['User Email', 'Book Title', 'Content', 'Author(s)', 'Date Issued', 'Return Date'])

    issued_books = IssuedBook.query.join(Book).join(AuthorBook).join(Author).join(User).all()

    for issued_book in issued_books:
        book = issued_book.book
        user = issued_book.user  
        authors = ', '.join([author.author_name for author in book.authors])
        writer.writerow([
            user.email,  
            book.title,
            book.content,
            authors,
            issued_book.date_issued.strftime('%Y-%m-%d'),
            issued_book.date_returned.strftime('%Y-%m-%d') if issued_book.date_returned else ''  
        ])

    output.seek(0)
    csv_content = output.getvalue()
    output.close()

    file_path = f'/tmp/export_{os.getpid()}.csv'
    with open(file_path, 'w') as file:
        file.write(csv_content)

    return {'file_path': file_path, 'status': 'completed'}


