const log = (...args) => {
    if (import.meta.env.VITE_NODE_ENV === 'dev') {
        console.log(...args);
    }
}

export {
    log,
}