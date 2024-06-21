module.exports = {
    name: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    group: { type: Boolean, enum: ['admin', 'user'], default: 'user' },
};