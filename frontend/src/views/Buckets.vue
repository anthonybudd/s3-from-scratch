<template>
    <div class="bg-grey-lighten-3">
        <v-container>
            <h1 class="text-h5 font-weight-bold">Buckets</h1>
        </v-container>
    </div>
    <div>
        <v-container class="fill-height">
            <v-sheet
                width="100%"
                rounded
                border
            >
                <v-container class="px-4 py-4 d-flex align-center justify-center">
                    <v-spacer></v-spacer>
                    <v-dialog
                        v-model="dialog"
                        max-width="500"
                    >
                        <template v-slot:activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="grey-darken-3"
                                variant="flat"
                            >
                                Create Bucket
                            </v-btn>
                        </template>

                        <template v-slot:default="{ isActive }">
                            <CreateBucketForm @onCreateBucket="onCreateBucket" />
                        </template>
                    </v-dialog>
                </v-container>

                <v-data-table
                    :search="search"
                    :headers="headers"
                    :items="items"
                    :items-per-page-options="[]"
                    class="hide-items"
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn
                            size="small"
                            variant="tonal"
                            class="red--text"
                            @click="deleteBucket(item)"
                            :loading="item.loading"
                            :disabled="item.loading"
                        >
                            Delete
                        </v-btn>
                    </template>
                </v-data-table>
            </v-sheet>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from './../api';
import CreateBucketForm from './../components/CreateBucketForm.vue';


const items = ref([]);
const search = ref('');
const dialog = ref(false);
const headers = [
    { title: 'ID', key: 'id' },
    { title: 'Name', key: 'name' },
    { title: 'Actions', key: 'actions' },
];


onMounted(async () => {
    getData();
});

const getData = async () => {
    const { data } = await api.buckets.index();
    items.value = data;
};

const onCreateBucket = async (bucket) => {
    dialog.value = false;
    getData();
};

const deleteBucket = async (bucket) => {
    bucket.loading = true;
    await api.buckets.delete(bucket.id);
    items.value = items.value.filter((item) => item.id !== bucket.id);
    bucket.loading = true;
};
</script>