import Home from "../pages/Home.js"
import Signup from "../pages/Signup.js"
import Login from "../pages/Login.js"
import UserDashboard from "../pages/UserDashboard.js"
import store from './store.js';
import BookDetails from '../pages/BookDetails.js'
import MyBooks from '../pages/MyBooks.js'
import Profile from '../pages/Profile.js'
import AdminDashboard from '../pages/AdminDashboard.js'
import AddBook from '../pages/AddBook.js'
import AddSection from '../pages/AddSection.js'
import EditSection from '../pages/EditSection.js'
import EditBook from '../pages/EditBook.js'
import Monitor from '../pages/Monitor.js'
import Read from "../pages/Read.js"

const routes = [
    { path: '/', component: Home },
    { path: "/login", component: Login },
    { path: "/signup", component: Signup },
    {
        path: '/UserDashboard',
        component: UserDashboard,
        meta: { requiresAuth: true, role: 'student' }
    },
    {
        path: '/BookDetails/:title',
        name: 'BookDetails', component: BookDetails,
        meta: { requiresAuth: true,role:"student"}
    },
    {
        path: '/MyBooks/', component: MyBooks,
        meta: { requiresAuth: true, role: 'student' }
    },
    {
        path: '/Read/', component: Read,
        meta: { requiresAuth: true, role: 'student' }
    },
    {
        path: '/Profile/', component: Profile,
        meta: { requiresAuth: true,role:'student' }
    },
    {
        path: '/AdminDashBoard/', component: AdminDashboard,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/AddBook/', component: AddBook,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/AddSection/', component: AddSection,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/EditSection/:sectionname', name: 'EditSection',
        component: EditSection,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/EditBook/:title', name: 'EditBook',
        component: EditBook,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/Monitor', component: Monitor,
        meta: { requiresAuth: true, role: 'admin' }
    },
];

const router = new VueRouter({
    routes,
});


router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const role = to.meta.role; // Access the role meta field directly
    const userRole = store.getters.userRole;
    if (requiresAuth && !store.getters.isAuthenticated) {
        next('/');
    } else if (role && role !== userRole) {
        next('/');
    } else {
        next();
    }
});

export default router;