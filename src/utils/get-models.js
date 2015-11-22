import bookshelf from './database';

export default function getModel(...models) {
    return models.map((model) => {
        return bookshelf.model(model);
    });
}
