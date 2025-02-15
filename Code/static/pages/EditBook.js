const EditBook = {
  template: `
    <div class="d-flex flex-column min-vh-100">
      <!-- Navigation bar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Online Library</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav ms-auto mb-2 mb-lg-0">
              <router-link class="nav-link" to="/Monitor">Status</router-link>
              <router-link class="nav-link" to="/AdminDashboard">Home</router-link>
              <a class="nav-link" :href="logoutUrl">Logout</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Edit Book Form -->
      <div class="container mt-5 mb-5 flex-grow-1">
        <form @submit.prevent="submitForm">
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div class="p-3 py-5 border rounded">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h4 class="text-right">Edit Book</h4>
                </div>
                <div class="mb-3">
                  <label for="bookName" class="form-label">Book Title</label>
                  <input type="text" class="form-control" v-model="bookName" placeholder="Book Name">
                </div>
                <div class="mb-3">
                  <label for="content" class="form-label">Content</label>
                  <input type="text" class="form-control" v-model="content" placeholder="Content">
                </div>
                <div class="mb-3">
                  <label for="author" class="form-label">Author Name</label>
                  <input type="text" class="form-control" v-model="author" placeholder="Author Name">
                </div>
                <div class="mb-3">
                  <label for="section" class="form-label">Section</label>
                  <input type="text" class="form-control" v-model="section" placeholder="Section Name separated by comma">
                </div>
                <div class="text-center">
                  <button class="btn btn-outline-success" type="submit">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <footer class="bg-light text-center text-lg-start mt-auto py-3">
        <div class="text-center p-3">
          © 2024 - Library Management System | Akshat Bhagotra
        </div>
      </footer>
    </div>
  `,
  data() {
    return {
      bookName: '',
      content: '',
      author: '',
      section: '',
      logoutUrl: `${window.location.origin}/logout`
    };
  },
  methods: {
    async submitForm() {
      try {
        const bookTitle = this.$route.params.title;  // Assuming you pass the book ID in the route params

        const response = await fetch(`${window.location.origin}/api/editbook`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.token
          },
          body: JSON.stringify({
              currentTitle:bookTitle,
            title: this.bookName,
            content: this.content,
            author: this.author,
            section: this.section
          })
        });

        if (response.ok) {
          alert('Book updated successfully.');
          this.$router.push('/AdminDashboard');
        } else {
          alert('Failed to update book.');
        }
      } catch (error) {
        console.error('Error updating book:', error);
        alert('Failed to update book.');
      }
    }
  }
};

export default EditBook;
