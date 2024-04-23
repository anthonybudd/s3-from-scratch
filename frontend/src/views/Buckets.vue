<template>
    <div>
        <v-container class="fill-height">
            <v-sheet
                width="100%"
                rounded
                border
            >
                <v-container class="px-4 py-4 d-flex align-center justify-center">
                    <v-text-field
                        v-model="search"
                        label="Search"
                        variant="outlined"
                        density="compact"
                        max-width="200"
                    ></v-text-field>
                    <v-spacer></v-spacer>
                    <v-dialog
                        v-model="createBucketDialog"
                        max-width="350"
                    >
                        <template v-slot:activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="grey-darken-3 btn-create-bucket"
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
                    <template v-slot:item.name="{ item }">
                        <p class="my-4">
                            <b>{{ item.name }}</b><br>
                            <small class="d-none d-sm-flex"><a :href="item.endpoint">{{ item.endpoint }}</a></small>
                        </p>

                        <code v-if="item.accessKeyID && item.secretAccessKey">
<pre class="creds">
<div class="mb-1"><v-icon icon="mdi-alert"></v-icon> This will only be shown once. Please save it somewhere safe.</div>
<strong>AccessKeyID:</strong> {{ item.accessKeyID }}
<strong>SecretAccessKey:</strong> {{ item.secretAccessKey }}
</pre>
</code>
                    </template>
                    <template v-slot:item.status="{ item }">
                        <template
                            v-if="item.status === 'Provisioning'"
                            color="red"
                            height="6"
                            indeterminate
                            rounded
                        >
                            <p>{{ item.status }}</p>
                            <v-progress-linear
                                color="deep-purple-accent-4"
                                height="6"
                                indeterminate
                                rounded
                            ></v-progress-linear>
                        </template>
                        <v-chip
                            v-else-if="item.status === 'Provisioned'"
                            class="ma-2"
                            color="green"
                            size="small"
                            label
                        >
                            Provisioned
                            <v-icon
                                icon="mdi-check"
                                end
                            ></v-icon>
                        </v-chip>
                        <v-chip
                            v-else
                            class="ma-2"
                            size="small"
                            label
                        >
                            {{ item.status }}
                        </v-chip>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-dialog
                            v-model="deleteBucketDialog"
                            max-width="400"
                        >
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-btn
                                    v-bind="activatorProps"
                                    size="small"
                                    variant="tonal"
                                    class="red--text"
                                >
                                    Delete
                                </v-btn>
                            </template>

                            <v-card
                                title="Delete Bucket"
                                text="Are you sure you want to delete this bucket? This action cannot be undone."
                            >
                                <template v-slot:actions>
                                    <v-spacer></v-spacer>

                                    <v-btn
                                        text
                                        @click="deleteBucketDialog = false"
                                    >
                                        Cancel
                                    </v-btn>

                                    <v-btn
                                        variant="flat"
                                        color="red"
                                        :loading="item.loading"
                                        :disabled="item.loading"
                                        @click="deleteBucket(item)"
                                    >
                                        Delete
                                    </v-btn>
                                </template>
                            </v-card>
                        </v-dialog>
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

let updateLoop;
const items = ref([]);
const search = ref('');
const createBucketDialog = ref(false);
const deleteBucketDialog = ref(false);
const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Status', key: 'status' },
    { title: 'Actions', key: 'actions' },
];


onMounted(async () => {
    await getData();
    updateLoop = setInterval(getData, 10000);
});

const getData = async () => {
    const { data } = await api.buckets.index();
    items.value = data;
};

const onCreateBucket = async (bucket) => {
    createBucketDialog.value = false;
    items.value.push(bucket);
};

const deleteBucket = async (bucket) => {
    bucket.loading = true;
    await api.buckets.delete(bucket.id);
    items.value = items.value.filter((item) => item.id !== bucket.id);
    bucket.loading = true;
    deleteBucketDialog.value = false;
};
</script>