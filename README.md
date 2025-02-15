# Library Management System

> A comprehensive system to manage library operations efficiently, including book tracking, member management, and transaction monitoring.

## Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/coderak04/Library-Management-System.git
   cd Library-Management-System
   ```

2. **Set Up a Virtual Environment**:
   ```sh
   python3.10 -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. **Install Dependencies**:
   ```sh
   pip install -r req.txt
   ```

4. **Install Redis and Golang (for MailHog)**:
   ```sh
   sudo apt install redis-server
   sudo apt-get -y install golang-go
   ```

## Start the Application

To run the application, start the following services:

1. **Start the Flask Application**:
   ```sh
   python3 app.py
   ```

2. **Start Redis Server**:
   ```sh
   redis-server
   ```

3. **Start MailHog for Email Testing**:
   ```sh
   ~/go/bin/MailHog
   ```

4. **Start Celery Worker**:
   ```sh
   celery -A app.celery_app worker -l INFO
   ```

5. **Start Celery Beat Scheduler**:
   ```sh
   celery -A app.celery_app beat -l INFO
   ```

## Video Demonstration

[Watch the video demonstration](https://drive.google.com/file/d/1kKLY_zSj14B9iZdO_wQPxCyHW_t-lB3u/view?usp=sharing)

