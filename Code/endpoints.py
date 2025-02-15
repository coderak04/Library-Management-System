from datetime import date, timedelta
from sqlalchemy import func
from models import *
from flask import make_response, request, jsonify,send_file
from flask_restful import Api, Resource, reqparse
from flask_security import auth_required,roles_required
from flask_security.utils import hash_password
from werkzeug.utils import secure_filename
from extensions import cache
import os

from tasks import export_books_task

api=Api()

class SectionListResource(Resource):
    @cache.cached(timeout=10)
    @auth_required('token')
    def get(self):
        sections = Section.query.all()
        section_list = [{'name': section.name, 'description': section.description, 
                         'date_created': section.date_created.strftime("%Y-%m-%d")} for section in sections]
        return jsonify(section_list)

class BookListResource(Resource):
    @auth_required('token')
    def get(self):
        search_name = request.args.get('searchName', '')
        selected_genre = request.args.get('selectedGenre', '')
        query = Book.query
        
        if search_name:
            query = query.filter(Book.title.ilike(f'%{search_name}%'))
        
        if selected_genre:
            query = query.join(SectionBook).join(Section).filter(Section.name == selected_genre)
        
        books = query.all()
        return jsonify([
            {
                'title': book.title,
                'authorName': ', '.join([author.author_name for author in book.authors]),
                'bookImage': book.book_image
            } for book in books
        ])


class BookDetailResource(Resource):
    @cache.cached(timeout=5)
    @auth_required('token')
    def get(self, title):
        bookDetails = db.session.query(Book.id, Book.title, Book.content, Author.author_name, Book.book_image,
                                       func.group_concat(Section.name).label('sections')) \
            .join(AuthorBook, Book.id == AuthorBook.book_id) \
            .join(Author, AuthorBook.author_id == Author.id) \
            .join(SectionBook, SectionBook.book_id == Book.id) \
            .join(Section, SectionBook.section_id == Section.id) \
            .filter(Book.title == title).all()

        if not bookDetails:
            return {'message': 'Book not found'}, 404

        comments = Comment.query.filter_by(book_id=bookDetails[0].id).order_by(Comment.date_posted.desc()).limit(5).all()
        comment_list = [{'id': comment.id, 'content': comment.content, 'date_posted': comment.date_posted.isoformat(), 'user': {'username': comment.user.email}} for comment in comments]

        return {
            'details': [{
                'title': bookDetails[0].title,
                'content': bookDetails[0].content,
                'bookImage': bookDetails[0].book_image,
                'section': bookDetails[0].sections,
                'author': bookDetails[0].author_name
            }],
            'comments': comment_list
        }

class IssueBookResource(Resource):
    @auth_required('token')
    @roles_required('student')
    def post(self, title):
        book = Book.query.filter_by(title=title).first()
        print(book)
        if not book:
            return {'error': 'Book not found'}, 404
        
        user_id = request.headers.get('User-Id')
        if not user_id:
            return {'error': 'User not authenticated'}, 401
        
        profile_user = User.query.get(user_id)
        if not profile_user:
            return {'error': 'User not found'}, 404
        
        issued_books_count = IssuedBook.query.filter_by(user_id=profile_user.id).count()
        if issued_books_count >= 5:
            return {'error': 'You have already issued the maximum number of books (5).'}, 400
        
        if IssuedBook.query.filter_by(book_id=book.id).first():
            return {'error': 'The book is already issued to another user.'}, 400
        
        issued_book = IssuedBook(user_id=profile_user.id, book_id=book.id, date_issued=date.today(), date_returned=date.today() + timedelta(days=7))
        db.session.add(issued_book)
        db.session.commit()
        
        return {'message': 'Book issued successfully'}

# Resource for submitting a comment
class SubmitCommentResource(Resource):
    @auth_required('token')
    @roles_required('student')
    def post(self, title):
        book = Book.query.filter_by(title=title).first()
        print(book)
        if not book:
            return {'error': 'Book not found'}, 404
        
        user_id = request.headers.get('User-Id')
        if not user_id:
            return {'error': 'User not authenticated'}, 401
        
        profile_user = User.query.get(user_id)
        if not profile_user:
            return {'error': 'User not found'}, 404
        
        data = request.get_json()
        comment_content=data.get('comment')
        if not comment_content:
            return {'error': 'Comment content is required'}, 400
        
        new_comment = Comment(content=comment_content, date_posted=date.today(), user_id=profile_user.id, book_id=book.id)
        db.session.add(new_comment)
        db.session.commit()
        
        return {'message': 'Comment submitted successfully'}
    
