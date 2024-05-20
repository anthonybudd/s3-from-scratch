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

                <h2 class="text-center mb-2">Sign-up</h2>
                <v-text-field
                    v-model="firstName"
                    :disabled="isLoading"
                    variant="outlined"
                    label="Name"
                    required
                    density="compact"
                    class="mb-2"
                    :error-messages="(errors.firstName) ? [errors.firstName.msg] : []"
                ></v-text-field>
                <v-text-field
                    v-model="email"
                    :disabled="isLoading"
                    variant="outlined"
                    label="Email"
                    required
                    density="compact"
                    class="mb-2"
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
                    @keydown.enter.prevent="onClickSignUp"
                    :error-messages="(errors.password) ? [errors.password.msg] : []"
                ></v-text-field>

                <v-checkbox
                    label="Checkbox"
                    v-model="tos"
                    true-value="2023-04-22"
                    false-value=""
                    hide-details
                >
                    <template v-slot:label>
                        <div>
                            I agree to the


                            <v-dialog max-width="800">
                                <template v-slot:activator="{ props }">
                                    <span
                                        v-bind="props"
                                        class="link"
                                    >
                                        Terms of Service
                                    </span>
                                </template>

                                <template v-slot:default="{}">
                                    <TermsOfService></TermsOfService>
                                </template>
                            </v-dialog>
                        </div>
                    </template>
                </v-checkbox>


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
                        @click="onClickSignUp"
                        class="mr-2"
                    >Sign-up</v-btn>

                    <v-btn
                        :disabled="isLoading"
                        color="default"
                        :to="`/login`"
                    >Login</v-btn>
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
import TermsOfService from './../components/TermsOfService.vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const route = useRoute();
const errorHandler = inject('errorHandler');
const hCaptchaSiteKey = import.meta.env.VITE_H_CAPTCHA_SITE_KEY;

const isLoading = ref(false);
const errors = ref({});
const firstName = ref('');
const email = ref('');
const password = ref('');
const tos = ref('');
const failedAttempts = ref(0);
const hCaptcha = ref(false);

const onVerifyHcaptcha = (token) => {
    hCaptcha.value = token;
};
const onExpiredHcaptcha = () => {
    hCaptcha.value = false;
};

const onClickSignUp = async () => {
    try {
        isLoading.value = true;
        const { data } = await api.auth.signUp({
            firstName: firstName.value,
            email: email.value,
            password: password.value,
            tos: tos.value,
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