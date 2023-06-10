const mongoose = require('mongoose');

class DatabaseManager {
    constructor(connectionString, bot) {
        this.connectionString = connectionString;
    }

    async connect() {
        try {
            await mongoose.connect(this.connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Database connection successful');
        } catch (error) {
            console.log('Database connection error', error);
        }
    }
}

module.exports = DatabaseManager;