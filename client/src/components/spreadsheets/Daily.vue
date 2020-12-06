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
                    <v-menu
                        v-model="dateMenu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        lazy
                        transition="scale-transition"
                        offset-y
                        max-width="290px"
                        min-width="290px"
                    >
                        <template v-slot:activator="{ on }">
                            <v-text-field
                                label="Date"
                                prepend-icon="event"
                                readonly
                                :value="date"
                                v-on="on"
                            ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="date"
                            first-day-of-week="1"
                            no-title
                            @input="dateMenu = false"
                        ></v-date-picker>
                    </v-menu>
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
    name: "DailyReport",

    data: () => ({
        dateMenu: false,
        isValid:  true,
        date:     new Date().toISOString().split("T")[0]
    }),

    methods: {
        async submit() {
            try {
                const response = await axios
                    .get(`/spreadsheets/daily/${this.date}`, {
                        responseType: "blob"
                    });
                
                console.log(response.headers);

                if (response.status == 200) {
                    download(new Blob([response.data], { type: response.data.type }), `Daily report ${this.date}.xlsx`);
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
