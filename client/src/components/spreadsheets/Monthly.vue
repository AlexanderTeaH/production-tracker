<template>
    <v-form
        ref="form"
        v-model="isValid"
        px-3
    >
        <v-container
            fluid
            ma-0
            pa-0
            fill-height
        >
            <v-row class="mt-6">
                <v-col>
                    <v-select
                        :items="yearOptions"
                        v-model="year"
                        label="Year"
                        prepend-icon="event"
                        outlined
                        required
                        :rules="[v => !!v || 'Year is required']"
                    ></v-select>
                    <v-btn
                        x-large
                        color="primary"
                        block
                        :disabled="!isValid"
                        @click="submit"
                    >Send report</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-form>
</template>

<script>
import axios    from "axios";
import download from "downloadjs";

axios.defaults.baseURL = "http://127.0.0.1";

export default {
    name: "MonthlyReport",

    data: () => ({
        yearOptions: [],
        isValid:     true,
        year:        parseInt(new Date().toISOString().split("-")[0])
    }),

    created() {
        for (let i = 2020; i < parseInt(new Date().toISOString().split("-")[0]) + 1; i++) {
            this.yearOptions.push(i);
        }
    },

    methods: {
        async submit() {
            try {
                const response = await axios
                    .get(`/spreadsheets/monthly/${this.year}`, {
                        responseType: "blob"
                    });
                
                console.log(response.headers);

                if (response.status == 200) {
                    download(new Blob([response.data], { type: response.data.type }), `Monthly report ${this.year}.xlsx`);
                }

                else {
                    console.log(response);
                }
            }

            catch (error) {
                if (error.response.status == 401) {
                    console.log(`Unhandled error:\n${error}`);
                }

                else {
                    console.log(`Unhandled error:\n${error}`);
                }
            }
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
