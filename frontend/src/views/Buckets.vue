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
                    v-model:expanded="expanded"
                    class="hide-items"
                >
                    <template v-slot:no-data>
                        <div class="text-center my-4">
                            <h2>No Buckets</h2>
                            <p>Click <b>Create Bucket</b> to create a new bucket.</p>
                        </div>
                    </template>

                    <template v-slot:item.name="{ item }">
                        <p class="my-4">
                            <b>{{ item.name }}</b><br>
                            <small class="d-none d-sm-flex">
                                <a
                                    v-if="item.status === 'Provisioned'"
                                    target="_blank"
                                    :href="`http://${item.endpoint}`"
                                >
                                    {{ item.endpoint }}
                                </a>
                                <span v-else>
                                    {{ item.endpoint }}
                                </span>
                            </small>
                        </p>
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
                            size="small"
                            label
                        >
                            {{ item.status }}
                        </v-chip>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-dialog
                            v-model="item.deleteBucketDialog"
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

                            <v-card title="Delete Bucket">
                                <v-card-text>
                                    <p>
                                        Are you sure you want to delete the bucket named <b>{{ item.name }}</b> and all
                                        of it's contents? This action cannot be undone.
                                    </p>

                                    <v-text-field
                                        v-model="item._name"
                                        label="Bucket Name"
                                        :placeholder="item.name"
                                        variant="outlined"
                                        density="compact"
                                        max-width="200"
                                        class="mt-2"
                                    ></v-text-field>
                                </v-card-text>
                                <template v-slot:actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        text
                                        @click="item.deleteBucketDialog = false"
                                    >
                                        Cancel
                                    </v-btn>
                                    <v-btn
                                        variant="flat"
                                        color="red"
                                        :loading="item.loading"
                                        :disabled="item.loading || item._name !== item.name"
                                        @click="deleteBucket(item)"
                                    >
                                        Delete
                                    </v-btn>
                                </template>
                            </v-card>
                        </v-dialog>
                    </template>

                    <template v-slot:expanded-row="{ columns, item }">
                        <tr class="expanded">
                            <td :colspan="columns.length">
                                <div class="credentials">
                                    <p class="mb-1"><v-icon
                                            size="small"
                                            icon="mdi-alert"
                                        ></v-icon> This will only be shown once.
                                    </p>
                                    <code>
<pre>
<strong>AccessKeyID:</strong><br>{{ item.accessKeyID }}
<strong>SecretAccessKey:</strong><br>{{ item.secretAccessKey }}
</pre>
</code>
                                </div>
                            </td>
                        </tr>

                    </template>
                </v-data-table>
            </v-sheet>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from './../api';
import CreateBucketForm from './../components/CreateBucketForm.vue';
import { useNotification } from "@kyvg/vue3-notification";


let updateLoop;
const { notify } = useNotification();
const items = ref([]);
const search = ref('');
const createBucketDialog = ref(false);
const headers = [
    { title: 'Name', key: 'name', width: '40%' },
    { title: 'Status', key: 'status', width: '30%' },
    { title: 'Actions', key: 'actions', width: '30%', align: 'right' },
];

const expanded = computed(() => (items.value.map(({ id, accessKeyID, secretAccessKey }) => ((accessKeyID && secretAccessKey) ? id : null))));

onMounted(async () => {
    const { data } = await api.buckets.index();
    items.value = data;
    updateLoop = setInterval(updateBuckets, (10 * 1000));
});

const updateBuckets = async () => {
    const { data: buckets } = await api.buckets.index();
    buckets.forEach((bucket) => {
        const index = items.value.findIndex((item) => item.id === bucket.id);
        if (index === -1) {
            items.value.push(bucket);
        } else {
            // This is required so you credentials are not lost
            items.value[index].status = bucket.status;
        }
    });
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
    bucket.deleteBucketDialog = false;
    notify({
        title: 'Bucket Deleted',
    });
};
</script>