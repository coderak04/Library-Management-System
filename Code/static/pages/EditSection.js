const EditSection = {
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
  
        <!-- Edit Section Form -->
        <div class="container mt-5 mb-5 flex-grow-1">
          <form @submit.prevent="submitForm">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <div class="p-3 py-5 border rounded">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="text-right">Edit Section</h4>
                  </div>
                  <div class="mb-3">
                    <label for="sectionName" class="form-label">Section Name</label>
                    <input type="text" class="form-control" v-model="sectionName" placeholder="Section Name">
                  </div>
                  <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <input type="text" class="form-control" v-model="description" placeholder="Description">
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
        sectionName: '',
        description: '',
        logoutUrl: `${window.location.origin}/logout`,
      };
    },
    methods: {
      async submitForm() {
        try {
          const currentSectionName = this.$route.params.sectionname;
  
          const response = await fetch(`${window.location.origin}/api/editsection`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.token
            },
            body: JSON.stringify({
              currentName: currentSectionName,
              name: this.sectionName,
              description: this.description
            })
          });
          if (response.ok) {
            alert('Section updated successfully.');
            this.$router.push('/AdminDashboard');
          } else {
            alert('Failed to update section.');
          }
        } catch (error) {
          console.error('Error updating section:', error);
          alert('Failed to update section.');
        }
      }
    }
  };
  
  export default EditSection;
  