const AddBook = {
  template: `
    <div class="d-flex flex-column min-vh-100">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Online Library</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav ms-auto mb-2 mb-lg-0">
              <router-link class="nav-link" to="/AdminDashboard" @click.native="resetSearch">Home</router-link>
              <router-link class="nav-link" to="/Monitor">Monitor</router-link>
              <a class="nav-link" :href="logoutUrl">Logout</a>
            </div>
          </div>
        </div>
      </nav>
      <main class="flex-fill">
        <div class="container mt-5 mb-5">
          <!-- Flash Messages -->
          <div v-if="flashMessage" class="alert alert-danger" role="alert">
            {{ flashMessage }}
          </div>
          <form @submit.prevent="submitForm">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <div class="p-3 py-5 border rounded">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="text-right">New Book</h4>
                  </div>
                  <div class="mb-3">
                    <label for="bookTitle" class="form-label">Book Title</label>
                    <input v-model="bookTitle" type="text" class="form-control" id="bookTitle" placeholder="Book Title" required>
                  </div>
                  <div class="mb-3">
                    <label for="description" class="form-label">Book Description</label>
                    <input v-model="description" type="text" class="form-control" id="description" placeholder="Book Description" required>
                  </div>
                  <div class="mb-3">
                    <label for="bookImage" class="form-label">Book Image</label>
                    <input ref="fileInput" @change="handleFileChange" type="file" class="form-control" id="bookImage" required>
                  </div>
                  <div class="mb-3">
                    <label for="authorName" class="form-label">Author Name</label>
                    <input v-model="authorName" type="text" class="form-control" id="authorName" placeholder="Author Name" required>
                  </div>
                  <div class="mb-3">
                    <label for="sectionName" class="form-label">Sections</label>
                    <input v-model="sectionName" type="text" class="form-control" id="sectionName" placeholder="Section Names separated by comma" required>
                  </div>
                  <div class="text-center">
                    <button class="btn btn-outline-success" type="submit">Submit</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <footer class="bg-light text-center text-lg-start mt-auto">
        <div class="text-center p-3">
          © 2024 - Library Management System | Akshat Bhagotra
        </div>
      </footer>
    </div>
  `,
  data() {
    return {
      bookTitle: '',
      description: '',
      bookImage: null,
      authorName: '',
      sectionName: '',
      logoutUrl: `${window.location.origin}/logout`,
      flashMessage: '' // Property to store flash messages
    };
  },
  methods: {
    handleFileChange(event) {
      this.bookImage = event.target.files[0];
    },
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append('bookTitle', this.bookTitle);
        formData.append('description', this.description);
        if (this.bookImage) {
          formData.append('bookImage', this.bookImage);
        }
        formData.append('authorName', this.authorName);
        formData.append('sectionName', this.sectionName);

        const response = await fetch('/api/add_book', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.$store.state.token
          },
          body: formData
        });
        const result = await response.json();
        if (response.ok) {
          this.flashMessage = 'Book added successfully!';
          this.$router.push("/AdminDashboard");
        } else {
          this.flashMessage = result.error || 'Failed to add book';
          this.resetForm();
          setTimeout(() => this.flashMessage = '', 3000); // Clear message after 3 seconds
        }
      } catch (error) {
        console.error('Error:', error);
        this.flashMessage = 'Error adding book';
        this.resetForm();
        setTimeout(() => this.flashMessage = '', 3000); // Clear message after 3 seconds
      }
    },
    resetForm() {
      this.bookTitle = '';
      this.description = '';
      this.bookImage = null;
      this.authorName = '';
      this.sectionName = '';
      // Reset file input value
      this.$refs.fileInput.value = '';
    }
  }
};

export default AddBook;
