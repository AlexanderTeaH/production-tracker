<template>
    <v-container
        fluid
        ma-0
        pa-0
        fill-height
    >
        <v-row>
            <v-col>
                <v-card
                    class="mx-6 mt-6"
                    elevation="4"
                >
                    <v-card-title>
                        <h3>Add report</h3>
                    </v-card-title>
                    <v-card-text>
                         <v-select
                            :items="reportTypes"
                            v-model="reportType"
                            label="Choose report type"
                            outlined
                            required
                            :rules="[v => !!v || 'Report type is required']"
                        ></v-select>
                        <v-select
                            v-if="reportType === 'Production'"
                            :items="reportSubtypes['Production']"
                            v-model="reportSubtype"
                            label="Choose production report type"
                            outlined
                            required
                            :rules="[v => !!v || 'Production report type is required']"
                        ></v-select>
                        <v-select
                            v-if="reportType === 'Transport'"
                            :items="reportSubtypes['Transport']"
                            v-model="reportSubtype"
                            label="Choose transportation contents"
                            outlined
                            required
                            :rules="[v => !!v || 'Transportation contents is required']"
                        ></v-select>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-if="reportType === 'Injection' || reportType !== null && reportSubtypes[reportType].includes(reportSubtype)">
            <v-col>
                <v-card
                    class="mx-6"
                    elevation="4"
                >
                    <v-card-title>
                        <h3>Fill in information</h3>
                    </v-card-title>
                    <v-card-text >
                        <DailyProductionReport
                            v-if="reportType == 'Production' && reportSubtype == 'Daily'"
                            ref="dailyProductionReport"
                        />
                        <ShiftProductionReport
                            v-if="reportType == 'Production' && reportSubtype == 'Shift start / end'"
                            ref="dailyProductionReport"
                        />
                        <OilTransportReport
                            v-if="reportType == 'Transport' && reportSubtype == 'Oil'"
                            ref="oilTransportReport"
                        />
                        <WaterTransportReport
                            v-if="reportType == 'Transport' && reportSubtype == 'Water'"
                            ref="waterTransportReport"
                        />
                        <WaterInjectionReport
                            v-if="reportType == 'Injection'"
                            ref="waterInjectionReport"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import DailyProductionReport from "./reports/production/Daily";
import ShiftProductionReport from "./reports/production/Shift";
import OilTransportReport    from "./reports/transport/Oil";
import WaterTransportReport  from "./reports/transport/Water";
import WaterInjectionReport  from "./reports/injection/Water";

export default {
    name: "AddReport",

    components: {
        DailyProductionReport,
        ShiftProductionReport,
        OilTransportReport,
        WaterTransportReport,
        WaterInjectionReport
    },

    data: () => ({
        reportTypes: [
            "Production",
            "Transport",
            "Injection"
        ],
        reportType: null,
        reportSubtypes: {
            "Production": [
                "Daily",
                "Shift start / end"
            ],
            "Transport": [
                "Oil",
                "Water"
            ]
        },
        reportSubtype: null
    })
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
