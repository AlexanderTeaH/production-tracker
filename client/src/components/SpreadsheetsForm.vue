<template>
    <v-card class="ma-6">
        <v-card-title>
            <h3>Download spreadsheet</h3>
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
                                :items="spreadsheetTypes"
                                v-model="spreadsheetType"
                                label="Spreadsheet type"
                                outlined
                                required
                                :rules="[v => !!v || 'Report type is required']"
                            ></v-select>
                            <v-row>
                                <v-col v-if="spreadsheetType === 'Daily report'">
                                    <DailyReport/>
                                </v-col>
                                <v-col v-if="spreadsheetType === 'Monthly report'">
                                    <MonthlyReport/>
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
import DailyReport   from "./spreadsheets/Daily";
import MonthlyReport from "./spreadsheets/Monthly";

export default {
    name: "SpreadsheetsForm",

    components: {
        DailyReport,
        MonthlyReport
    },

    data: () => ({
        spreadsheetTypes: [
            "Daily report",
            "Monthly report"
        ],
        spreadsheetType: null
    })
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
