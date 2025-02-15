const AdminDashboard = {
  template: `
  <div style="display: flex; flex-direction: column; min-height: 100vh;">
    <!-- Navigation bar -->
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
            <a class="nav-link" :href="url">Logout</a>
          </div>
        </div>
      </div>
    </nav>
    <br>

    <!-- Search and Actions -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <form class="d-flex" @submit.prevent="searchBooks">
          <input v-model="searchName" class="form-control me-2" type="search" placeholder="Search">
          <button class="btn btn-outline-success me-2" type="submit">Search</button>
          <router-link to="/AddSection" class="btn btn-secondary me-2">Add Section</router-link>
          <router-link to="/AddBook" class="btn btn-secondary">Add Book</router-link>
        </form>
      </div>
    </nav>

    <!-- Error Message -->
    <div v-if="error" class="container mt-5 text-center" style="flex-grow: 1;">
      <h1 class="mb-4">OOPS NO BOOK FOUND</h1>
      <p class="lead mb-4">EXPLORE NOW</p>
      <router-link class="btn btn-primary" to="/AdminDashboard" @click.native="resetSearch">Explore</router-link>
    </div>

    <!-- Content Grid -->
    <div v-else class="container" style="flex-grow: 1;">
      <!-- Sections -->
      <div v-if="!searched && sectionDetails.length" class="row row-cols-1 row-cols-md-4 g-4">
        <div v-for="data in sectionDetails" :key="data.name" class="col">
          <div class="card h-100">
            <div class="card-body" style="max-height: 200px; overflow-y: auto;">
              <h5 class="card-title">{{ data.name }}</h5>
              <p class="card-text">{{ data.description }}</p>
              <p class="card-text"><small class="text-muted">Created: {{ data.date_created }}</small></p>
            </div>
            <div class="card-footer">
              <form @submit.prevent="handleSectionAction(data.name, $event)" class="d-inline-flex">
                <button type="submit" class="btn btn-outline-success me-3" name="action" value="view">View Books</button>
                <button type="submit" class="btn btn-secondary me-3" name="action" value="edit">Edit Section</button>
                <button type="submit" class="btn btn-outline-danger" name="action" value="delete">Delete Section</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Books -->
      <div v-if="searched && bookDetails.length" class="row row-cols-1 row-cols-md-4 g-4">
        <div v-for="data in bookDetails" :key="data.title" class="col">
          <div class="card h-100">
            <img :src="'../' + data.bookImage" class="card-img-top h-100" alt="Book Image">
            <div class="card-body">
              <h5 class="card-title">{{ data.title }}</h5>
              <h5 class="card-title">Author: {{ data.authorName }}</h5>
              <div class="card-footer">
                <form @submit.prevent="handleBookAction(data.title, $event)" class="d-inline-flex">
                  <button type="submit" class="btn btn-outline-success me-3" name="action1" value="editbook">Edit</button>
                  <button type="submit" class="btn btn-outline-danger" name="action1" value="deletebook">Delete</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-light text-center text-lg-start mt-4" style="flex-shrink: 0;">
      <div class="text-center p-3">
        © 2024 - Library Management System | Akshat Bhagotra
      </div>
    </footer>
  </div>
  `,
  data() {
    return {
      url: window.location.origin + '/logout',
      searchName: '',
      selectedGenre: '',
      sectionNames: [],
      sectionDetails: [],
      bookDetails: [],
      error: false,
      searched: false
    };
  },
  mounted() {
    this.fetchSections();
    this.fetchBooks();
  },
  methods: {
    async fetchSections() {
      try {
        if (this.$store.getters.isAuthenticated) {
          const token = this.$store.state.token;
          const response = await fetch(`${window.location.origin}/api/sections`, {
            headers: {
              'Authentication-Token': token
            }
          });
          if (response.ok) {
            const sections = await response.json();
            this.sectionNames = sections.map(section => ({ name: section.name }));
            this.sectionDetails = sections;
          } else {
            console.error('Failed to fetch sections');
          }
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    },
    async fetchBooks() {
      try {
        if (this.$store.getters.isAuthenticated) {
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
        if (this.$store.getters.isAuthenticated) {
          const token = this.$store.state.token;
          const response = await fetch(`${window.location.origin}/api/books?${params}`, {
            headers: {
              'Authentication-Token': token
            }
          });
          if (response.ok) {
            this.bookDetails = await response.json();
            this.error = this.bookDetails.length === 0;
            this.searched = true;
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
    async handleSectionAction(sectionName, event) {
      const action = event.submitter.value;
      if (action === 'view') {
        this.fetchBooksBySection(sectionName);
      } else if (action === 'delete') {
        try {
          const response = await fetch(`/api/sections/${sectionName}`, {
            method: 'DELETE',
            headers: {
              'Authentication-Token': this.$store.state.token
            }
          });
          if (response.ok) {
            alert('Section deleted successfully.');
            this.fetchSections();
          } else {
            alert('Failed to delete section.');
          }
        } catch (err) {
          console.error(err);
          alert('Failed to delete section.');
        }
      }else if (action === 'edit'){
        try {
          this.$router.push({ name: 'EditSection', params: { sectionname: sectionName } });
        } catch (error) {
          console.error(error);
        }
      } 
    },
    async fetchBooksBySection(sectionName) {
      try {
        if (this.$store.getters.isAuthenticated) {
          const token = this.$store.state.token;
          const response = await fetch(`${window.location.origin}/api/sections/${sectionName}/books`, {
            headers: {
              'Authentication-Token': token
            }
          });
          if (response.ok) {
            this.bookDetails = await response.json();
            this.error = this.bookDetails.length === 0;
            this.searched = true;
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
    async handleBookAction(bookTitle, event) {
      const action1 = event.submitter.value;
      if (action1 === 'editbook') {
        this.$router.push({ name: 'EditBook', params: { title: bookTitle } });      
      } else if (action1 === 'deletebook') {
        try {
          const response = await fetch(`/api/deletebook/${bookTitle}`, {
            method: 'DELETE',
            headers: {
              'Authentication-Token': this.$store.state.token
            }
          });
          if (response.ok) {
            alert('Book deleted successfully.');
            this.searched=false;
            this.fetchSections();
          } else {
            console.log('Failed to delete book.');
          }
        } catch (err) {
          console.error(err);
        }
      }
    },
    resetSearch() {
      this.searchName = '';
      this.selectedGenre = '';
      this.searched = false;
      this.fetchBooks();
    }
  }
};

export default AdminDashboard;
