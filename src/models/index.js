import bookshelf from '../utils/database';

bookshelf.plugin('registry');

require('./ingredient')();
require('./pantry')();
require('./password-reset')();
require('./recipe')();
require('./user-recipe')();
require('./user')();
