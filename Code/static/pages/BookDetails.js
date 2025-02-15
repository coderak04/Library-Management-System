const BookDetails = {
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
      
      <!-- Content -->
      <main class="flex-grow-1">
        <!-- Alert Messages -->
        <div v-if="alertMessage" :class="['alert', alertTypeClass, 'alert-dismissible', 'fade', 'show']" role="alert">
          {{ alertMessage }}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 50vh;">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div class="container mt-5" v-if="!loading && detail">
          <div class="row justify-content-center">
            <div class="col-md-3">
              <div class="text-center mt-4 name">
                <div class="card">
                  <img :src="'../' + detail.bookImage" class="card-img-top h-100">
                </div>
              </div>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col">
              <div class="text-center mt-4 name">
                <p><strong>Sections:</strong> {{ detail.section }}</p>
                <p><strong>Author:</strong> {{ detail.author }}</p>
                <p>{{ detail.content }}</p>
              </div>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col">
              <button @click="issueBook" class="btn btn-outline-success">Issue Book</button>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col">
              <textarea v-model="comment" class="form-control" placeholder="Add your comment here..." rows="3"></textarea><br>
              <button @click="submitFeedback" class="btn btn-success">Submit Feedback</button>
            </div>
          </div>
        </div>
        
        <div class="container mt-5" v-if="!loading">
          <h2>Feedbacks</h2>
          <div v-if="comments.length">
            <div v-for="comment in comments" :key="comment.id" class="card mb-3">
              <div class="row g-0">
                <div class="col">
                  <div class="card-header">
                    <h5 class="card-title mb-0">{{ comment.user.username }}</h5>
                  </div>
                  <div class="card-body">
                    <p class="card-text">{{ comment.content }}</p>
                    <p class="card-text"><small class="text-muted">{{ comment.date_posted }}</small></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No feedbacks yet.</p>
          </div>
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="bg-light text-center text-lg-start mt-auto py-3">
        <div class="text-center">
          © 2024 - Library Management System | Akshat Bhagotra
        </div>
      </footer>
    </div>
  `,
  data() {
    return {
      url: window.location.origin + '/logout',
      detail: null,
      comments: [],
      comment: '',
      alertMessage: '',
      alertType: '',
      alertTimeout: null,
      loading: true // New loading state
    };
  },
  computed: {
    alertTypeClass() {
      return this.alertType === 'success' ? 'alert-success' : 'alert-danger';
    }
  },
  mounted() {
    this.fetchBookDetails();
  },
  methods: {
    async fetchBookDetails() {
      try {
        const bookTitle = this.$route.params.title;
        const token = this.$store.state.token;
        const response = await fetch(`${window.location.origin}/api/books/${bookTitle}`, {
          headers: {
            'Authentication-Token': token
          }
        });
        if (response.ok) {
          const data = await response.json();
          this.detail = data.details[0];
          this.comments = data.comments;
        } else {
          console.error('Failed to fetch book details');
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        this.loading = false; // Set loading to false after the data is fetched
      }
    },
    async issueBook() {
      try {
        const response = await fetch(`${window.location.origin}/api/books/${this.detail.title}/issue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.token,
            'User-Id': this.$store.getters.userId
          }
        });
        if (response.ok) {
          this.showAlert('Book issued successfully', 'success');
        } else {
          const errorData = await response.json();
          this.showAlert('Failed to issue book: ' + errorData.error, 'error');
        }
      } catch (error) {
        console.error('Error issuing book:', error);
      }
    },
    async submitFeedback() {
      try {
        const response = await fetch(`${window.location.origin}/api/books/${this.detail.title}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.token,
            'User-Id': this.$store.getters.userId
          },
          body: JSON.stringify({ comment: this.comment })
        });
        if (response.ok) {
          this.showAlert('Feedback submitted successfully', 'success');
          this.comment = '';
          this.fetchBookDetails();
        } else {
          const errorData = await response.json();
          this.showAlert('Failed to submit feedback: ' + errorData.error, 'error');
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    },
    showAlert(message, type) {
      this.alertMessage = message;
      this.alertType = type;
      if (this.alertTimeout) {
        clearTimeout(this.alertTimeout);
      }
      this.alertTimeout = setTimeout(() => {
        this.alertMessage = '';
        this.alertType = '';
      }, 5000);
    }
  }
};

export default BookDetails;
