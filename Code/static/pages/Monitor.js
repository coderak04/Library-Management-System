const Monitor = {
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
              <router-link class="nav-link" to="/AdminDashboard">Home</router-link>
              <a class="nav-link" :href="logoutUrl">Logout</a>
            </div>
          </div>
        </div>
      </nav>
      
      <div class="container mt-5">
        <h1 class="mb-4">Monitor Status</h1>
        <div v-if="issuedBooks.length" class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>User Email</th>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in issuedBooks" :key="book.title">
                <td>{{ book.email }}</td>
                <td>{{ book.title }}</td>
                <td>{{ book.date_returned }}</td>
                <td>Issued</td>
                <td>
                  <button @click="revokeAccess(book.title, book.email)" class="btn btn-danger">Revoke Access</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>No books are currently issued.</div>
        <div class="mt-4">
          <button @click="triggerExport" class="btn btn-primary">Export</button>
        </div>
      </div>
  
      <footer class="bg-light text-center text-lg-start mt-auto">
        <div class="text-center p-3">
          © 2024 - Library Management System | Akshat Bhagotra
        </div>
      </footer>
    </div>
  `,
  data() {
    return {
      issuedBooks: [],
      exportFileUrl: '',
      logoutUrl: `${window.location.origin}/logout`
    };
  },
  mounted() {
    this.fetchIssuedBooks();
    this.requestNotificationPermission();
  },
  methods: {
    async fetchIssuedBooks() {
      try {
        const response = await fetch(`${window.location.origin}/api/issued_books`, {
          headers: {
            'Authentication-Token': this.$store.state.token
          }
        });
        if (response.ok) {
          this.issuedBooks = await response.json();
        } else {
          this.notifyUser('Error', 'Failed to fetch issued books.');
        }
      } catch (error) {
        console.error('Error fetching issued books:', error);
        this.notifyUser('Error', 'Error fetching issued books.');
      }
    },
    async revokeAccess(bookTitle, email) {
      try {
        const response = await fetch(`${window.location.origin}/api/revoke_access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.token
          },
          body: JSON.stringify({
            book_name: bookTitle,
            email: email
          })
        });
        if (response.ok) {
          this.notifyUser('Success', `Access to ${bookTitle} revoked for ${email}`);
          this.fetchIssuedBooks(); // Refresh the issued books list
        } else {
          this.notifyUser('Error', 'Failed to revoke access.');
        }
      } catch (error) {
        console.error('Error revoking access:', error);
        this.notifyUser('Error', 'Error revoking access.');
      }
    },
    async triggerExport() {
      try {
        const response = await fetch(`${window.location.origin}/api/start_export`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.$store.state.token
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.task_id) {
            this.notifyUser('Info', 'Export initiated. Checking status...');
            this.checkExportStatus(data.task_id); // Start checking the export status
          } else {
            this.notifyUser('Error', 'Failed to initiate export.');
          }
        } else {
          console.error('Failed to initiate export');
          this.notifyUser('Error', 'Failed to initiate export.');
        }
      } catch (error) {
        console.error('Error initiating export:', error);
        this.notifyUser('Error', 'Error initiating export.');
      }
    },
    async checkExportStatus(taskId) {
      try {
        const response = await fetch(`${window.location.origin}/api/export_status/${taskId}`, {
          headers: {
            'Authentication-Token': this.$store.state.token
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.state === 'SUCCESS') {
            this.notifyUser('Success', 'Export completed successfully. Downloading now...');
            this.downloadExportFile(taskId); // Trigger file download
          } else if (data.state === 'PENDING' || data.state === 'STARTED') {
            setTimeout(() => {
              this.checkExportStatus(taskId); // Check again after a delay
            }, 60000); // Delay in milliseconds (1 min)
          } else {
            this.notifyUser('Error', 'Export failed.');
          }
        } else {
          console.error('Failed to check export status');
          this.notifyUser('Error', 'Failed to check export status.');
        }
      } catch (error) {
        console.error('Error checking export status:', error);
        this.notifyUser('Error', 'Error checking export status.');
      }
    },
    async downloadExportFile(taskId) {
      try {
        const fileResponse = await fetch(`${window.location.origin}/api/download_export/${taskId}`, {
          headers: {
            'Authentication-Token': this.$store.state.token
          }
        });
        if (fileResponse.ok) {
          const blob = await fileResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'exported_data.csv';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url); // Clean up
        } else {
          this.notifyUser('Error', 'Failed to download the export file.');
        }
      } catch (error) {
        console.error('Error downloading export file:', error);
        this.notifyUser('Error', 'Error downloading export file.');
      }
    },
    requestNotificationPermission() {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted.');
          } else {
            console.log('Notification permission denied.');
          }
        });
      }
    },
    notifyUser(title, body) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }
};

export default Monitor;
