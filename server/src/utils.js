module.exports.parseDate = (dateString) => {
    if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return null;
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;
};

module.exports.parseDocument = (schema, requestBody) => {
    let document = {};

    for (const property in schema.paths) {
        if (!["_id", "__v", "createdAt", "updatedAt"].includes(property)) {
            document[property] = requestBody[property];
        }
    }

    return document;
};

module.exports.documentToJSON = (document) => {
    let summary = {
        id:        document.id,
        createdAt: document.createdAt
    };

    for (const property in document.schema.paths) {
        if (!["_id", "__v", "createdAt", "updatedAt"].includes(property)) {
            summary[property] = document[property];
        }
    }

    return summary;
};
