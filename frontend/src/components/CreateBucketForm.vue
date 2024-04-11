<template>
    <v-card title="Create Bucket">
        <v-card-text>
            <v-text-field
                v-model="bucketName"
                label="Bucket Name"
                hide-details
                variant="outlined"
                denisty="compact"
                required
            ></v-text-field>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                variant="flat"
                color="primary"
                @click="onClickCreateBucket"
                :loading="loading"
                :disabled="loading"
            >Create</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { defineEmits, ref } from 'vue';
import api from './../api';

const emit = defineEmits(['showsidebar']);
const loading = ref(false);
const bucketName = ref('');

const onClickCreateBucket = async () => {
    loading.value = true;
    const { data: bucket } = await api.buckets.create({
        name: bucketName.value,
    });
    emit('onCreateBucket', bucket);
    loading.value = false;
};  
</script>
