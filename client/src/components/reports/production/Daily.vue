<template>
    <v-container
        fluid
        ma-0
        pa-0
        fill-height
    >
        <v-row>
            <v-col>
                <v-form
                    ref="form"
                    v-model="isValid"
                    px-3
                >
                    <div v-if="formPage === 0">
                        <v-select
                            :items="wellSites"
                            v-model="wellSite"
                            label="Well site"
                            prepend-icon="place"
                            outlined
                            required
                            :rules="[v => !!v || 'Well site is required']"
                        ></v-select>
                        <v-select
                            :items="[1, 2, 3]"
                            v-model="numberOfOilTanks"
                            label="Number of oil tanks"
                            prepend-icon="local_gas_station"
                            outlined
                            required
                            :rules="[v => !!v || 'Number of oil tanks is required']"
                            :change="setNumberOfOilTanks()"
                        ></v-select>
                        <v-select
                            :items="[1, 2, 3]"
                            v-model="numberOfWaterTanks"
                            label="Number of water tanks"
                            prepend-icon="waves"
                            outlined
                            required
                            :rules="[v => !!v || 'Number of water tanks is required']"
                            :change="setNumberOfWaterTanks()"
                        ></v-select>
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
                            :items="productionPeriods"
                            v-model="productionPeriod"
                            label="Production period"
                            prepend-icon="schedule"
                            outlined
                            required
                            :rules="[v => !!v || 'Production period is required']"
                        ></v-select>
                    </div>
                    <div v-if="formPage === 1">
                        <ul class="no-bullet">
                            <li v-for="(tank, index) of tanks.oil" :key="index">
                                <v-card class="mb-5" elevattion="4">
                                    <v-card-title>
                                        Oil tank #{{index + 1}}
                                    </v-card-title>
                                    <v-card-text>
                                        <v-text-field
                                            v-model="tank.level"
                                            label="Level in tank (m)"
                                            prepend-icon="square_foot"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Level is required', numberRule]"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="tank.volume"
                                            label="Volume in tank (m³)"
                                            prepend-icon="local_gas_station"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Volume is required', numberRule]"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="tank.weight"
                                            label="Weight in tank (tons)"
                                            prepend-icon="fitness_center"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Weight is required', numberRule]"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="tank.temperature"
                                            label="Temperature (°C)"
                                            prepend-icon="filter_drama"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Temperature is required', numberRule]"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="tank.density"
                                            label="Density (g/cm³)"
                                            prepend-icon="bubble_chart"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Density is required', numberRule]"
                                        ></v-text-field>
                                    </v-card-text>
                                </v-card>
                            </li>
                        </ul>
                    </div>
                    <div v-if="formPage === 2">
                <ul class="no-bullet">
                            <li v-for="(tank, index) of tanks.water" :key="index">
                                <v-card class="mb-5" elevattion="4">
                                    <v-card-title>
                                        Water tank #{{index + 1}}
                                    </v-card-title>
                                    <v-card-text>
                                        <v-text-field
                                            v-model="tank.level"
                                            label="Level in tank (m)"
                                            prepend-icon="square_foot"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Level is required', numberRule]"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="tank.volume"
                                            label="Volume in tank (m³)"
                                            prepend-icon="local_gas_station"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Volume is required', numberRule]"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="tank.weight"
                                            label="Weight in tank (tons)"
                                            prepend-icon="fitness_center"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Weight is required', numberRule]"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="tank.density"
                                            label="Density (g/cm³)"
                                            prepend-icon="bubble_chart"
                                            outlined
                                            required
                                            :rules="[v => !!v || 'Density is required', numberRule]"
                                        ></v-text-field>
                                    </v-card-text>
                                </v-card>
                            </li>
                        </ul>
                    </div>
                    <div v-if="formPage === 3">
                        {{ JSON.stringify(this.tanks) }}
                        <v-checkbox
                            v-model="dataConfirmed"
                            label="Confirm data"
                        ></v-checkbox>
                    </div>
                    <v-row>
                        <v-col v-if="formPage !== 0">
                            <v-btn
                                x-large
                                color="primary"
                                block
                                @click="formPage--"
                            >Back</v-btn>
                        </v-col>
                        <v-col>
                            <v-btn
                                v-if="formPage !== 3"
                                x-large
                                color="primary"
                                block
                                :disabled="!isValid"
                                @click="formPage++"
                            >Continue</v-btn>
                            <v-btn
                                v-if="formPage === 3"
                                x-large
                                color="primary"
                                block
                                :disabled="!isValid"
                                @click="submit"
                            >Send report</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1";

export default {
    name: "DailyProductionReport",

    data: () => ({
        formPage:           0,
        isValid:            true,
        wellSites:          [],
        wellSite:           null,
        numberOfOilTanks:   null,
        numberOfWaterTanks: null,
        dateMenu:           false,
        date:               new Date().toISOString().split("T")[0],
        productionPeriods:  [],
        productionPeriod:   "24:00",
        tanks: {
            oil:   [],
            water: []
        },
        dataConfirmed: false,

        numberRule: (v) => {
            if (!isNaN(v)) {
                return true;
            }

            return "Value must be a number";
        }
    }),

    created() {
        for (let i = 24 * 60; i >= 0; i -= 5) {
            this.productionPeriods.push(`${Math.floor(i / 60)}:${("0" + i % 60).slice(-2)}`);
        }

        this.fetchData();
    },

    methods: {
        async fetchData() {
            this.wellSites = (await axios.get("/sites/well"))
                .data.documents.map(wellSite => wellSite.name);
        },

        async submit() {
            const [hours, minutes] = this.productionPeriod.split(":");

            const response = await axios
                .post("/reports/production/daily", {
                    wellSite:         this.wellSite,
                    date:             this.date,
                    productionPeriod: parseInt(hours) * 60 + parseInt(minutes),
                    tanks:            this.tanks
                });
            
            if (response.status == 201) {
                // Change to navigate to report submission

                this.formPage = 0;
                this.$refs.form.reset();
            }

            else {
                console.log(`Unexpected response submitting form:\n${response}`);
            }
        },

        setNumberOfOilTanks() {
            if (this.numberOfOilTanks > this.tanks.oil.length) {
                for (let i = 0; i < this.numberOfOilTanks - this.tanks.oil.length; i++) {
                    this.addOilTank();
                }
            }

            else if (this.numberOfOilTanks < this.tanks.oil.length) {
                for (let i = 0; i < this.tanks.oil.length - this.numberOfOilTanks; i++) {
                    this.removeOilTank();
                }
            }
        },

        setNumberOfWaterTanks() {
            if (this.numberOfWaterTanks > this.tanks.water.length) {
                for (let i = 0; i < this.numberOfWaterTanks - this.tanks.water.length; i++) {
                    this.addWaterTank();
                }
            }

            else if (this.numberOfWaterTanks < this.tanks.water.length) {
                for (let i = 0; i < this.tanks.water.length - this.numberOfWaterTanks; i++) {
                    this.removeWaterTank();
                }
            }
        },

        addOilTank() {
            this.tanks.oil.push({
                level:       null,
                volume:      null,
                temperature: null,
                density:     null,
                weight:      null
            });
        },

        removeOilTank() {
            this.tanks.oil.pop();
        },
        
        addWaterTank() {
            this.tanks.water.push({
                level:   null,
                volume:  null,
                density: 1.13,
                weight:  null
            });
        },

        removeWaterTank() {
            this.tanks.water.pop();
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul.no-bullet {
    list-style-type:none;
    padding: 0;
    margin: 0;
}
</style>
