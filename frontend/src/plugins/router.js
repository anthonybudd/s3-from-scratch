// Composables
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        component: () => import('@/layouts/default/Default.vue'),
        children: [
            {
                path: '',
                name: 'Buckets',
                component: () => import(/* webpackChunkName: "home" */ '@/views/Buckets.vue'),
            },
        ],
    },

    {
        path: '/',
        component: () => import('@/layouts/default/Auth.vue'),
        children: [
            {
                path: '/login',
                name: 'Login',
                component: () => import(/* webpackChunkName: "home" */ '@/views/Login.vue'),
            },
            {
                path: '/sign-up',
                name: 'SignUp',
                component: () => import(/* webpackChunkName: "home" */ '@/views/SignUp.vue'),
            },
            {
                path: '/logout',
                name: 'Logout',
                beforeEnter: async (to, from, next) => {
                    console.warn('/logout');
                    localStorage.removeItem('AccessToken');
                    if (to.query.redirect) {
                        next(`/login?redirect=${to.query.redirect}`);
                    } else {
                        next('/login');
                    }
                },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes,
});

export default router;
