<template>
    <v-card class="ma-6">
        <v-card-title>
            <h3>Add site report</h3>
        </v-card-title>
        <v-card-text>
            <v-form class="px-3">
                <v-container
                    fluid
                    ma-0
                    pa-0
                    fill-height
                >
                    <v-row>
                        <v-col md="3">
                            <v-date-picker
                                v-model="date"
                                first-day-of-week="1"
                                no-title
                                full-width
                            ></v-date-picker>
                        </v-col>
                        <v-col align="right">
                            <v-select
                                :items="sites"
                                v-model="site"
                                label="Site"
                                prepend-icon="place"
                                outlined
                                required
                            ></v-select>
                            <v-text-field
                                v-model="volume"
                                label="Volume (m³)"
                                prepend-icon="local_gas_station"
                                outlined
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="temperature"
                                label="Temperature (°C)"
                                prepend-icon="filter_drama"
                                outlined
                                required
                            ></v-text-field>
                            <v-btn
                                x-large
                                color="primary"
                                @click="submit"
                            >Send report</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
import axios from "axios";

export default {
    name: "ReportForm",
    data: () => ({
        sites: [
            "X-1", "X-2", "X-3"
        ],
        date:        new Date().toISOString().split("T")[0],
        site:        null,
        volume:      null,
        temperature: null
    }),
    methods: {
        async submit() {
            const response = await axios
                .post("http://127.0.0.1:80/addSiteReport", {
                    date:        this.date,
                    site:        this.site,
                    volume:      this.volume,
                    temperature: this.temperature
                });

            console.log(response.data);
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
