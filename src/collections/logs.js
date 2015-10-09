import bookshelf from '../utils/database';
import Log from '../models/log';

export default bookshelf.Collection.extend({
    model: Log
});