class MyBooksResource(Resource):
    @auth_required('token')
    @roles_required('student')
    @cache.cached(timeout=5)
    def get(self):
        user_id = request.headers.get('User-Id')
        my_books = IssuedBook.query.filter_by(user_id=user_id).all()
        books = [{
            'id': book.book_id,
            'bookImage':book.book.book_image,
            'title': book.book.title,
            'author': book.book.authors[0].author_name,
            'issued_date': book.date_issued.isoformat(),
            'return_date': book.date_returned.isoformat()
        } for book in my_books]
        return jsonify(books)

    @auth_required('token')
    def post(self):
        user_id = request.headers.get('User-Id')
        action = request.json.get('action')
        book_id = request.json.get('book_id')
        
        if action == 'return':
            issued_book = IssuedBook.query.filter_by(user_id=user_id, book_id=book_id).first()
            if issued_book:
                db.session.delete(issued_book)
                db.session.commit()
                return {'message': 'Book Returned Successfully'}, 200
            return {'message': 'Book not found or not issued'}, 404
        
        elif action == 'read':
            read_book = Book.query.filter_by(id=book_id).first()
            if read_book:
                book_details = {
                    'id': read_book.id,
                    'title': read_book.title,
                    'author': read_book.author.author_name,
                    'content': read_book.content,
                    'published_date': read_book.published_date,
                    'book_image': read_book.book_image
                }
                return jsonify(book_details), 200
            return {'message': 'Book not found'}, 404

        return {'message': 'Invalid action'}, 400
    
class UpdatePasswordResource(Resource):
    @auth_required('token')
    @roles_required('student')
    def put(self):
        user_id = request.headers.get('User-Id')
        if not user_id:
            return 401
        
        user = User.query.get(user_id)
        if not user:
            return  404

        data = request.get_json()
        new_password = data.get('password')
        if not new_password:
            return 400

        user.password = hash_password(new_password)
        db.session.commit()
        
        return {'message': 'Password updated successfully'},200

class AddSectionResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('sectionName', type=str, required=True, help='Section name is required')
        parser.add_argument('description', type=str, required=False, help='Description of the section')
        args = parser.parse_args()

        new_section_name = args['sectionName']
        description = args['description']

        # Check if section already exists
        section = Section.query.filter_by(name=new_section_name).first()
        print(section)
        if section:
            return {'error': f'Section "{new_section_name}" already exists'}, 400

        # Create and add new section
        new_section = Section(name=new_section_name, description=description, date_created=date.today())
        db.session.add(new_section)
        db.session.commit()

        return {'message': 'Section Added Successfully'}, 201

class AddBookResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        # Handle form data
        title = request.form.get('bookTitle')
        content = request.form.get('description')
        author_name = request.form.get('authorName')
        section_names = request.form.get('sectionName').split(",")

        # Handle file upload
        if 'bookImage' not in request.files:
            return {'error': 'No file part'}, 400
        file = request.files['bookImage']
        if file.filename == '':
            return {'error': 'No selected file'}, 400
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join('static/images', filename)
            file.save(file_path)
            book_image_path = file_path
        else:
            return {'error': 'Invalid file'}, 400

        # Check if book already exists
        existing_book = Book.query.filter_by(title=title).first()
        if existing_book:
            return {'error': 'Book with this title already exists'}, 400

        # Check if sections exist
        section_instances = []
        for section_name in section_names:
            section = Section.query.filter_by(name=section_name).first()
            if not section:
                return {'error': f'Section "{section_name}" does not exist'}, 400
            section_instances.append(section)

        # Check if author exists or create a new one
        existing_author = Author.query.filter_by(author_name=author_name).first()
        if existing_author:
            new_author = existing_author
        else:
            new_author = Author(author_name=author_name)
            db.session.add(new_author)

        # Create and add new book
        new_book = Book(title=title, content=content, book_image=book_image_path,
                        authors=[new_author], section=section_instances)
        db.session.add(new_book)
        db.session.commit()

        return {'message': 'Book added Successfully'}, 201

