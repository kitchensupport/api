import bookshelf from './database';

export function models(...args) {
    return args.map((model) => {
        return bookshelf.model(model);
    });
};

export function collections(...args) {
    return args.map((collection) => {
        return bookshelf.collection(collection);
    });
};
