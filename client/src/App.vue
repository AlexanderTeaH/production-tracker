<template>
    <v-app>
        <v-main>
            <ReportForm/>
        </v-main>
    </v-app>
</template>

<script>
import ReportForm from "./components/ReportForm";

export default {
    name: "App",

    components: {
        ReportForm,
    },

    data: () => ({
    //
    }),
};
</script>
