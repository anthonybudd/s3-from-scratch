<template>
    <router-view v-if="isLoaded" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import api from './api';
import router from "@/plugins/router";

const store = useStore();
const isLoaded = ref(false);

onMounted(async () => {
    const skipAuthPages = ['/login']; // Auth not needed on these pages
    const skipAuth = new RegExp(skipAuthPages.join('|')).test(window.location.href);

    if (skipAuth) {
        isLoaded.value = true;
        return;
    }

    const accessToken = localStorage.getItem('AccessToken');
    if (!accessToken) {
        isLoaded.value = true;
        router.push('/logout');
    } else {
        api.setJWT(accessToken);
        try {
            const { data: user } = await api.user.get();
            store.commit('setUser', user);
        } catch (error) {
            router.push('/login');
        }
        isLoaded.value = true;
    }
});
</script>
