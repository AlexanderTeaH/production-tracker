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
                                v-if="reportType == 'Production report' || reportType == 'Transport report'"
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
                            <v-row>
                                <v-col v-if="reportType == 'Production report' && reportSubtype == 'oil'">
                                    <OilProductionReport ref="oilProductionReport"/>
                                </v-col>
                                <v-col v-if="reportType == 'Production report' && reportSubtype == 'water'">
                                    <WaterProductionReport ref="waterProductionReport"/>
                                </v-col>
                                <v-col v-if="reportType == 'Transport report' && reportSubtype == 'oil'">
                                    <OilTransportReport ref="oilTransportReport"/>
                                </v-col>
                                <v-col v-if="reportType == 'Transport report' && reportSubtype == 'water'">
                                    <WaterTransportReport ref="waterTransportReport"/>
                                </v-col>
                                <v-col v-if="reportType == 'Water injection report'">
                                    <WaterInjectionReport ref="waterInjectionReport"/>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
import OilProductionReport   from "./reports/production/Oil";
import WaterProductionReport from "./reports/production/Water";
import OilTransportReport    from "./reports/transport/Oil";
import WaterTransportReport  from "./reports/transport/Water";
import WaterInjectionReport  from "./reports/injection/Water";

export default {
    name: "ReportForm",

    components: {
        OilProductionReport,
        WaterProductionReport,
        OilTransportReport,
        WaterTransportReport,
        WaterInjectionReport
    },

    data: () => ({
        reportTypes: [
            "Production report",
            "Transport report",
            "Water injection report"
        ],
        reportType:    null,
        reportSubtype: null
    })
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
