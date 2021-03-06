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
                        full-width
                        max-width="290px"
                        min-width="290px"
                    >
                    <template v-slot:activator="{ on }">
                        <v-text-field
                            label="Date"
                            prepend-icon="event"
                            readonly
                            outlined
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
                        v-model="from"
                        label="From"
                        prepend-icon="place"
                        outlined
                        required
                        :rules="[v => !!v || 'From site is required']"
                    ></v-select>
                    <v-select
                        :items="wells"
                        v-model="to"
                        label="To"
                        prepend-icon="place"
                        outlined
                        required
                        :rules="[v => !!v || 'To site is required']"
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
    name: "OilTransportReport",

    data: () => ({
        isValid:     true,
        dateMenu:    false,
        date:        new Date().toISOString().split("T")[0],
        wells:       [],
        from:        null,
        to:          null,
        volume:      null,
        temperature: null,
        density:     null,
        weight:      null,

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
            this.wells = (await axios.get(`${baseURL}/sites/well`))
                .data.documents.map(site => site.name);
        },

        async submit() {
            const response = await axios
                .post(`${baseURL}/reports/transport/oil`, {
                    date:        this.date,
                    from:        this.from,
                    to:          this.to,
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
