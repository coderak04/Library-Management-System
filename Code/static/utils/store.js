const store = new Vuex.Store({
  state: {
    token: '',
    role: '',
    email: '',
    id: ''
  },
  mutations: {
    setUser(state, payload) {
      state.token = payload.token;
      state.role = payload.role;
      state.email = payload.email;
      state.id = payload.id;
    },
    clearUser(state) {
      state.token = '';
      state.role = '';
      state.email = '';
      state.id = '';
    }
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user);
    },
    logout({ commit }) {
      commit('clearUser');
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    userRole: state => state.role,
    userEmail: state => state.email,
    userId: state => state.id
  }
});

console.log('isAuthenticated:', store.getters.isAuthenticated);
console.log('userRole:', store.getters.userRole);
console.log('userEmail:', store.getters.userEmail);
console.log('userId:', store.getters.userId);
export default store;
