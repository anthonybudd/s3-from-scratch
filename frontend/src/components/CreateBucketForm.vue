<template>
    <v-card title="Create Bucket">
        <v-card-text>
            <v-text-field
                v-model="namespace"
                label="Namespace"
                variant="outlined"
                density="compact"
                required
                @keyup="onKeyUpNamespace"
                @keydown.enter.prevent="onClickCreateBucket"
                :error-messages="(errors.namespace) ? [errors.namespace.msg] : []"
            ></v-text-field>
            <v-text-field
                v-model="bucketName"
                label="Bucket Name"
                variant="outlined"
                density="compact"
                required
                @keyup="onKeyUpBucketName"
                @keydown.enter.prevent="onClickCreateBucket"
                :error-messages="(errors.name) ? [errors.name.msg] : []"
            ></v-text-field>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                variant="flat"
                color="primary"
                @click="onClickCreateBucket"
                :loading="loading"
                :disabled="loading || bucketName.length < 4"
            >Create</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { useNotification } from "@kyvg/vue3-notification";
import { defineEmits, ref, inject } from 'vue';
import api from './../api';


const { notify } = useNotification();
const emit = defineEmits(['showsidebar']);
const errorHandler = inject('errorHandler');
const errors = ref({});
const loading = ref(false);
const namespace = ref('');
const bucketName = ref('');

const onClickCreateBucket = async () => {
    try {
        loading.value = true;
        const { data: bucket } = await api.buckets.create({
            namespace: namespace.value,
            name: bucketName.value,
        });
        emit('onCreateBucket', bucket);
        notify({
            title: 'Bucket Created'
        });
    } catch (error) {
        errorHandler(error, (data, code) => {
            if (code === 422) errors.value = data.errors;
        });
    } finally {
        loading.value = false;
    }
};

const onKeyUpBucketName = async () => {
    bucketName.value = bucketName.value.replace(/[^a-zA-Z0-9-]/g, '');
};

const onKeyUpNamespace = async () => {
    namespace.value = namespace.value.replace(/[^a-zA-Z0-9-]/g, '');
};
</script>
