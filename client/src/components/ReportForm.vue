<template>
    <v-card class="ma-6">
        <v-card-title>
            <h3>Add site report</h3>
        </v-card-title>
        <v-card-text>
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
                    <v-row>
                        <v-col md="12" align="center">
                            <v-date-picker
                                v-model="date"
                                first-day-of-week="1"
                                no-title
                            ></v-date-picker>
                        </v-col>
                        <v-col md="12">
                            <v-select
                                :items="sites"
                                v-model="site"
                                label="Site"
                                prepend-icon="place"
                                outlined
                                required
                                :rules="[v => !!v || 'Site is required']"
                            ></v-select>
                            <v-text-field
                                v-model="volume"
                                label="Volume (m³)"
                                prepend-icon="local_gas_station"
                                outlined
                                required
                                :rules="[v => !!v || 'Volume is required', numberRule]"
                            ></v-text-field>
                            <v-text-field
                                v-model="temperature"
                                label="Temperature (°C)"
                                prepend-icon="filter_drama"
                                outlined
                                required
                                :rules="[v => !!v || 'Temperature is required', numberRule]"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn
                x-large
                color="primary"
                block
                :disabled="!isValid"
                @click="submit"
            >Send report</v-btn>
        </v-card-actions>
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
        temperature: null,
        isValid:     true,
        numberRule: (v) => {
            if (!isNaN(v)) {
                return true;
            }

            return "Volume must be a number";
        }
    }),
    methods: {
        async submit() {
            const response = await axios
                .post("http://192.168.1.219:80/addSiteReport", {
                    date:        this.date,
                    site:        this.site,
                    volume:      this.volume,
                    temperature: this.temperature
                });
            
            if (response.status == 201) {
                this.$refs.form.reset();
            }

            console.log(response);
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
