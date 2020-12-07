<template>
    <v-card class="ma-6">
        <v-card-title>
            <h3>Log in</h3>
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
                            <v-text-field
                                v-model="username"
                                label="Username"
                                prepend-icon="account_circle"
                                outlined
                                required
                                :rules="[v => !!v || 'Username is required']"
                            ></v-text-field>
                            <v-text-field
                                v-model="password"
                                label="Password"
                                prepend-icon="lock"
                                outlined
                                required
                                :rules="[v => !!v || 'Password is required']"
                                :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="showPassword = !showPassword"
                            ></v-text-field>
                            <v-btn
                                x-large
                                color="primary"
                                block
                                :disabled="!isValid"
                                @click="submit"
                            >Log in</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
import axios from "axios";

const baseURL = "http://127.0.0.1";

export default {
    name: "Login",

    data: () => ({
        username:     null,
        password:     null,
        showPassword: false,
        isValid:      true
    }),

    created() {
        try {
            const loggedInAccount = JSON.parse(localStorage.loggedInAccount);

            if (loggedInAccount.expiry > (new Date()).getTime()) {
                this.$router.push("/");
            }

            else {
                this.username = loggedInAccount.lastUsername;
            }
        }

        catch (error) {
            console.log(error);
        }
    },

    methods: {
        async submit() {
            try {
                const response = await axios
                    .post(`${baseURL}/users/login`, {
                        name:     this.username,
                        password: this.password
                    });
            
                if (response.status == 200) {
                    localStorage.loggedInAccount = JSON.stringify({
                        lastUsername: this.username,
                        expiry:       (new Date()).getTime() + 16 * 60 * 60 * 1000
                    });

                    this.$router.push("/");
                }
            }

            catch (error) {
                if (error.response.status == 401) {
                    this.$refs.form.reset();
                }

                else {
                    console.log(`Unhandled error:\n${error}`);
                }
            }
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
