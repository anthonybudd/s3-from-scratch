<template>
    <v-container class="fill-height d-flex align-center justify-center">
        <v-sheet
            width="500"
            rounded
            border
        >
            <v-container class="px-4 py-4">
                <v-img
                    class="mb-4 d-block m-auto"
                    width="60"
                    min-width="60"
                    src="./../assets/logo.png"
                ></v-img>

                <h2 class="text-center mb-2">Login</h2>
                <v-text-field
                    v-model="email"
                    :disabled="isLoading"
                    variant="outlined"
                    label="Email"
                    required
                    density="compact"
                    class="mb-2"
                    @keydown.enter.prevent="onClickLogin"
                    :error-messages="(errors.email) ? [errors.email.msg] : []"
                ></v-text-field>
                <v-text-field
                    v-model="password"
                    :disabled="isLoading"
                    variant="outlined"
                    type="password"
                    label="Password"
                    required
                    density="compact"
                    class="mb-2"
                    @keydown.enter.prevent="onClickLogin"
                    :error-messages="(errors.password) ? [errors.password.msg] : []"
                ></v-text-field>

                <vue-hcaptcha
                    v-if="hCaptchaSiteKey"
                    @verify="onVerifyHcaptcha"
                    @expired="onExpiredHcaptcha"
                    :sitekey="hCaptchaSiteKey"
                    :key="failedAttempts"
                    class="mb-2"
                ></vue-hcaptcha>
                <p
                    v-if="errors.htoken"
                    class="text-caption text-red mb-4"
                >{{ errors.htoken.msg }}</p>

                <div>
                    <v-btn
                        :disabled="isLoading"
                        :loading="isLoading"
                        color="primary"
                        @click="onClickLogin"
                        class="mr-2"
                    >Login</v-btn>
                    <v-btn
                        :disabled="isLoading"
                        color="default"
                        :to="`/sign-up`"
                    >Sign-up</v-btn>
                </div>
            </v-container>
        </v-sheet>
    </v-container>
</template>

<script setup>
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import { ref, inject } from 'vue';
import api from './../api';
import router from "@/plugins/router";
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const route = useRoute();
const errorHandler = inject('errorHandler');
const hCaptchaSiteKey = import.meta.env.VITE_H_CAPTCHA_SITE_KEY;

const isLoading = ref(false);
const errors = ref({});
const email = ref('');
const password = ref('');
const failedAttempts = ref(0);
const hCaptcha = ref(false);

const onVerifyHcaptcha = (token) => {
    hCaptcha.value = token;
};

const onExpiredHcaptcha = () => {
    hCaptcha.value = false;
};

const onClickLogin = async () => {
    try {
        isLoading.value = true;
        errors.value = {};
        const { data } = await api.auth.login({
            email: email.value,
            password: password.value,
            htoken: hCaptcha.value,
        });

        localStorage.setItem('AccessToken', data.accessToken);
        api.setJWT(data.accessToken);
        const { data: user } = await api.user.get();
        store.commit('setUser', user);

        if (route.query.redirect) {
            router.push(atob(route.query.redirect));
        } else {
            router.push('/');
        }
    } catch (error) {
        errorHandler(error, (data, code) => {
            if (code === 422) errors.value = data.errors;
            failedAttempts.value++;
        });
    } finally {
        isLoading.value = false;
    }
};
</script>