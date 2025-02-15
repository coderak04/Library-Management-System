const AddSection = {
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
                    <h4 class="text-right">New Section</h4>
                  </div>
                  <div class="mb-3">
                    <label for="sectionName" class="form-label">Section Name</label>
                    <input v-model="sectionName" type="text" class="form-control" id="sectionName" placeholder="Section Name" required>
                  </div>
                  <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <input v-model="description" type="text" class="form-control" id="description" placeholder="Description" required>
                  </div>
                  <div class="mb-3">
                    <label for="dateCreated" class="form-label">Date Created</label>
                    <input type="text" class="form-control" id="dateCreated" :value="currentDate" disabled>
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
      sectionName: '',
      description: '',
      currentDate: new Date().toISOString().split('T')[0],
      logoutUrl: `${window.location.origin}/logout`,
      flashMessage: '' // Property to store flash messages
    };
  },
  methods: {
    async submitForm() {
      try {
        const response = await fetch('/api/add_section', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.token
          },
          body: JSON.stringify({
            sectionName: this.sectionName,
            description: this.description
          })
        });
        const result = await response.json();
        if (response.ok) {
          this.flashMessage = 'Section added successfully!';
          this.$router.push("/AdminDashboard");
        } else {
          this.flashMessage = result.error || 'Failed to add section';
          this.resetForm();
          setTimeout(() => this.flashMessage = '', 3000); // Clear message after 3 seconds
        }
      } catch (error) {
        console.error('Error:', error);
        this.flashMessage = 'Error adding section';
        this.resetForm();
        setTimeout(() => this.flashMessage = '', 3000); // Clear message after 3 seconds
      }
    },
    resetForm() {
      this.sectionName = '';
      this.description = '';
    }
  }
};

export default AddSection;
