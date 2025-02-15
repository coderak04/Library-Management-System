const UserDashboard = {
  template: `
  <div style="display: flex; flex-direction: column; min-height: 100vh;">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Online Library</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
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
    <br>
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <form class="d-flex" @submit.prevent="searchBooks">
          <input v-model="searchName" class="form-control me-2" type="search" placeholder="Search">
          <select v-model="selectedGenre" class="form-select me-2" aria-label="Genre">
            <option value="">Select Genre</option>
            <option v-for="i in sectionNames" :key="i.name" :value="i.name">{{ i.name }}</option>
          </select>
          <button class="btn btn-outline-success me-2" type="submit">Search</button>
        </form>
      </div>
    </nav>
    <div v-if="error" class="container mt-5 text-center" style="flex-grow: 1;">
      <h1 class="mb-4">OOPS NO BOOK FOUND</h1>
      <p class="lead mb-4">EXPLORE NOW</p>
      <router-link class="btn btn-primary" to="/UserDashboard" @click.native="resetSearch">Explore</router-link>
    </div>
    <div v-else class="container" style="flex-grow: 1;">
      <div class="row row-cols-1 row-cols-md-5 g-4">
        <div v-for="data in bookDetails" :key="data.title" class="col">
          <div class="card h-100">
            <img :src="'../' + data.bookImage" class="card-img-top h-100" alt="Book Image">
            <div class="card-body">
              <h5 class="card-title">{{ data.title }}</h5>
              <h5 class="card-title">Author: {{ data.authorName }}</h5>
              <div class="footer">
                <button @click="showDetails(data.title)" class="btn btn-primary">Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="bg-light text-center text-lg-start mt-4" style="flex-shrink: 0;">
      <div class="text-center p-3">
        © 2024 - Library Management System | Akshat Bhagotra
      </div>
    </footer>
  </div>`,

  data() {
    return {
      url: window.location.origin + '/logout',
      searchName: '',
      selectedGenre: '',
      sectionNames: [],
      bookDetails: [],
      error: false
    };
  },
  mounted() {
    this.fetchSections();
    this.fetchAllBooks();
  },
  methods: {
    async fetchSections() {
      try {
        if (this.$store.getters.isAuthenticated) { // Check if the user is authenticated
          const token = this.$store.state.token;
          const response = await fetch(`${window.location.origin}/api/sections`, {
            headers: {
              'Authentication-Token': token
            }
          });
          if (response.ok) {
            const sections = await response.json();
            this.sectionNames = sections.map(section => ({
              name: section.name
            }));
          } else {
            console.error('Failed to fetch sections');
          }
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    },
    async fetchAllBooks() {
      try {
        if (this.$store.getters.isAuthenticated) { // Check if the user is authenticated
          const token = this.$store.state.token;
          const response = await fetch(`${window.location.origin}/api/books`, {
            headers: {
              'Authentication-Token': token
            }
          });
          if (response.ok) {
            this.bookDetails = await response.json();
            this.error = this.bookDetails.length === 0;
          } else {
            console.error('Failed to fetch books');
            this.error = true;
          }
        } else {
          console.error('User is not authenticated');
          this.error = true;
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        this.error = true;
      }
    },
    async searchBooks() {
      try {
        const params = new URLSearchParams({
          searchName: this.searchName,
          selectedGenre: this.selectedGenre
        });
        if (this.$store.getters.isAuthenticated) { // Check if the user is authenticated
          const token = this.$store.state.token;
          const response = await fetch(`${window.location.origin}/api/books?${params}`, {
            headers: {
              'Authentication-Token': token
            }
          });
          if (response.ok) {
            this.bookDetails = await response.json();
            this.error = this.bookDetails.length === 0;
          } else {
            console.error('Failed to fetch books');
            this.error = true;
          }
        } else {
          console.error('User is not authenticated');
          this.error = true;
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        this.error = true;
      }
    },
    resetSearch() {
      this.searchName = '';
      this.selectedGenre = '';
      this.fetchAllBooks();
    },
    showDetails(bookTitle) {
      this.$router.push({ name: 'BookDetails', params: { title: bookTitle } });
    }
  }
};

export default UserDashboard;
