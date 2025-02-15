const Profile = {
    template: `
      <div class="d-flex flex-column min-vh-100">
        <div class="content flex-grow-1">
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
              <a class="navbar-brand" href="#">Online Library</a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
                      aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav ms-auto mb-2 mb-lg-0">
                  <router-link class="nav-link" to="/UserDashboard" @click.native="resetSearch">Home</router-link>
                  <router-link class="nav-link" to="/MyBooks">My Books</router-link>
                  <router-link class="nav-link" to="/Profile">Profile</router-link>
                  <a class="nav-link" :href="url">Logout</a>
                </div>
              </div>
            </div>
          </nav>
          <div class="container mt-5" v-if="successMessage">
            <div :class="['alert', alertTypeClass, 'alert-dismissible', 'fade', 'show']" role="alert">
              {{ successMessage }}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          </div>
          <div class="container rounded bg-white mt-5 mb-5">
            <div class="row">
              <div class="col-md-3 border-right">
                <div class="d-flex flex-column align-items-center text-center p-3 py-5">
                  <img class="rounded-circle mt-5" width="150px"
                       src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg">
                  <span class="text-black-50">{{ email }}</span>
                </div>
              </div>
              <div class="col-md-5 border-right">
                <div class="p-3 py-5">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="text-right">Profile</h4>
                  </div>
                  <div class="row mt-3">
                    <div class="col-md-12">
                      <label class="labels">Email ID</label>
                      <input type="text" class="form-control" v-model="email" readonly>
                    </div>
                  </div>
                  <div class="row mt-3">
                    <div class="col-md-12">
                      <label class="labels">New Password</label>
                      <input type="password" class="form-control" v-model="newPassword" placeholder="Enter new password">
                    </div>
                  </div>
                  <div class="mt-5 text-center">
                    <button class="btn btn-outline-danger profile-button" @click="updatePassword">Update Password</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer class="bg-light text-center text-lg-start mt-4">
          <div class="text-center p-3">
            © 2024 - Library Management System | Akshat Bhagotra
          </div>
        </footer>
      </div>
    `,
    data() {
      return {
        url: window.location.origin + '/logout',
        email: '',
        newPassword: '',
        successMessage: '',
        alertClass: ''
      };
    },
    computed: {
      alertTypeClass() {
        return this.alertClass === 'alert-success' ? 'alert-success' : 'alert-danger';
      }
    },
    mounted() {
      this.fetchUserData();
    },
    methods: {
      fetchUserData() {
        this.email = this.$store.getters.userEmail;
      },
      updatePassword() {
        fetch('/api/user/update_password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.token,
            'User-Id': this.$store.getters.userId
          },
          body: JSON.stringify({ password: this.newPassword })
        })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            this.successMessage = data.message;
            this.alertClass = 'alert-success'; // Green
          } else {
            this.successMessage = 'Error updating password.';
            this.alertClass = 'alert-danger'; // Red
          }
          this.newPassword = '';
          setTimeout(() => {
            this.successMessage = '';
          }, 4000); // Hide alert after 4 seconds
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
    }
  };
  
  export default Profile;
