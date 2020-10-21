const mongoose        = require("mongoose");
const bcrypt          = require("bcrypt");
const saltRounds      = 12;
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

userSchema.pre("save", async function() {
    this.password = await bcrypt.hash(this.password, saltRounds);
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema, "users");
