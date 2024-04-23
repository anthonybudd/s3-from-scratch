<template>
    <div>
        <v-app-bar
            flat
            :height="(xs) ? 80 : 150"
        >
            <v-container
                fluid
                class="px-0 py-0"
            >
                <v-container class="d-flex align-center justify-center">
                    <v-app-bar-nav-icon
                        v-if="xs"
                        @click="drawer = !drawer"
                    ></v-app-bar-nav-icon>
                    <v-spacer v-if="xs"></v-spacer>

                    <div class="d-flex align-center justify-center">
                        <v-img
                            :width="(xs) ? 40 : 60"
                            src="./../../assets/logo.png"
                        ></v-img>
                        <h1
                            v-if="!xs"
                            class="ml-4"
                        >S3</h1>
                    </div>

                    <v-spacer></v-spacer>

                    <v-menu>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                color="primary"
                                variant="outlined"
                                v-bind="props"
                                class="px-1"
                            >
                                <v-icon
                                    icon="mdi-account"
                                    size="large"
                                ></v-icon>
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-text class="d-flex align-center justify-center">
                                <v-btn
                                    color="primary"
                                    variant="tonal"
                                    class="px-1"
                                >
                                    {{ user.firstName.charAt(0) }}.{{ user.lastName.charAt(0) }}
                                </v-btn>
                                <p class="ml-4">
                                    <span class="font-weight-bold">{{ user.firstName }} {{ user.lastName }}</span><br>
                                    <span class="text-medium-emphasis">{{ user.id.split('-')[0].toUpperCase() }}</span>
                                </p>
                            </v-card-text>
                            <v-divider></v-divider>
                            <v-list class="pb-0 pt-0">
                                <v-list-item :to="'/logout'">
                                    <v-list-item-title>Logout</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-menu>
                </v-container>
                <v-divider class="d-none d-sm-block"></v-divider>
            </v-container>
        </v-app-bar>
        <v-navigation-drawer
            v-model="drawer"
            temporary
        >
            <v-list-item
                v-for="link in links"
                :to="link.href"
                :key="link.text"
                :title="link.text"
                link
            ></v-list-item>
        </v-navigation-drawer>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useStore } from 'vuex';

const store = useStore();
const { xs } = useDisplay();

const drawer = ref(false);
const user = ref(store.getters['user']);

const links = [
    { href: '/', text: 'Buckets' },
    { href: '/logout', text: 'Logout' },
];
</script>
