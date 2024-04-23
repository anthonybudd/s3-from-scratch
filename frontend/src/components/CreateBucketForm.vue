<template>
    <v-card title="Create Bucket">
        <v-card-text>
            <v-text-field
                v-model="bucketName"
                label="Bucket Name"
                variant="outlined"
                density="compact"
                required
                @keyup="onKeyUpBucketName"
                @keydown.enter.prevent="onClickCreateBucket"
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
import { defineEmits, ref } from 'vue';
import api from './../api';

const { notify } = useNotification();
const emit = defineEmits(['showsidebar']);
const loading = ref(false);
const bucketName = ref('');

const onClickCreateBucket = async () => {
    loading.value = true;
    const { data: bucket } = await api.buckets.create({
        name: bucketName.value,
    });
    emit('onCreateBucket', bucket);
    notify({
        title: 'Bucket Created'
    });
    loading.value = false;
};

const onKeyUpBucketName = async () => {
    bucketName.value = bucketName.value.replace(/[^a-zA-Z0-9-]/g, '');
};
</script>
