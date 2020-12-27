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
                            hide-details
                            :items="reportTypes"
                            v-model="reportType"
                            label="Report type"
                            outlined
                            required
                            :rules="[v => !!v || 'Report type is required']"
                        ></v-select>
                        <v-btn-toggle
                            v-model="reportSubtype"
                            v-if="reportType === 'Transport report'"
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
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-if="reportType !== null">
            <v-col>
                <v-card
                    class="mx-6"
                    elevation="4"
                >
                    <v-card-title>
                        <h3>{{ reportType }}</h3>
                    </v-card-title>
                    <v-card-text >
                        <ProductionReport
                            v-if="reportType == 'Production report'"
                            ref="oilProductionReport"
                        />
                        <OilTransportReport
                            v-if="reportType == 'Transport report' && reportSubtype == 'oil'"
                            ref="oilTransportReport"
                        />
                        <WaterTransportReport
                            v-if="reportType == 'Transport report' && reportSubtype == 'water'"
                            ref="waterTransportReport"
                        />
                        <WaterInjectionReport
                            v-if="reportType == 'Water injection report'"
                            ref="waterInjectionReport"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import ProductionReport   from "./reports/Production";
import OilTransportReport    from "./reports/transport/Oil";
import WaterTransportReport  from "./reports/transport/Water";
import WaterInjectionReport  from "./reports/injection/Water";

export default {
    name: "ReportForm",

    components: {
        ProductionReport,
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
