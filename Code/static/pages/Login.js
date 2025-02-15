const Login = {
  template: `
    <div class="d-flex flex-column min-vh-100">
      <nav class="navbar navbar-light bg-secondary">
        <div class="container">
          <a class="navbar-brand d-flex align-items-center">
            <img src="/static/images/library.jpg" width="60" height="60" class="d-inline-block align-top" alt="Library Logo">
            <h1 class="ms-3 mb-0">LIBRARY MANAGEMENT SYSTEM</h1>
          </a>
        </div>
      </nav>
      <br>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div class="container mt-5 mb-5 flex-grow-1 d-flex justify-content-center align-items-center">
        <div class="row justify-content-center w-100">
          <div class="col-md-4">
            <div class="p-4 border rounded shadow-sm">
              <div class="text-center mb-4">
                <h4 class="text-primary">Welcome</h4>
              </div>
              <form @submit.prevent="submitInfo">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter your email" required>
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input v-model="password" type="password" class="form-control" id="password" placeholder="Enter your password" required>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-success me-3">Login</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <footer class="bg-light text-center text-lg-start mt-auto py-3">
        <div class="text-center">
          © 2024 - Library Management System | Akshat Bhagotra
        </div>
      </footer>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      role: "", // You can remove this if it's not used
      errorMessage: ""  // Add this to store error messages
    };
  },
  methods: {
    async submitInfo() {
      const url = `${window.location.origin}/loginn`;
      console.log('Sending request to:', url);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: this.email, password: this.password })
        });

        if (res.ok) {
          const data = await res.json();
          const userData = {
            token: data.token,
            role: data.role,
            email: data.email,
            id: data.id
          };
          console.log('Dispatching to Vuex store:', userData);
          this.$store.dispatch('login', userData);
          console.log('Vuex Store State:', this.$store.state);
          console.log('isAuthenticated:', this.$store.getters.isAuthenticated);
          console.log('userRole:', this.$store.getters.userRole);
          console.log('userEmail:', this.$store.getters.userEmail);
          console.log('userId:', this.$store.getters.userId);

          if (data.role === 'admin') {
            console.log("admin");
            this.$router.push("/AdminDashboard");
          } else if (data.role === 'student') {
            console.log("student");
            this.$router.push("/UserDashboard");
          }
          console.log("LOGGED IN SUCCESS");
        } else {
          const errorData = await res.json();
          this.errorMessage = errorData.message || 'Login failed. Please try again.';
          console.error('Login Failed:', this.errorMessage);
        }
      } catch (error) {
        console.error('Error:', error);
        this.errorMessage = 'An error occurred. Please try again.';
      } finally {
        // Clear the error message after 2 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 2000);
      }
    }
  }
};

export default Login;
