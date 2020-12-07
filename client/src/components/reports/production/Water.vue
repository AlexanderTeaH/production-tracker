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
                    <v-checkbox
                        v-model="isDailyReport"
                        label="Daily report"
                    ></v-checkbox>
                    <v-menu
                        v-model="dateMenu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                    >
                        <template v-slot:activator="{ on }">
                            <v-text-field
                                :disabled="!isDailyReport"
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
                    <v-select
                        :items="wells"
                        v-model="well"
                        label="Well"
                        prepend-icon="place"
                        outlined
                        required
                        :rules="[v => !!v || 'Site is required']"
                    ></v-select>
                    <v-text-field
                        v-model="level"
                        label="Level in tank (m)"
                        prepend-icon="square_foot"
                        outlined
                        required
                        :rules="[v => !!v || 'Level is required', numberRule]"
                    ></v-text-field>
                    <v-text-field
                        v-model="volume"
                        label="Volume in tank (m³)"
                        prepend-icon="local_gas_station"
                        outlined
                        required
                        :rules="[v => !!v || 'Volume is required', numberRule]"
                    ></v-text-field>
                    <v-text-field
                        v-model="weight"
                        label="Weight in tank (tons)"
                        prepend-icon="fitness_center"
                        outlined
                        required
                        :rules="[v => !!v || 'Weight is required', numberRule]"
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
                        :disabled="!isDailyReport"
                        v-model="totalVolume"
                        label="Total volume for the day (m³)"
                        prepend-icon="local_gas_station"
                        outlined
                        required
                        :rules="[v => !!v || 'Total volume is required', numberRule]"
                    ></v-text-field>
                    <v-text-field
                        :disabled="!isDailyReport"
                        v-model="totalWeight"
                        label="Total weight for the day (tons)"
                        prepend-icon="fitness_center"
                        outlined
                        required
                        :rules="[v => !!v || 'Total weight is required', numberRule]"
                    ></v-text-field>
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
import axios from "axios";

const baseURL = "http://127.0.0.1";

export default {
    name: "WaterProductionReport",

    data: () => ({
        // Internal form values
        dateMenu:      false,
        isValid:       true,

        // Fetched data
        wells:         [],
        
        // Form values
        well:          null,
        isDailyReport: false,
        date:          new Date().toISOString().split("T")[0],
        level:         null,
        volume:        null,
        density:       1.13,
        weight:        null,

        // Validation rules
        numberRule: (v) => {
            if (!isNaN(v)) {
                return true;
            }

            return "Value must be a number";
        }
    }),

    created() {
        this.fetchData();
    },

    methods: {
        async fetchData() {
            this.wells = (await axios.get(`${baseURL}/sites/production`))
                .data.documents.map(site => site.name);
        },

        async submit() {
            let body = {
                site:    this.well,
                level:   this.level,
                volume:  this.volume,
                density: this.density,
                weight:  this.weight
            };

            if (this.isDailyReport) {
                body.dailyReportDate = this.date;
            }

            const response = await axios.post(`${baseURL}/reports/production/water`, body);
            
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
