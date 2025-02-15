const MyBooks = {
  template: `
    <div class="d-flex flex-column min-vh-100">
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Online Library</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav ms-auto mb-2 mb-lg-0">
              <router-link class="nav-link" to="/UserDashboard">Home</router-link>
              <router-link class="nav-link" to="/MyBooks">My Books</router-link>
              <router-link class="nav-link" to="/Profile">Profile</router-link>
              <a class="nav-link" :href="url">Logout</a>
            </div>
          </div>
        </div>
      </nav>
  
      <main class="flex-fill">
        <div class="container mt-5" v-if="successMessage">
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ successMessage }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        </div>
  
        <div class="container mt-5 text-center" v-if="!loading && !myBooks.length">
          <h1 class="mb-4">OOPS NO BOOK FOUND</h1>
          <p class="lead mb-4">ISSUE BOOK NOW</p>
          <router-link to="/UserDashboard" class="btn btn-primary">Explore</router-link>
        </div>
  
        <div class="container" v-if="!loading && myBooks.length">
          <div class="row row-cols-1 row-cols-md-5 g-4">
            <div class="col" v-for="book in myBooks" :key="book.id">
              <div class="card h-100">
                <img :src="'../' + book.bookImage" class="card-img-top h-100">
                <div class="card-body">
                  <h5 class="card-title">{{ book.title }}</h5>
                  <h5 class="card-title">Issued Date: {{ book.issued_date }}</h5>
                  <h5 class="card-title">Return Date: {{ book.return_date }}</h5>
                  <button @click="returnBook(book.id)" class="btn btn-outline-danger me-3">Return</button>
                  <button @click="readBook(book.id)" class="btn btn-outline-success">Read</button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div v-if="readBookDetails" class="container mt-5">
          <h2>{{ readBookDetails.title }}</h2>
          <p><strong>Author:</strong> {{ readBookDetails.author }}</p>
          <p><strong>Content:</strong> {{ readBookDetails.content }}</p>
          <p><strong>Published Date:</strong> {{ readBookDetails.published_date }}</p>
          <img :src="readBookDetails.book_image" alt="Book Image" />
        </div>
      </main>
  
      <footer class="bg-light text-center text-lg-start mt-4">
        <div class="text-center p-3">
          © 2024 - Library Management System | Akshat Bhagotra
        </div>
      </footer>
    </div>
  `,
  data() {
    return {
      url: `${window.location.origin}/logout`,
      myBooks: [],
      successMessage: '',
      readBookDetails: null,
      alertTimeout: null, // To store the timeout ID
      loading: true // New property to indicate loading state
    };
  },
  mounted() {
    this.fetchMyBooks();
  },
  methods: {
    async fetchMyBooks() {
      try {
        const token = this.$store.state.token;
        const userId = this.$store.getters.userId;
        const response = await fetch(`${window.location.origin}/api/MyBooks`, {
          headers: {
            'Authentication-Token': token,
            'User-Id': userId,
          },
        });
        if (response.ok) {
          this.myBooks = await response.json();
        } else {
          console.error('Failed to fetch books');
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        this.loading = false; // Ensure loading is set to false after the request completes
      }
    },
    async returnBook(bookId) {
      const token = this.$store.state.token;
      const userId = this.$store.getters.userId;
      const response = await fetch(`${window.location.origin}/api/MyBooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': token,
          'User-Id': userId,
        },
        body: JSON.stringify({ action: 'return', book_id: bookId }),
      });
      if (response.ok) {
        this.successMessage = 'Book Returned Successfully';
        this.fetchMyBooks(); // Refresh the list

        // Automatically hide the alert after 5 seconds
        if (this.alertTimeout) {
          clearTimeout(this.alertTimeout);
        }
        this.alertTimeout = setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      } else {
        const errorData = await response.json();
        alert('Failed to return book: ' + errorData.message);
      }
    },
    readBook(bookId) {
      this.$router.push("/Read");
    },
  },
};

export default MyBooks;
