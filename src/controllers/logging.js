import Log from '../models/log';
import errorMessage from '../utils/error';

const Logs = Log.collection();

/**
 * Route controller that fetches logs information from the `logs` table.
 * @param  {Object} req Contains information about the HTTP request.
 * @param  {Object} res Used to send information back in response to the request.
 * @returns {undefined}
 */
export default function(req, res) {
    Logs.fetch().then((log) => {
        res.send(log);
    }).catch((err) => {
        console.log(`Error fetching logs: '${err}'.`);
        res.send(errorMessage());
    });
};
