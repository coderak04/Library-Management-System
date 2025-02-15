from extensions import db, security
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsq

fsq.FsModels.set_db_info(db)


class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False, unique=True)
    content = db.Column(db.String, nullable=False)
    book_image = db.Column(db.String)
    book_pdf = db.Column(db.String, default="static\\images\\book.pdf")
    authors = db.relationship("Author", secondary="author_book")
    section = db.relationship("Section", secondary='section_book', overlaps="section")


class Author(db.Model):
    __tablename__ = 'authors'
    id = db.Column(db.Integer, primary_key=True)
    author_name = db.Column(db.String, unique=True)


class AuthorBook(db.Model):
    __tablename__ = 'author_book'
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey("authors.id"), primary_key=True)


class Section(db.Model):
    __tablename__ = 'sections'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=False)
    date_created = db.Column(db.Date, nullable=False)
    book = db.relationship('Book', secondary='section_book', overlaps='section')


class SectionBook(db.Model):
    __tablename__ = 'section_book'
    section_id = db.Column(db.Integer, db.ForeignKey("sections.id"), primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), primary_key=True)


class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String(), nullable=False)
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('user', lazy='dynamic'))


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String)

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.Date)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    user = db.relationship('User', backref='comments', lazy=True)
    book = db.relationship('Book', backref='comments', lazy=True)


class IssuedBook(db.Model):
    __tablename__ = 'issued_book'
    id = db.Column(db.Integer, primary_key=True)
    date_issued = db.Column(db.Date)
    date_returned = db.Column(db.Date)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    user = db.relationship('User', backref='issued_book', lazy=True)
    book = db.relationship('Book', backref='issued_book', lazy=True)
