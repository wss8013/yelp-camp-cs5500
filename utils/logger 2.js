class logger {
    constructor(tag) {this.tag = tag}

    log(level, msg) {
        const date = new Date().toISOString();
        try {
            console.log(`${date} [${level}][${this.tag}]: ${msg}`);
        } catch(err) {
            console.log(`${date} [${level}][${this.tag}]:`);
            console.log(msg);
        }
    }

    info(s) {
        this.log('INFO', s);
    }

    debug(s) {
        this.log('DEBUG', s);
    }

    error(s) {
        this.log('ERROR', s);
    }
}

module.exports = logger;