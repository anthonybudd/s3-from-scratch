export default function errorHandler(error, cb) {
    console.error(error);

    let code = false;
    let data = {};
    if (error.response) {
        code = error.response.status;
        data = error.response.data;
    }

    if (typeof cb === 'function') cb(error, code, data);
}