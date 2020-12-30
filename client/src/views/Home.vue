<template>
    <div class="home">
        <v-app-bar app>
                <v-toolbar-title>
                    <span>Production </span>
                    <span class="font-weight-light">Tracker</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items class="hidden-sm-and-down">
                    <v-btn v-if="isLoggedIn" text @click="page = 'spreadsheetsForm'">
                        Download spreadsheets
                    </v-btn>
                    <v-btn v-if="isLoggedIn" text @click="page = 'addReport'">
                        Submit reports
                    </v-btn>
                    <v-btn v-if="!isLoggedIn" text>
                        <router-link to="/login">Log in</router-link>
                    </v-btn>
                    <v-btn v-if="isLoggedIn" text @click="logout">
                        Log out
                        <v-icon dark right>power_settings_new</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-app-bar>
        <AddReport v-if="page === 'addReport'"/>
        <SpreadsheetsForm v-if="page === 'spreadsheetsForm'"/>
    </div>
</template>

<script>
// @ is an alias to /src
import AddReport        from "@/components/AddReport.vue";
import SpreadsheetsForm from "@/components/SpreadsheetsForm.vue";
import axios            from "axios";

const baseURL = "http://127.0.0.1";

export default {
    name: "Home",

    components: {
        AddReport,
        SpreadsheetsForm
    },

    data: () => ({
        username:   null,
        isLoggedIn: false,
        page:       null
    }),

    created() {
        try {
            const loggedInAccount = JSON.parse(localStorage.loggedInAccount);

            if (loggedInAccount.expiry > (new Date()).getTime()) {
                this.username   = loggedInAccount.lastUsername;
                this.isLoggedIn = true;
            }

            else {
                this.$router.push("/login");
            }
        }

        catch (error) {
            this.$router.push("/login");
        }
    },

    methods: {
        async logout() {
            const response = await axios
                .post(`${baseURL}/users/logout`, {
                    name:     this.username,
                    password: this.password
                });

            if (response.status == 200) {
                localStorage.removeItem("loggedInAccount");
                this.$router.push("/login");
            }
        }
    }
};
</script>
