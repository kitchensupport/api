// This doesn't really work right now; I haven't created the table yet.

import {bookshelf} from './src/utils/database';

export const Log = bookshelf.Model.extend({
    tableName: 'logs'
});
