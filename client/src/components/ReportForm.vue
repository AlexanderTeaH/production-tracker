<template>
    <v-card class="ma-6">
        <v-card-title>
            <h3>Add report</h3>
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
                        <!--
                        <v-col align="center">
                            <v-date-picker
                                v-model="date"
                                first-day-of-week="1"
                                no-title
                            ></v-date-picker>
                        </v-col>
                        -->
                        <v-col>
                            <v-select
                                :items="reportTypes"
                                v-model="reportType"
                                label="Report type"
                                outlined
                                required
                                :rules="[v => !!v || 'Report type is required']"
                            ></v-select>
                            <v-btn-toggle
                                v-model="reportSubtype"
                                mandatory
                                tile
                                color="primary"
                                group
                            >
                                <v-btn
                                    value="oil"
                                    block
                                >
                                    <span class="hidden-sm-and-down">
                                        Oil
                                    </span>
                                    <v-icon right>
                                        local_gas_station
                                    </v-icon>
                                </v-btn>
                                <v-btn
                                    value="water"
                                    block
                                >
                                    <span class="hidden-sm-and-down">
                                        Water
                                    </span>
                                    <v-icon right>
                                        waves
                                    </v-icon>
                                </v-btn>
                            </v-btn-toggle>
                            <v-row class="mt-6">
                                <v-col v-if="reportType == 'Production report'">
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
                                        v-model="level"
                                        label="Level (m)"
                                        prepend-icon="square_foot"
                                        outlined
                                        required
                                        :rules="[v => !!v || 'Level is required', numberRule]"
                                    ></v-text-field>
                                    <v-text-field
                                        v-model="volume"
                                        label="Volume (m³)"
                                        prepend-icon="local_gas_station"
                                        outlined
                                        required
                                        :rules="[v => !!v || 'Volume is required', numberRule]"
                                    ></v-text-field>
                                    <v-text-field v-if="reportSubtype == 'oil'"
                                        v-model="temperature"
                                        label="Temperature (°C)"
                                        prepend-icon="filter_drama"
                                        outlined
                                        required
                                        :rules="[v => !!v || 'Temperature is required', numberRule]"
                                    ></v-text-field>
                                    <v-text-field
                                        v-model="density"
                                        label="Density (g/cm³)"
                                        prepend-icon="bubble_chart"
                                        outlined
                                        required
                                        :rules="[v => !!v || 'Density is required', numberRule]"
                                    ></v-text-field>
                                    <v-text-field
                                        v-model="weight"
                                        label="Weight (tons)"
                                        prepend-icon="fitness_center"
                                        outlined
                                        required
                                        :rules="[v => !!v || 'Weight is required', numberRule]"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
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
        reportTypes: [
            "Production report"
        ],
        reportType:    null,
        reportSubtype: null,
        isValid:       true,

        sites:       null,
        date:        new Date().toISOString().split("T")[0],
        site:        null,
        level:       null,
        volume:      null,
        temperature: null,
        density:     null,
        weight:      null,

        numberRule: (v) => {
            if (!isNaN(v)) {
                return true;
            }

            return "Volume must be a number";
        }
    }),
    created() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            this.sites = (await axios.get("http://127.0.0.1/sites/production"))
                .data.documents.map(site => site.name);
        },
        async submit() {
            const response = await axios
                .post(`http://127.0.0.1/reports/production/${this.reportSubtype}`, {
                    site:        this.site,
                    level:       this.level,
                    volume:      this.volume,
                    temperature: this.temperature,
                    density:     this.density,
                    weight:      this.weight
                });
            
            if (response.status == 201) {
                this.$refs.form.reset();
            }

            else {
                console.log(`Unexpected response submitting form:\n${response}`);
            }
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