class SectionResource(Resource):
    @auth_required('token')
    def delete(self, sectionname):
        section = Section.query.filter_by(name=sectionname).first()
        print(section)
        if not section:
            return make_response(jsonify({"error": "Section not found"}), 404)
        
        # Fetch all books in this section
        books_in_section = section.book
        authors_to_check = set()

        for book in books_in_section:
            # Track authors to check later
            for author in book.authors:
                authors_to_check.add(author)

            # Check if the book is in any other section
            other_sections = SectionBook.query.filter(SectionBook.book_id == book.id, SectionBook.section_id != section.id).all()
            if not other_sections:
                # If the book is only in this section, delete it        
                # First, delete entries from the section_book table
                SectionBook.query.filter_by(book_id=book.id).delete()

                # Then, delete entries from the author_book table
                AuthorBook.query.filter_by(book_id=book.id).delete()

                # Commit the deletions in the relationship tables
                db.session.commit()

                # Now, delete the book itself
                db.session.delete(book)

        # Commit the deletions of the books
        db.session.commit()

        # Finally, delete the section
        db.session.delete(section)
        db.session.commit()

        # Check and delete orphaned authors
        for author in authors_to_check:
            other_books = AuthorBook.query.filter(AuthorBook.author_id == author.id).all()
            if not other_books:
                db.session.delete(author)

        # Commit the deletions of the orphaned authors
        db.session.commit()

        return make_response(jsonify({"message": "Section and associated books and authors deleted successfully"}), 200)

class BooksBySectionResource(Resource):
    @auth_required('token')
    #@cache.cached(timeout=30)
    def get(self, section_name):
        section = Section.query.filter_by(name=section_name).first()
        if not section:
            return {'error': 'Section not found'}, 404

        books = Book.query.join(SectionBook).filter(SectionBook.section_id == section.id).all()
        if not books:
            return jsonify([])

        return jsonify([
            {
                'title': book.title,
                'authorName': ', '.join([author.author_name for author in book.authors]),
                'bookImage': book.book_image
            } for book in books
        ])

class EditSectionResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def put(self):
        # Get the entire JSON payload
        data = request.get_json()
        
        # Extract individual fields from the JSON data
        current_section_name = data.get('currentName')
        new_section_name = data.get('name')
        new_description = data.get('description')
        
        # Query the section by the current name
        section = Section.query.filter_by(name=current_section_name).first()
        if not section:
            return {'message': 'Section not found'}, 404
        
        # Check if the provided new values are the same as the existing ones
        if new_section_name == section.name and new_description == section.description:
            return {'message': 'No changes detected'}, 200
        
        # Update the section details
        section.name = new_section_name
        section.description = new_description
        db.session.commit()
        
        return {'message': 'Section updated successfully'}, 200
    
class EditBookResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def put(self):
        data = request.json
        current_title = data.get('currentTitle')
        title = data.get('title')
        content = data.get('content')
        new_author = data.get('author')
        section_input = data.get('section')

        if isinstance(section_input, str):
            section_names = section_input.split(', ')  # Assuming sections are sent as a comma-separated string
        elif isinstance(section_input, list):
            section_names = [name.strip() for name in section_input]  # If already a list, just trim whitespace
        else:
            return jsonify({'error': 'Invalid section format'})

        book = Book.query.filter_by(title=current_title).first()

        if not book:
            return jsonify({'error': 'Book not found'}), 404

        # Update book details
        book.title = title
        book.content = content

        # Check if the author exists, if not create a new one
        author = Author.query.filter_by(author_name=new_author).first()
        if not author:
            author = Author(author_name=new_author)
            db.session.add(author)

        # Update the authors list for the book
        book.authors = [author]

        # Clear existing sections
        SectionBook.query.filter_by(book_id=book.id).delete()

        # Check if all sections exist
        existing_sections = []
        non_existing_section_names = []
        for name in section_names:
            section = Section.query.filter_by(name=name).first()
            if section:
                existing_sections.append(section)
            else:
                non_existing_section_names.append(name)

        if non_existing_section_names:
            return make_response(jsonify({"error": "Section not found"}), 404)

        # Add new sections to the book
        for section in existing_sections:
            book.section.append(section)

        db.session.commit()
        return jsonify({'message': 'Book updated successfully'})

