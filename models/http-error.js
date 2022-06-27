class HttpError extends Error {
    constructor(message, errorCode){
        super(message); // Ajouter un message d'erreur
        this.code = errorCode; // Ajouter un code d'erreur
    }
}

module.exports = HttpError;