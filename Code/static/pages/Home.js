const Home = {
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
      <div class="container mt-5 flex-grow-1">
        <div class="row justify-content-center">
          <div class="col-sm-6 col-md-4 mb-4 d-flex justify-content-center">
            <div class="card text-center shadow-sm" style="width: 18rem;">
              <div class="card-header bg-white">
                <img src="/static/images/admin.jpg" class="card-img-top" alt="Admin Image">
              </div>
              <div class="card-body">
                <h5 class="card-title">Admin</h5>
                <router-link to="/login">
                  <button type="button" class="btn btn-success mt-3">Login</button>
                </router-link>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-md-4 mb-4 d-flex justify-content-center">
            <div class="card text-center shadow-sm" style="width: 18rem;">
              <div class="card-header bg-white">
                <img src="/static/images/user.jpg" class="card-img-top" alt="User Image">
              </div>
              <div class="card-body">
                <h5 class="card-title">General User</h5>
                <router-link to="/login">
                  <button type="button" class="btn btn-success mt-3 me-2">Login</button>
                </router-link>
                <router-link to="/signup">
                  <button type="button" class="btn btn-primary mt-3">Sign Up</button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer class="bg-light text-center text-lg-start mt-5 py-3">
        <div class="text-center">
          © 2024 - Library Management System | Akshat Bhagotra
        </div>
      </footer>
    </div>
  `,
};

export default Home;
