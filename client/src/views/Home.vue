<template>
    <div class="home">
        <v-app-bar app>
                <v-toolbar-title>
                    <span>Production </span>
                    <span class="font-weight-light">Tracker</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items class="hidden-sm-and-down">
                    <v-btn text>
                        <router-link to="/">Home</router-link>
                    </v-btn>
                    <v-btn v-if="!isLoggedIn" text>
                        <router-link to="/login">Log in</router-link>
                    </v-btn>
                    <v-btn v-if="isLoggedIn" color="red" dark @click="logout">
                        Log out
                        <v-icon dark right>power_settings_new</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-app-bar>
        <ReportForm/>
    </div>
</template>

<script>
// @ is an alias to /src
import ReportForm from "@/components/ReportForm.vue";
import axios      from "axios";

const baseURL = "http://127.0.0.1";

export default {
    name: "Home",

    components: {
        ReportForm
    },

    data: () => ({
        username:   null,
        isLoggedIn: false
    }),

    created() {
        try {
            const loggedInAccount = JSON.parse(localStorage.loggedInAccount);

            if (loggedInAccount.expiry > (new Date()).getTime()) {
                this.username   = loggedInAccount.lastUsername;
                this.isLoggedIn = true;
            }
        }

        catch (error) {
            console.log(error);
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