class DeleteBookResource(Resource):    
    @auth_required('token')
    @roles_required('admin')
    def delete(self, book_title):
        # Find the book
        book = Book.query.filter_by(title=book_title).first()
        if not book:
            return {'message': 'Book not found'}, 404

        # Extract the authors associated with the book
        author_ids = [author.id for author in book.authors]

        # Delete the book
        db.session.delete(book)
        db.session.commit()

        # Check if any of the authors have other books
        for author_id in author_ids:
            other_books = Book.query.join(AuthorBook).filter(AuthorBook.author_id == author_id).all()
            if not other_books:
                # Delete the author if they have no other books
                author = Author.query.get(author_id)
                db.session.delete(author)
                db.session.commit()

        return {'message': 'Book deleted successfully'}, 200

class MonitorIssuedBooksResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    @cache.cached(timeout=5)
    def get(self):
        issued_books = IssuedBook.query.join(User, IssuedBook.user_id == User.id) \
                        .join(Book, IssuedBook.book_id == Book.id) \
                        .add_columns(User.email, Book.title, IssuedBook.date_returned) \
                        .all()
        return jsonify([{
            'email': book.email,
            'title': book.title,
            'date_returned': book.date_returned.strftime('%Y-%m-%d')
        } for book in issued_books])

class RevokeAccessResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data = request.get_json()
        bookname = data.get('book_name')
        email = data.get('email')  # Changed from username to email
        
        book_id = Book.query.filter_by(title=bookname).with_entities(Book.id).scalar()
        user_id = User.query.filter_by(email=email).with_entities(User.id).scalar()
        
        if book_id and user_id:
            revokebook = IssuedBook.query.filter_by(book_id=book_id, user_id=user_id).first()
            if revokebook:
                db.session.delete(revokebook)
                db.session.commit()
                return jsonify({'message': f'Access to {bookname} revoked for {email} Successfully'})
            else:
                return jsonify({'error': 'Record not found'})
        return jsonify({'error': 'Invalid book or user'})
    

class StartExportResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        task = export_books_task.delay()
        return jsonify({'task_id': task.id})

class ExportStatusResource(Resource):
    @auth_required('token')
    @roles_required('admin')    
    def get(self, task_id):
        task = export_books_task.AsyncResult(task_id)
        if task.state == 'PENDING':
            response = {
                'state': task.state,
                'status': 'Export is pending...'
            }
        elif task.state != 'FAILURE':
            info = task.info if isinstance(task.info, dict) else {}
            response = {
                'state': task.state,
                'status': info.get('status', ''),
                'result': info.get('file_path', '')
            }
        else:
            response = {
                'state': task.state,
                'status': str(task.info)
            }
        return jsonify(response)

class DownloadExportResource(Resource):
    @auth_required('token')
    @roles_required('admin')    
    def get(self, task_id):
        task = export_books_task.AsyncResult(task_id)
        if task.state == 'SUCCESS':
            file_path = task.result.get('file_path', '')
            if os.path.exists(file_path):
                return send_file(file_path, as_attachment=True, download_name='report.csv')
            return jsonify({'error': 'File not found'})
        return jsonify({'error': 'Export not ready'})





# Add resources to the API
api.add_resource(SectionResource, '/api/sections/<string:sectionname>')    
api.add_resource(SectionListResource, '/api/sections')
api.add_resource(BookListResource, '/api/books')
api.add_resource(BookDetailResource, '/api/books/<string:title>')
api.add_resource(IssueBookResource, '/api/books/<string:title>/issue')
api.add_resource(SubmitCommentResource, '/api/books/<string:title>/comment')
api.add_resource(MyBooksResource, '/api/MyBooks')
api.add_resource(UpdatePasswordResource, '/api/user/update_password')
api.add_resource(AddSectionResource, '/api/add_section')
api.add_resource(AddBookResource, '/api/add_book')
api.add_resource(BooksBySectionResource, '/api/sections/<string:section_name>/books')
api.add_resource(EditSectionResource, '/api/editsection')
api.add_resource(EditBookResource, '/api/editbook')
api.add_resource(DeleteBookResource, '/api/deletebook/<string:book_title>')
api.add_resource(MonitorIssuedBooksResource, '/api/issued_books')
api.add_resource(RevokeAccessResource, '/api/revoke_access')
api.add_resource(StartExportResource, '/api/start_export')
api.add_resource(ExportStatusResource, '/api/export_status/<string:task_id>')
api.add_resource(DownloadExportResource, '/api/download_export/<string:task_id>')